import { type Meta, type StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  TransactionProgressDialog,
  type TransactionStatus,
} from "./transactionDialog.js";
import { Button } from "@ui/lib/shadcn/button.js";

// Meta information for the story
const meta = {
  title: "Components/TransactionProgressDialog",
  component: TransactionProgressDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A dialog component that displays transaction progress and results. It supports different states (pending, success, error) and can display transaction details with block explorer links.",
      },
    },
  },
  // Adding tags for documentation
  tags: ["autodocs"],
} satisfies Meta<typeof TransactionProgressDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive demo wrapper component
const InteractiveDemo = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TransactionStatus>("idle");

  const simulateTransaction = async () => {
    setStatus("pending");
    setOpen(true);

    // Simulate transaction processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Randomly succeed or fail
    const success = Math.random() > 0.5;
    setStatus(success ? "success" : "error");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={simulateTransaction}>Simulate Transaction</Button>
      <TransactionProgressDialog
        open={open}
        onOpenChange={setOpen}
        status={status}
        title={
          status === "pending"
            ? "Processing Transaction"
            : status === "success"
              ? "Transaction Successful"
              : "Transaction Failed"
        }
        message={
          status === "pending"
            ? "Please wait while we process your transaction..."
            : status === "success"
              ? "Your transaction has been confirmed"
              : "There was an error processing your transaction"
        }
        transactionHash="0x123abc456def789"
        blockExplorerUrl="https://etherscan.io"
      />
    </div>
  );
};

// Base story configuration
const baseArgs = {
  open: true,
  onOpenChange: () => {},
  blockExplorerUrl: "https://etherscan.io",
  transactionHash: "0x123abc456def789",
};

// Stories for different states
export const Interactive: Story = {
  name: "Interactive Demo",
  render: () => <InteractiveDemo />,
  args: {
    open: true,
    onOpenChange: () => {},
    status: "idle",
    title: "Transaction Dialog",
    message: "This is a transaction dialog",
    transactionHash: "0x123abc456def789",
    blockExplorerUrl: "https://etherscan.io",
  },
  parameters: {
    docs: {
      description: {
        story:
          "An interactive demo that simulates a transaction with random success/failure outcomes. Click the button to start the simulation.",
      },
    },
  },
};

export const Pending: Story = {
  args: {
    ...baseArgs,
    status: "pending",
    title: "Processing Transaction",
    message: "Please wait while we process your transaction...",
  },
};
