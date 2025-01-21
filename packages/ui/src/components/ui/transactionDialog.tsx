import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../lib/shadcn/dialog.js";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { cn } from "../../lib/utils.js";
import { Button } from "@ui/lib/shadcn/button.js";
import { Input } from "@ui/lib/shadcn/input.js";

// Status type for the different states of a transaction
export type TransactionStatus = "pending" | "success" | "error" | "idle";

// Props interface for the transaction result component
interface TransactionResultProps {
  status: TransactionStatus;
  title: string;
  message: string;
}

// Props interface for the transaction progress dialog
export interface TransactionProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: TransactionStatus;
  title: string;
  message: string;
  transactionHash?: string;
  errorMessage?: string;
  blockExplorerUrl?: string;
}

// Component to show transaction result with appropriate icon and styling
const TransactionResult = ({
  status,
  title,
  message,
}: TransactionResultProps) => {
  const statusConfig = {
    pending: {
      icon: <ReloadIcon className="h-8 w-8 animate-spin text-blue-500" />,
      titleColor: "text-blue-500",
    },
    success: {
      icon: <CheckCircledIcon className="h-8 w-8 text-green-500" />,
      titleColor: "text-green-500",
    },
    error: {
      icon: <CrossCircledIcon className="h-8 w-8 text-red-500" />,
      titleColor: "text-red-500",
    },
    idle: {
      icon: null,
      titleColor: "text-gray-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center space-y-4 py-6">
      {config.icon && (
        <div className="rounded-full bg-background p-2">{config.icon}</div>
      )}
      <div className="text-center">
        <h3 className={cn("text-lg font-semibold", config.titleColor)}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Main transaction progress dialog component
const TransactionProgressDialog = ({
  open,
  onOpenChange,
  status,
  title,
  message,
  transactionHash,
  errorMessage,
  blockExplorerUrl,
}: TransactionProgressDialogProps) => {
  // Function to render transaction explorer link
  const renderTransactionLink = () => {
    if (!transactionHash || !blockExplorerUrl) return null;

    return (
      <div className="mt-4 text-center">
        <Input defaultValue={transactionHash} readOnly />
        <a
          href={`${blockExplorerUrl}/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:text-blue-600 underline"
        >
          View uploaded images
        </a>
      </div>
    );
  };

  // Function to handle dialog close
  const handleClose = () => {
    if (status !== "pending") {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {status === "error" ? "Transaction Failed" : "Upload folder"}
          </DialogTitle>
          <DialogDescription>
            {status === "error"
              ? "There was an error processing your transaction"
              : "Please wait while your transaction is being processed"}
          </DialogDescription>
        </DialogHeader>

        <TransactionResult
          status={status}
          title={title}
          message={status === "error" ? errorMessage || message : message}
        />

        {renderTransactionLink()}

        {status !== "pending" && (
          <div className="mt-4 flex justify-center">
            <Button
              variant={status === "success" ? "default" : "secondary"}
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

TransactionProgressDialog.displayName = "TransactionProgressDialog";

export { TransactionProgressDialog };
