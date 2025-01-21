import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@ui/lib/shadcn/button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/lib/shadcn/dialog.js";
import { Input } from "@ui/lib/shadcn/input.js";
import { Label } from "@ui/lib/shadcn/label.js";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";

// Types and validation schemas
type ActionType = "deposit" | "withdraw";

const amountSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Please enter a valid positive number" }
  ),
});

type AmountFormData = z.infer<typeof amountSchema>;

// Props interfaces for our components
interface BalancePanelProps {
  balance: number;
  symbol?: string;
  onDeposit: () => void;
  onWithdraw: () => void;
  className?: string;
}

interface ActionButtonProps {
  type: ActionType;
  onClick: () => void;
  disabled?: boolean;
}

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  type: ActionType;
  balance: number;
  symbol?: string;
}

// Balance Card Component
const BalancePanel = ({
  balance,
  symbol = "$",
  onDeposit,
  onWithdraw,
  className,
}: BalancePanelProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <span className="text-3xl font-bold">
          {balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          })}{" "}
          {symbol}
        </span>
      </div>
      <div className="flex gap-2">
        <ActionButton type="deposit" onClick={onDeposit} />
        <ActionButton
          type="withdraw"
          onClick={onWithdraw}
          disabled={balance <= 0}
        />
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({
  type,
  onClick,
  disabled = false,
}: ActionButtonProps) => {
  const config = {
    deposit: {
      text: "Deposit",
      icon: ArrowDownIcon,
      variant: "default" as const,
    },
    withdraw: {
      text: "Withdraw",
      icon: ArrowUpIcon,
      variant: "secondary" as const,
    },
  };

  const { text, icon: Icon, variant } = config[type];

  return (
    <Button
      variant={variant}
      className="flex-1"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="mr-2 h-4 w-4" />
      {text}
    </Button>
  );
};

// Action Dialog Component
const ActionDialog = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  balance,
  symbol = "$",
}: ActionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isDeposit = type === "deposit";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AmountFormData>({
    resolver: zodResolver(amountSchema),
  });

  const onFormSubmit = async (data: AmountFormData) => {
    try {
      setIsLoading(true);
      const amount = parseFloat(data.amount);

      if (!isDeposit && amount > balance) {
        throw new Error("Insufficient balance");
      }

      await onSubmit(amount);
      reset();
      onClose();
    } catch (error) {
      console.error(error);
      // Here you might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !isLoading && !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isDeposit ? "Deposit Funds" : "Withdraw Funds"}
            </DialogTitle>
            <DialogDescription>
              {isDeposit
                ? "Enter the amount you want to deposit"
                : "Enter the amount you want to withdraw"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center">
                <Button
                  asChild
                  disabled
                  variant={"outline"}
                  className="border-r-0 rounded-r-none"
                >
                  <div>{symbol}</div>
                </Button>
                <Input
                  id="amount"
                  className="rounded-l-none"
                  placeholder="0.00"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : isDeposit ? "Deposit" : "Withdraw"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Example usage component
const BalanceManager = () => {
  const [balance, setBalance] = useState(0);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: ActionType;
  }>({
    isOpen: false,
    type: "deposit",
  });

  const handleAction = async (amount: number) => {
    if (dialogState.type === "deposit") {
      setBalance((prev) => prev + amount);
    } else {
      setBalance((prev) => prev - amount);
    }
    // Here you would typically make an API call to update the balance
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
  };

  return (
    <>
      <BalancePanel
        balance={balance}
        onDeposit={() => setDialogState({ isOpen: true, type: "deposit" })}
        onWithdraw={() => setDialogState({ isOpen: true, type: "withdraw" })}
      />
      <ActionDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleAction}
        type={dialogState.type}
        balance={balance}
      />
    </>
  );
};

BalancePanel.displayName = "BalancePanel";
ActionButton.displayName = "ActionButton";
ActionDialog.displayName = "ActionDialog";
BalanceManager.displayName = "BalanceManager";

export { BalancePanel, ActionButton, ActionDialog, BalanceManager };
