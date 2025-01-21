import { useState, useCallback } from "react";
import type { Config } from "wagmi";
import { type Address, formatEther } from "viem";
import { useArweave } from "../providers/arweaveProvider.jsx";
import { useStorage } from "../providers/storageProvider.jsx";
import { processContents } from "../lib/filesystem/processContents.js";
import { IRYS_ARWEAVE_SUPPORTED_CHAINS } from "@permaupload/constants/arweave.js";

export type TransactionStatus = "pending" | "success" | "error" | "idle";

interface TransactionState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  status: TransactionStatus;
  hash: string;
  error: Error | null;
  isLoading: boolean;
}

interface UseFileUploadProps {
  address?: string;
  isConnected?: boolean;
  config: Config;
  chainId?: number;
  selectedToken?: string;
  onUploadComplete?: (manifestId: string) => void;
}

interface UseFileUploadReturn {
  transactionState: TransactionState;
  balance: bigint;
  uploadFiles: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  isRefreshing: boolean;
  refreshTrigger: number;
  handleDirectoryUpdate: () => void;
}

const RETRY_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;
const FUNDING_BUFFER = 105n; // 5% buffer

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const checkBalanceWithRetries = async (
  getBalance: () => Promise<string>,
  requiredAmount: bigint,
  retries: number = MAX_RETRIES
): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    const currentBalance = BigInt(await getBalance());
    console.log(
      `Attempt ${i + 1}: Current balance: ${formatEther(currentBalance)} ETH`
    );

    if (currentBalance >= requiredAmount) {
      return true;
    }

    if (i < retries - 1) {
      console.log(
        `Balance not sufficient yet. Waiting ${RETRY_INTERVAL / 1000} seconds before next check...`
      );
      await sleep(RETRY_INTERVAL);
    }
  }

  return false;
};

export const useFileUpload = ({
  address,
  isConnected,
  config,
  chainId,
  selectedToken,
  onUploadComplete,
}: UseFileUploadProps): UseFileUploadReturn => {
  const { fileNavigator } = useStorage();
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isOpen: false,
    setIsOpen: (open: boolean) =>
      setTransactionState((prev) => ({ ...prev, isOpen: open })),
    status: "idle",
    hash: "",
    error: null,
    isLoading: false,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { uploadFolder, balance, getPrice, fund, refetchBalance } = useArweave({
    address: address as Address | undefined,
    isConnected,
    config,
    chain: IRYS_ARWEAVE_SUPPORTED_CHAINS.find((chain) => chain.id === chainId),
    token: selectedToken,
  });

  const uploadFiles = async () => {
    if (!fileNavigator) return;

    try {
      setTransactionState((prev) => ({
        ...prev,
        isOpen: true,
        status: "pending",
        error: null,
        isLoading: true,
      }));

      const { files, totalSize } = await processContents(fileNavigator);
      const price = await getPrice(totalSize);

      console.log(
        `Files: ${files.length}, Price: ${formatEther(price)} ETH, Balance: ${formatEther(balance)} ETH`
      );

      if (price > balance) {
        console.log("Funding required. Adding 5% buffer...");
        const requiredFunding = ((price - balance) * FUNDING_BUFFER) / 100n;
        await fund(requiredFunding);

        const balanceUpdated = await checkBalanceWithRetries(
          refetchBalance,
          price
        );

        if (!balanceUpdated) {
          throw new Error(
            "Failed to confirm funding after multiple attempts. Please try again."
          );
        }
      }

      if (!files) return;
      const result = await uploadFolder(files);

      if (result.id) {
        setTransactionState((prev) => ({
          ...prev,
          status: "success",
          hash: result.manifestId,
          isLoading: false,
        }));
        setIsRefreshing(true);

        await fileNavigator.saveJsonToFile({
          fileName: "manifest.json",
          data: { ...result.manifest, manifestId: result.manifestId },
        });

        await refreshFiles();
        setIsRefreshing(false);

        onUploadComplete?.(result.manifestId);
      }
    } catch (e) {
      console.error("Upload failed:", e);
      setTransactionState((prev) => ({
        ...prev,
        status: "error",
        error: e instanceof Error ? e : new Error("Upload failed"),
        isLoading: false,
      }));
    }
  };

  const refreshFiles = useCallback(async () => {
    if (!fileNavigator) return;
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  }, [fileNavigator]);

  const handleDirectoryUpdate = useCallback(() => {
    setIsRefreshing(false);
  }, []);

  return {
    balance,
    transactionState,
    uploadFiles,
    refreshFiles,
    isRefreshing,
    refreshTrigger,
    handleDirectoryUpdate,
  };
};
