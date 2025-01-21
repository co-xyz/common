import { IRYS_ARWEAVE_SUPPORTED_CHAINS } from "@co-xyz/permaupload/constants";
import { CaretSortIcon } from "@radix-ui/react-icons";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/lib/shadcn/select.js";

interface ChainSwitcherProps {
  disabled?: boolean;
  chainId?: number;
  unsupported?: boolean;
  onChainSelect: (chainId: number) => void;
}

const ChainSwitcher = ({
  disabled,
  chainId,
  unsupported,
  onChainSelect,
}: ChainSwitcherProps) => {
  const chains = IRYS_ARWEAVE_SUPPORTED_CHAINS;

  return (
    <Select
      value={chainId?.toString()}
      onValueChange={(value) => onChainSelect(Number(value))}
      disabled={disabled}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select chain">
          <div className="flex items-center gap-2">
            <CaretSortIcon className="h-4 w-4" />
            {unsupported
              ? "Unsupported network"
              : chains.find((c) => c.id === chainId)?.name ||
                "Unsupported network"}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

ChainSwitcher.displayName = "ChainSwitcher";
export { ChainSwitcher };
