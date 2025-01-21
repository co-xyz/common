import { FileIcon, LayersIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { cn, isMedia } from "@ui/lib/utils.js";
import { type DirectoryItemProps } from "./types.js";
import { isDir, bytesToSize } from "@co-xyz/permaupload/utils";

export const DirectoryItem = ({
  entry,
  manifestInfo,
  onClick,
  isSelected,
  index,
  onSelect,
  onKeyDown,
}: DirectoryItemProps) => {
  const { handle, file } = entry;

  return (
    <li
      className={cn(
        "flex justify-between items-center p-3 rounded-md transition duration-300",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "hover:bg-accent/50",
        isSelected && "bg-accent/75"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => onKeyDown?.(e, index)}
      onClick={(e) => onSelect?.(entry, index, e)}
    >
      <div
        className="flex basis-3/4 items-center cursor-pointer"
        onClick={() => onClick(handle)}
      >
        <div className="w-8 h-8 flex items-center justify-center mr-2">
          {isDir(handle) ? (
            <LayersIcon className="h-5 w-5 text-blue-500" />
          ) : isMedia(file?.name || "") ? (
            <img
              src={URL.createObjectURL(file!)}
              alt={handle.name}
              className="h-6 w-6 object-cover rounded"
              onLoad={(e) =>
                URL.revokeObjectURL((e.target as HTMLImageElement).src)
              }
            />
          ) : (
            <FileIcon className="h-5 w-5 text-blue-500" />
          )}
        </div>
        <span className="text-sm font-medium truncate max-w-[200px]">
          {handle.name}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {file && (
          <div className="flex justify-between items-center text-sm text-muted-foreground h-6">
            {manifestInfo && (
              <a
                href={manifestInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full px-3 py-1 flex items-center gap-2 hover:bg-green-300 transition-colors rounded-full bg-green-400"
                onClick={(e) => e.stopPropagation()}
                title="View on Arweave"
              >
                <span className="text-xs leading-none uppercase font-bold text-white">
                  Uploaded
                </span>
                <ExternalLinkIcon className="h-4 w-4 text-white" />
              </a>
            )}
            <div className="flex items-center justify-between grow-0 gap-2 h-full">
              <div className="w-20 text-right leading-none">
                {bytesToSize(file.size)}
              </div>
              <time className="w-20 text-right leading-none">
                {new Date(file.lastModified).toLocaleDateString()}
              </time>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

DirectoryItem.displayName = "DirectoryItem";
