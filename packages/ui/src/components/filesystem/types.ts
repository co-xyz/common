import type { FileSystemEntryEntity } from "@co-xyz/permaupload";

export interface FileManifestInfo {
  id: string;
  url: string;
}

export interface DirectoryItemProps {
  entry: FileSystemEntryEntity;
  manifestInfo?: FileManifestInfo | null;
  currentPath: string;
  onClick: (handle: FileSystemHandle) => void;
  isSelected?: boolean;
  index: number;
  onSelect?: (
    entry: FileSystemEntryEntity,
    index: number,
    event: React.MouseEvent
  ) => void;
  onKeyDown?: (event: React.KeyboardEvent, index: number) => void;
}

export interface DirectoryHeaderProps {
  paths: string[];
  manifestId?: string;
  onNavigate: (index: number) => void;
}

export interface DirectoryContentProps {
  entries: FileSystemEntryEntity[];
  currentPath: string;
  manifestInfo?: Record<string, FileManifestInfo>;
  onEntryClick: (handle: FileSystemHandle) => void;
  onSelectionChange?: (selectedEntries: FileSystemEntryEntity[]) => void;
}

export interface DirectoryBrowserProps {
  directoryHandle: FileSystemDirectoryHandle;
  onDirectoryUpdate?: () => void;
  refreshTrigger?: number;
}

export interface UseDirectoryNavigationReturn {
  currentPath: string;
  pathItems: string[];
  entries: FileSystemEntryEntity[];
  manifestId: string | undefined;
  manifestInfo: Record<string, FileManifestInfo> | undefined;
  handleNavigate: (index: number) => Promise<void>;
  handleEntryClick: (entry: FileSystemHandle) => Promise<void>;
}
