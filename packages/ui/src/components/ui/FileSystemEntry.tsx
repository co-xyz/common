import { type FileSystemEntryEntity } from "@co-xyz/permaupload";
import { bytesToSize, isDir } from "@co-xyz/permaupload/utils";
import { FileIcon, LayersIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { isMedia } from "@ui/lib/utils.js";

interface FileSystemEntryProps {
  entry: FileSystemEntryEntity;
  currentPath: string;
  manifestInfo?: { id: string; url: string } | null;
  onClick: (handle: FileSystemHandle) => void;
}

const FileSystemEntry = ({
  entry,
  manifestInfo,
  onClick,
}: FileSystemEntryProps) => {
  const { handle, file } = entry;

  return (
    <li className="flex justify-between items-center p-3 rounded-md hover:bg-accent/50 transition duration-300">
      <div
        className="flex basis-3/4 items-center cursor-pointer"
        onClick={() => onClick(handle)}
      >
        <div className="w-8 h-8 flex items-center justify-center mr-2">
          {isDir(handle) ? (
            <LayersIcon className="h-5 w-5 text-blue-500" />
          ) : isDir(handle) ? (
            <LayersIcon className="h-6 w-6 text-blue-500" />
          ) : isMedia(file?.name || "") ? (
            <img src={URL.createObjectURL(file!)} alt={handle.name} />
          ) : (
            <FileIcon className="h-6 w-6 text-blue-500" />
          )}
        </div>
        <div>{handle.name}</div>
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
                <span className="text-xs leading-0 uppercase font-bold text-white">
                  Uploaded
                </span>
                <ExternalLinkIcon className="h-4 w-4 text-white" />
              </a>
            )}
            <div className="flex items-center justify-between grow-0 gap-2 h-full">
              <div className="w-20 text-right leading-0">
                {bytesToSize(file.size)}
              </div>
              <time className="w-20 text-right leading-0">
                {new Date(file.lastModified).toLocaleDateString()}
              </time>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

FileSystemEntry.displayName = "FileSystemEntry";

export { FileSystemEntry };
