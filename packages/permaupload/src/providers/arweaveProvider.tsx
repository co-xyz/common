import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { WebIrys } from "@irys/sdk";
import { type Address, type Chain, type Hex, zeroAddress } from "viem";
import { type Config, useConfig, useConnections } from "wagmi";
import type {
  CreateAndUploadOptions,
  FundResponse,
  Manifest,
  UploadOptions,
  UploadResponse,
  WithdrawalResponse,
} from "@irys/sdk/build/cjs/common/types";
import { getEthersProvider } from "../lib/ethers/getEthersProvider.js";
import { waitForTransactionReceipt } from "@wagmi/core";

interface ArweaveContextState {
  irys: WebIrys | null;
  balance: bigint;
  error: Error | null;
  isLoading: boolean;
}

interface ArweaveActions {
  initializeIrys: (
    account: Address,
    config: Config,
    chain?: Chain,
    token?: string
  ) => Promise<void>;
  upload: (
    file: File,
    opts?: CreateAndUploadOptions
  ) => Promise<UploadResponse>;
  uploadFolder: (
    files: File[],
    opts?: UploadOptions
  ) => Promise<
    UploadResponse & {
      manifest: Manifest;
      manifestId: string;
    }
  >;
  refetchBalance: () => Promise<string>;
  getPrice: (bytes: number) => Promise<bigint>;
  fund: (amount: bigint) => Promise<FundResponse | undefined>;
  withdraw: (amount: bigint) => Promise<WithdrawalResponse | undefined>;
  wipeState: () => void;
}

interface ArweaveContextValue {
  state: ArweaveContextState;
  actions: ArweaveActions;
}

const ArweaveContext = createContext<ArweaveContextValue | null>(null);

export const ArweaveProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const config = useConfig();
  const [state, setState] = React.useState<ArweaveContextState>({
    irys: null,
    balance: 0n,
    error: null,
    isLoading: false,
  });

  const initializeIrys = useCallback(
    async (account: Address, config: Config, chain?: Chain, token?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const provider = await getEthersProvider(config, {
          account,
          chainId: chain?.id,
        });
        if (!provider) throw new Error("Failed to get provider");

        const webIrys = new WebIrys({
          url: "https://node2.irys.xyz",
          token: token || "ethereum",
          wallet: { name: "ethers5", provider },
          config: {
            timeout: 60000,
            debug: true,
          },
        });

        const initializedIrys = await webIrys.ready();
        if (!initializedIrys) throw new Error("Failed to initialize Irys");

        const loadedBalance = await initializedIrys.getLoadedBalance();
        const balanceStr = loadedBalance.toString();

        setState({
          irys: initializedIrys,
          balance: BigInt(balanceStr),
          error: null,
          isLoading: false,
        });
      } catch (err) {
        console.error("Irys initialization error:", err);
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error ? err : new Error("Failed to initialize Irys"),
          isLoading: false,
        }));
      }
    },
    []
  );

  const wipeState = useCallback(() => {
    setState({
      irys: null,
      balance: 0n,
      error: null,
      isLoading: false,
    });
  }, []);

  const getPrice = useCallback(
    async (bytes: number): Promise<bigint> => {
      if (!state.irys) {
        throw new Error("Irys not initialized");
      }
      const price = await state.irys.getPrice(bytes);
      return BigInt(price.toString());
    },
    [state.irys]
  );

  const refetchBalance = useCallback(async () => {
    if (!state.irys) {
      throw new Error("Irys not initialized");
    }
    const newBalance = await state.irys.getLoadedBalance();
    setState((prev) => ({ ...prev, balance: BigInt(newBalance.toString()) }));
    return newBalance.toString();
  }, []);

  const upload = useCallback(
    async (
      file: File,
      opts?: CreateAndUploadOptions
    ): Promise<UploadResponse> => {
      if (!state.irys) {
        throw new Error("Irys not initialized");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = state.irys!.upload(Buffer.from(arrayBuffer), opts);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setState((prev) => ({ ...prev, error }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.irys]
  );

  const uploadFolder = useCallback(
    async (
      files: File[],
      opts?: UploadOptions
    ): Promise<
      UploadResponse & {
        manifest: Manifest;
        manifestId: string;
      }
    > => {
      if (!state.irys) {
        throw new Error("Irys not initialized");
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const uploader = state.irys.uploader;
        uploader.useChunking = true;
        uploader.chunkedUploader.on("done", (progress) => {
          console.log("Progress", progress);
        });
        const result = await uploader.uploadFolder(files, opts);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setState((prev) => ({ ...prev, error }));
        throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.irys]
  );

  const fund = useCallback(
    async (amount: bigint): Promise<FundResponse | undefined> => {
      if (!state.irys) {
        throw new Error("Irys not initialized");
      }

      try {
        const response = await state.irys.fund(amount.toString());
        const newBalance = await state.irys.getLoadedBalance();
        setState((prev) => ({
          ...prev,
          balance: BigInt(newBalance.toString()),
        }));
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Funding failed");
        setState((prev) => ({ ...prev, error }));
        throw error;
      }
    },
    [state.irys]
  );

  const withdraw = useCallback(
    async (amount: bigint) => {
      if (!state.irys) {
        throw new Error("Irys not initialized");
      }

      if (state.balance < amount) {
        throw new Error("Insufficient balance");
      }

      try {
        const response = await state.irys.withdrawBalance(amount.toString());
        await waitForTransactionReceipt(config, {
          hash: response.tx_id as Hex,
        });
        const newBalance = await state.irys.getLoadedBalance();
        setState((prev) => ({
          ...prev,
          balance: BigInt(newBalance.toString()),
        }));
        return response;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Withdrawal failed");
        setState((prev) => ({ ...prev, error }));
        throw error;
      }
    },
    [state.irys, state.balance]
  );

  const value = useMemo(
    () => ({
      state,
      actions: {
        initializeIrys,
        upload,
        uploadFolder,
        getPrice,
        fund,
        wipeState,
        refetchBalance,
        withdraw,
      },
    }),
    [
      state,
      initializeIrys,
      upload,
      uploadFolder,
      getPrice,
      fund,
      wipeState,
      refetchBalance,
      withdraw,
    ]
  );

  return (
    <ArweaveContext.Provider value={value}>{children}</ArweaveContext.Provider>
  );
};

interface UseArweaveConfig {
  address?: Address;
  isConnected?: boolean;
  config: Config;
  chain?: Chain;
  token?: string;
}

export const useArweave = ({
  address = zeroAddress,
  isConnected,
  config,
  chain,
  token,
}: UseArweaveConfig) => {
  const context = useContext(ArweaveContext);
  if (!context) {
    throw new Error("useArweave must be used within ArweaveProvider");
  }
  const connections = useConnections();

  const { state, actions } = context;

  useEffect(() => {
    if (!chain) {
      actions.wipeState();
      return;
    }
    if (!connections[0]?.connector?.getChainId?.()) return;

    if (isConnected) actions.initializeIrys(address, config, chain, token);
  }, [connections, address, isConnected, chain, config, token]);

  return {
    ...state,
    ...actions,
  };
};

ArweaveProvider.displayName = "ArweaveProvider";
