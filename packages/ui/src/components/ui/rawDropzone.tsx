import React, { useCallback, useRef, useState } from "react";
import { cn } from "../../lib/utils.js";
import { LayersIcon, UploadIcon } from "@radix-ui/react-icons";
import { Button } from "@ui/lib/shadcn/button.js";

interface DropzoneProps {
  onFolderSelect: (files: FileList) => void;
  className?: string;
  disabled?: boolean;
}

interface UseDropzoneReturn {
  isDragActive: boolean;
  handleDrop: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleDragEnter: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
}

const useDropzone = (
  onFolderSelect: (files: FileList) => void,
  disabled?: boolean
): UseDropzoneReturn => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);

      if (disabled) return;

      const items = event.dataTransfer.items;
      if (!items) return;

      // Get all files from the dropped folder
      const traverseFileTree = async (item: any) => {
        const files: File[] = [];
        if (item.isFile) {
          const file = await new Promise<File>((resolve) => {
            item.file((file: File) => resolve(file));
          });
          files.push(file);
        } else if (item.isDirectory) {
          const dirReader = item.createReader();
          const entries = await new Promise<any[]>((resolve) => {
            dirReader.readEntries((entries: any[]) => resolve(entries));
          });
          for (const entry of entries) {
            files.push(...(await traverseFileTree(entry)));
          }
        }
        return files;
      };

      const processItems = async () => {
        const files: File[] = [];
        for (const item of Array.from(items)) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            files.push(...(await traverseFileTree(entry)));
          }
        }
        const fileList = new DataTransfer();
        files.forEach((file) => fileList.items.add(file));
        onFolderSelect(fileList.files);
      };

      processItems();
    },
    [onFolderSelect, disabled]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragActive(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);

  return {
    isDragActive,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
  };
};

const RawDropzone = ({
  onFolderSelect,
  className,
  disabled = false,
}: DropzoneProps) => {
  const {
    isDragActive,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
  } = useDropzone(onFolderSelect, disabled);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleFolderSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        onFolderSelect(files);
      }
    },
    [onFolderSelect]
  );

  return (
    <div
      className={cn(
        "relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors",
        isDragActive && "border-primary bg-primary/5",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
        <div className="flex items-center justify-center space-x-2">
          {isDragActive ? (
            <UploadIcon className="h-8 w-8 text-primary" />
          ) : (
            <LayersIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop your folder here"
              : "Drag and drop a folder, or click to select"}
          </p>
        </div>
        <input
          ref={(node) => {
            inputRef.current = node;

            if (node) {
              ["webkitdirectory", "directory", "mozdirectory"].forEach(
                (attr) => {
                  node.setAttribute(attr, "");
                }
              );
            }
          }}
          type="file"
          className="hidden"
          onChange={(e) => {
            handleFolderSelect(e as any);
          }}
        />
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          Select Folder
        </Button>
      </div>
    </div>
  );
};

export { RawDropzone };
