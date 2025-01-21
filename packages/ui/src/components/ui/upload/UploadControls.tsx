import { Button } from "@ui/lib/shadcn/button.js";

interface UploadControlsProps {
  isUploading: boolean;
  isRefreshing: boolean;
  permissionGranted: boolean;
  onUpload: () => void;
  onChooseDirectory: () => void;
  onRefresh: () => void;
}

const UploadControls = ({
  isUploading,
  isRefreshing,
  permissionGranted,
  onUpload,
  onChooseDirectory,
  onRefresh,
}: UploadControlsProps) => {
  return (
    <div className="flex gap-2 justify-center mb-4">
      <Button
        size="lg"
        onClick={onUpload}
        disabled={isUploading || !permissionGranted}
      >
        {isUploading ? "Processing..." : "Upload folder"}
      </Button>

      <Button size="lg" onClick={onChooseDirectory} variant="outline">
        Choose Directory
      </Button>

      <Button
        size="lg"
        onClick={onRefresh}
        variant="ghost"
        disabled={isUploading || !permissionGranted || isRefreshing}
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
};

UploadControls.displayName = "UploadControls";

export { UploadControls };
export type { UploadControlsProps };
