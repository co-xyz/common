import type { Meta, StoryObj } from "@storybook/react";
import {
  BalancePanel,
  ActionButton,
  ActionDialog,
  BalanceManager,
} from "./balancePanel.js";
import { useState } from "react";

const meta = {
  title: "Components/Balance",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

// BalancePanel Stories
export const DefaultBalancePanel: StoryObj = {
  render: () => (
    <BalancePanel
      balance={1234.56}
      onDeposit={() => alert("Deposit clicked")}
      onWithdraw={() => alert("Withdraw clicked")}
    />
  ),
};

export const EmptyBalancePanel: StoryObj = {
  render: () => (
    <BalancePanel
      balance={0}
      onDeposit={() => alert("Deposit clicked")}
      onWithdraw={() => alert("Withdraw clicked")}
    />
  ),
};

// Action Button Stories
export const DepositButton: StoryObj = {
  render: () => (
    <ActionButton type="deposit" onClick={() => alert("Deposit clicked")} />
  ),
};

export const WithdrawButton: StoryObj = {
  render: () => (
    <ActionButton type="withdraw" onClick={() => alert("Withdraw clicked")} />
  ),
};

// Dialog Stories
const DialogDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setType("deposit");
            setIsOpen(true);
          }}
        >
          Show Deposit Dialog
        </button>
        <button
          onClick={() => {
            setType("withdraw");
            setIsOpen(true);
          }}
        >
          Show Withdraw Dialog
        </button>
      </div>
      <ActionDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={async (amount) => {
          alert(
            `${type === "deposit" ? "Depositing" : "Withdrawing"} $${amount}`
          );
          setIsOpen(false);
        }}
        type={type}
        balance={1000}
      />
    </div>
  );
};

export const DialogExample: StoryObj = {
  render: () => <DialogDemo />,
};

// Full Balance Manager Story
export const FullExample: StoryObj = {
  render: () => <BalanceManager />,
};
