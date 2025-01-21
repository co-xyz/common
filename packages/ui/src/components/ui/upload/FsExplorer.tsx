import { useState, useCallback } from "react";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@ui/lib/shadcn/card.js";
import { TransactionProgressDialog } from "../transactionDialog.js";
import { DirectoryView } from "../DirectoryView.js";
import { NetworkPanel } from "./NetworkPanel.js";
import { UploadControls } from "./UploadControls.js";
import { ActionDialog, BalancePanel } from "./balance/balancePanel.js";
import { formatEther } from "viem";
import { useStorage } from "@co-xyz/permaupload";
import { IRYS_TOKENS_EVM } from "@co-xyz/permaupload/constants";
import { useFileUpload } from "@co-xyz/permaupload/hooks";

interface FsExplorerProps {
  onUploadComplete?: (manifestId: string) => void;
}

const FsExplorer = ({ onUploadComplete }: FsExplorerProps) => {
  const config = useConfig();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { root, permissionGranted, chooseDirectory } = useStorage();

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "deposit" | "withdraw";
  }>({
    isOpen: false,
    type: "deposit",
  });

  const [selectedToken, setSelectedToken] = useState(() => {
    return IRYS_TOKENS_EVM.find((token) => token.chain.id === chainId)?.id;
  });

  const token = IRYS_TOKENS_EVM.find((token) => token.id === selectedToken);

  const {
    transactionState,
    uploadFiles,
    refreshFiles,
    isRefreshing,
    refreshTrigger,
    handleDirectoryUpdate,
    balance,
  } = useFileUpload({
    address,
    isConnected,
    config,
    chainId,
    selectedToken,
    onUploadComplete,
  });

  const handleChainSelect = useCallback(
    async (selectedChainId: number) => {
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
    },
    [chainId, switchChainAsync]
  );

  return (
    <main className="flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white shadow-md p-5 min-h-screen">
        <div className="mb-4 flex gap-4">
          <Card>
            <CardContent>
              <NetworkPanel
                address={address}
                isConnected={isConnected}
                chainId={chainId}
                selectedToken={selectedToken}
                onChainSelect={handleChainSelect}
                onTokenSelect={setSelectedToken}
              />
            </CardContent>
          </Card>
          <Card className="pt-6">
            <div className="px-6 pb-4">
              <CardTitle>Balance</CardTitle>
              <CardDescription>
                Your current balance on the{" "}
                <b>
                  Irys <i>Arweave</i> Node
                </b>
              </CardDescription>
            </div>
            <CardContent>
              <BalancePanel
                balance={+formatEther(balance)}
                symbol={token?.symbol}
                onDeposit={() =>
                  setDialogState({ isOpen: true, type: "deposit" })
                }
                onWithdraw={() =>
                  setDialogState({ isOpen: true, type: "withdraw" })
                }
              />
            </CardContent>
          </Card>
        </div>

        <UploadControls
          isUploading={transactionState.isLoading}
          isRefreshing={isRefreshing}
          permissionGranted={permissionGranted}
          onUpload={uploadFiles}
          onChooseDirectory={chooseDirectory}
          onRefresh={refreshFiles}
        />

        {root && permissionGranted && (
          <DirectoryView
            directoryHandle={root}
            onDirectoryUpdate={handleDirectoryUpdate}
            refreshTrigger={refreshTrigger}
          />
        )}

        <TransactionProgressDialog
          open={transactionState.isOpen}
          onOpenChange={transactionState.setIsOpen}
          status={transactionState.status}
          title="Upload"
          message={
            transactionState.status === "success"
              ? "Files uploaded to Arweave"
              : "Uploading files to Arweave..."
          }
          errorMessage={transactionState.error?.message}
          transactionHash={transactionState.hash}
          blockExplorerUrl="https://node2.irys.xyz"
        />
      </div>
      <ActionDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={async (amount) => {}}
        type={dialogState.type}
        balance={+formatEther(balance)}
        symbol={token?.symbol}
      />
    </main>
  );
};

FsExplorer.displayName = "FsExplorer";

export { FsExplorer };
export type { FsExplorerProps };
