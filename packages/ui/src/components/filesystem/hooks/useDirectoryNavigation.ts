import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  FileManifestInfo,
  UseDirectoryNavigationReturn,
} from "../types.js";
import { type FileSystemEntryEntity, FileNavigator } from "@co-xyz/permaupload";
import { readManifest, isDir, getFilePath } from "@co-xyz/permaupload/utils";

export const useDirectoryNavigation = (
  rootHandle: FileSystemDirectoryHandle,
  refreshTrigger = 0
): UseDirectoryNavigationReturn => {
  const [entries, setEntries] = useState<FileSystemEntryEntity[]>([]);
  const [manifestId, setManifestId] = useState<string | undefined>();
  const [manifestInfo, setManifestInfo] =
    useState<Record<string, FileManifestInfo>>();

  const fileNavigator = useMemo(
    () => new FileNavigator(rootHandle),
    [rootHandle]
  );

  const pathItems = useMemo(() => fileNavigator.getPathItems(), [entries]);
  const currentPath = useMemo(() => pathItems.slice(1).join("/"), [pathItems]);

  const refreshContents = useCallback(async () => {
    const contents = await fileNavigator.getContents();
    const manifest = await readManifest(fileNavigator);
    setManifestId(manifest?.manifestId);

    // Create a mapping of file paths to their manifest info
    const manifestMapping: Record<string, FileManifestInfo> = {};
    if (manifest) {
      contents.forEach((entry) => {
        if (!entry.file) return;
        const info = getFilePath(entry, currentPath, manifest);
        if (info) {
          manifestMapping[entry.handle.name] = info;
        }
      });
    }

    setManifestInfo(manifestMapping);
    setEntries(
      contents.sort((a, b) => {
        const aIsDir = isDir(a.handle);
        const bIsDir = isDir(b.handle);
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.handle.name.localeCompare(b.handle.name);
      })
    );
  }, [fileNavigator, currentPath]);

  const handleNavigate = useCallback(
    async (index: number) => {
      // Reset to root if needed
      while (!fileNavigator.isRoot()) {
        fileNavigator.goUp();
      }

      // Navigate to the selected path
      for (let i = 1; i <= index; i++) {
        const path = pathItems[i] ?? "";
        await fileNavigator.goDown(path);
      }

      await refreshContents();
    },
    [fileNavigator, pathItems, refreshContents]
  );

  const handleEntryClick = useCallback(
    async (entry: FileSystemHandle) => {
      try {
        if (!(entry instanceof FileSystemDirectoryHandle)) {
          console.log("Not a directory");
          return;
        }
        await fileNavigator.goDown(entry.name);
        await refreshContents();
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    },
    [fileNavigator, refreshContents]
  );

  useEffect(() => {
    refreshContents();
  }, [rootHandle, refreshContents, refreshTrigger]);

  return {
    manifestId,
    currentPath,
    pathItems,
    entries,
    manifestInfo,
    handleNavigate,
    handleEntryClick,
  };
};
