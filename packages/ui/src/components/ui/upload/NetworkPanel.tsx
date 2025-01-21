import { useConnect } from "wagmi";
import { Button } from "@ui/lib/shadcn/button.js";
import { ChainSwitcher } from "../chainSwitcher.js";
import { CurrencySwitcher } from "../currencySwitcher.js";
import { IRYS_ARWEAVE_SUPPORTED_CHAINS } from "@co-xyz/permaupload/constants";

interface NetworkPanelProps {
  address?: string;
  isConnected?: boolean;
  chainId?: number;
  selectedToken?: string;
  onChainSelect: (chainId: number) => void;
  onTokenSelect: (tokenId: string) => void;
}

const NetworkPanel = ({
  address,
  isConnected,
  chainId,
  selectedToken,
  onChainSelect,
  onTokenSelect,
}: NetworkPanelProps) => {
  const { connectors, connect } = useConnect();

  if (!isConnected) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ChainSwitcher
          chainId={chainId}
          unsupported={
            IRYS_ARWEAVE_SUPPORTED_CHAINS.find((c) => c.id === chainId) ===
            undefined
          }
          onChainSelect={onChainSelect}
        />
        <CurrencySwitcher
          chainId={chainId}
          selectedTokenId={selectedToken}
          onTokenSelect={onTokenSelect}
        />
      </div>
    </div>
  );
};

NetworkPanel.displayName = "NetworkPanel";

export { NetworkPanel };
export type { NetworkPanelProps };
