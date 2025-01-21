import { TokensIcon } from "@radix-ui/react-icons";

import { IRYS_TOKENS_EVM } from "@co-xyz/permaupload/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/lib/shadcn/select.js";

interface CurrencySwitcherProps {
  disabled?: boolean;
  chainId?: number;
  selectedTokenId?: string;
  onTokenSelect: (tokenId: string) => void;
}

const CurrencySwitcher = ({
  disabled,
  chainId,
  selectedTokenId,
  onTokenSelect,
}: CurrencySwitcherProps) => {
  const availableTokens = IRYS_TOKENS_EVM.filter(
    (token) => token.chain.id === chainId
  );

  if (availableTokens.length <= 1) {
    return (
      <div className="w-40 px-3 py-2 text-sm text-muted-foreground border rounded-md flex items-center gap-2">
        <TokensIcon className="h-4 w-4" />
        {availableTokens[0]?.symbol || "No tokens"}
      </div>
    );
  }

  return (
    <Select
      value={selectedTokenId}
      onValueChange={onTokenSelect}
      disabled={disabled}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select token">
          <div className="flex items-center gap-2">
            <TokensIcon className="h-4 w-4" />
            {availableTokens.find((t) => t.id === selectedTokenId)?.symbol ||
              "Select Token"}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableTokens.map((token) => (
          <SelectItem key={token.id} value={token.id}>
            <div className="flex items-center justify-between">
              <span>{token.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

CurrencySwitcher.displayName = "CurrencySwitcher";

export { CurrencySwitcher };
