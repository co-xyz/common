import { useAccount, useConnect, useConfig, useSwitchChain } from "wagmi";
import { formatEther, formatUnits } from "viem";
import { DirectoryView } from "./DirectoryView.js";
import { Button } from "@ui/lib/shadcn/button.js";
import { ChainSwitcher } from "./chainSwitcher.js";
import {
  IRYS_TOKENS_EVM,
  IRYS_ARWEAVE_SUPPORTED_CHAINS,
} from "@co-xyz/permaupload/constants";
import { Card, CardContent } from "@ui/lib/shadcn/card.js";
import { CurrencySwitcher } from "./currencySwitcher.js";
import { useState, useCallback } from "react";
import {
  TransactionProgressDialog,
  type TransactionStatus,
} from "./transactionDialog.js";
import {
  useStorage,
  useArweave,
  FileNavigator,
  createFileWithPath,
} from "@co-xyz/permaupload";

interface FileAccumulator {
  files: File[];
  totalSize: number;
}

const processContents = async (
  navigator: FileNavigator,
  currentPath: string = "",
  accumulator: FileAccumulator = { files: [], totalSize: 0 }
): Promise<FileAccumulator> => {
  const contents = await navigator.getContents();

  return contents.reduce(async (promiseAcc, entry) => {
    const acc = await promiseAcc;
    if (entry.file) {
      const relativePath = currentPath
        ? `${currentPath}/${entry.file.name}`
        : entry.file.name;

      const item = createFileWithPath(entry.file, relativePath);

      acc.files.push(item);
      acc.totalSize += entry.file.size;
    } else if (entry.handle instanceof FileSystemDirectoryHandle) {
      try {
        await navigator.goDown(entry.handle.name);
        const newPath = currentPath
          ? `${currentPath}/${entry.handle.name}`
          : entry.handle.name;
        const subDirResults = await processContents(navigator, newPath);

        acc.files.push(...subDirResults.files);
        acc.totalSize += subDirResults.totalSize;

        navigator.goUp();
      } catch (error) {
        console.warn(
          `Failed to process directory ${entry.handle.name}:`,
          error
        );
      }
    }

    return acc;
  }, Promise.resolve(accumulator));
};

const FsPlayground = () => {
  const {
    root,
    fileNavigator,
    error: storageError,
    permissionGranted,
    chooseDirectory,
  } = useStorage();

  const config = useConfig();
  const { address, isConnected, chainId } = useAccount();
  const { connectors, connect } = useConnect();
  const { switchChainAsync } = useSwitchChain();

  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>("idle");
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionError, setTransactionError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [selectedToken, setSelectedToken] = useState(() => {
    const defaultToken = IRYS_TOKENS_EVM.find(
      (token) => token.chain.id === chainId
    );
    return defaultToken?.id;
  });

  const handleChainSelect = async (selectedChainId: number) => {
    if (selectedChainId === chainId) return;
    try {
      await switchChainAsync({ chainId: selectedChainId });
      const defaultToken = IRYS_TOKENS_EVM.find(
        (token) => token.chain.id === selectedChainId
      );
      setSelectedToken(defaultToken?.id);
    } catch (e) {
      console.error("Failed to switch chain:", e);
    }
  };

  const {
    uploadFolder,
    balance,
    getPrice,
    fund,
    isLoading,
    error: arweaveError,
  } = useArweave({
    address,
    isConnected,
    config,
    chain: IRYS_ARWEAVE_SUPPORTED_CHAINS.find((chain) => chain.id === chainId),
    token: selectedToken,
  });

  const handleRefresh = useCallback(async () => {
    if (!fileNavigator) return;
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
  }, [fileNavigator]);

  const handleDirectoryUpdate = useCallback(() => {
    setIsRefreshing(false);
  }, []);

  const handleArweaveUpload = async () => {
    if (!fileNavigator) return;

    try {
      setTransactionError("");
      setTransactionOpen(true);
      setTransactionStatus("pending");
      const { files, totalSize } = await processContents(fileNavigator);

      const price = await getPrice(totalSize);
      console.log(
        `Files: ${files.length}, Price: ${formatEther(price)} ETH, Balance: ${formatEther(balance)} ETH`
      );

      if (price > balance) {
        console.log("Funding required. Adding 5% buffer...");
        await fund(((price - balance) * 105n) / 100n);
      }

      if (!files) return;
      const result = await uploadFolder(files);

      if (result.id) {
        setTransactionStatus("success");
        setTransactionHash(result.manifestId);
        setIsRefreshing(true);

        // Save manifest and trigger refresh
        await fileNavigator.saveJsonToFile({
          fileName: "manifest.json",
          data: result.manifest,
        });
      }
    } catch (e) {
      console.error("Upload failed:", e);
      setTransactionStatus("error");
      if (e instanceof Error) setTransactionError(e.message);
    }
  };

  return (
    <main className="flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-md p-5 min-h-screen">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {isConnected ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <span className="text-sm">
                      {formatUnits(balance, 18)} ETH
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChainSwitcher
                      chainId={chainId}
                      unsupported={
                        IRYS_ARWEAVE_SUPPORTED_CHAINS.find(
                          (c) => c.id === chainId
                        ) === undefined
                      }
                      onChainSelect={handleChainSelect}
                      disabled={isLoading}
                    />
                    <CurrencySwitcher
                      chainId={chainId}
                      selectedTokenId={selectedToken}
                      onTokenSelect={setSelectedToken}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {connectors.map((connector) => (
                    <Button
                      key={connector.uid}
                      onClick={() => connect({ connector })}
                      variant="outline"
                      size="sm"
                    >
                      {connector.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-center mb-4">
          <Button
            size="lg"
            onClick={handleArweaveUpload}
            disabled={isLoading || !address || !permissionGranted}
          >
            {isLoading ? "Processing..." : "Upload folder"}
          </Button>
          <Button size="lg" onClick={chooseDirectory} variant="outline">
            Choose Directory
          </Button>
          <Button
            size="lg"
            onClick={handleRefresh}
            variant="ghost"
            disabled={isLoading || !permissionGranted || isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {(storageError || arweaveError) && (
          <section className="flex flex-col items-center mt-4">
            <h1 className="text-lg font-medium text-red-600">
              Oops! There seems to be an error
            </h1>
            <p className="text-gray-600">
              Please check the console for details
            </p>
          </section>
        )}

        {root && permissionGranted && (
          <DirectoryView
            directoryHandle={root}
            onDirectoryUpdate={handleDirectoryUpdate}
            refreshTrigger={refreshTrigger}
          />
        )}

        <TransactionProgressDialog
          open={transactionOpen}
          onOpenChange={setTransactionOpen}
          status={transactionStatus}
          title="Upload"
          message={
            transactionStatus === "success"
              ? "Files uploaded to Arweave"
              : "Uploading files to Arweave..."
          }
          errorMessage={transactionError}
          transactionHash={transactionHash}
          blockExplorerUrl="https://node2.irys.xyz"
        />
      </div>
    </main>
  );
};

FsPlayground.displayName = "FsPlayground";

export default FsPlayground;
