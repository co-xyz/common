import { useState, useEffect, useMemo, useCallback } from "react";
import { FileNavigator } from "@co-xyz/permaupload";
import { FilePathBreadcrumb } from "./fsBreadcrumb.js";
import { type FileSystemEntryEntity } from "@co-xyz/permaupload";
import {
  type ManifestData,
  readManifest,
  getFilePath,
  isDir,
} from "@co-xyz/permaupload/utils";
import { FileSystemEntry } from "./FileSystemEntry.js";
import { Input } from "@ui/lib/shadcn/input.js";
import { Label } from "@ui/lib/shadcn/label.js";
import { CopyIcon } from "@radix-ui/react-icons";
import { Button } from "@ui/lib/shadcn/button.js";

interface DirectoryViewProps {
  directoryHandle: FileSystemDirectoryHandle;
  onDirectoryUpdate?: () => void;
  refreshTrigger?: number;
}

export const DirectoryView = ({
  directoryHandle: rootHandle,
  onDirectoryUpdate,
  refreshTrigger = 0,
}: DirectoryViewProps) => {
  const [directoryEntries, setDirectoryEntries] = useState<
    FileSystemEntryEntity[]
  >([]);
  const [manifest, setManifest] = useState<ManifestData | null>(null);

  const fileNavigator = useMemo(
    () => new FileNavigator(rootHandle),
    [rootHandle]
  );

  const pathItems = useMemo(
    () => fileNavigator.getPathItems(),
    [directoryEntries]
  );
  const currentPath = useMemo(() => pathItems.slice(1).join("/"), [pathItems]);

  const refreshContents = useCallback(async () => {
    const contents = await fileNavigator.getContents();

    // Try to read manifest from root directory
    let manifestData = null;
    const currentDir = fileNavigator.getCurrentDirectory();

    if (currentDir === rootHandle) {
      manifestData = await readManifest(fileNavigator);
    } else {
      // Store current position
      const currentPath = fileNavigator.getPathItems();

      // Navigate to root
      while (!fileNavigator.isRoot()) {
        fileNavigator.goUp();
      }

      // Read manifest from root
      manifestData = await readManifest(fileNavigator);

      // Navigate back to original position
      for (let i = 1; i < currentPath.length; i++) {
        const path = currentPath[i] ?? "";
        await fileNavigator.goDown(path);
      }
    }

    setDirectoryEntries(contents);
    setManifest(manifestData);
    onDirectoryUpdate?.();
  }, [fileNavigator, rootHandle, onDirectoryUpdate]);

  const handleNavigate = useCallback(
    async (index: number) => {
      // Reset to root if needed
      while (!fileNavigator.isRoot()) {
        fileNavigator.goUp();
      }

      // Navigate to the selected path
      for (let i = 1; i <= index - 1; i++) {
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
          return;
        }
        await fileNavigator.goDown(entry.name);
        await refreshContents();
      } catch (error) {
        console.error(error);
      }
    },
    [fileNavigator, refreshContents]
  );

  useEffect(() => {
    refreshContents();
  }, [rootHandle, refreshContents, refreshTrigger]);

  const sortedEntries = useMemo(() => {
    return directoryEntries.sort((a, b) => {
      const aIsDir = isDir(a.handle);
      const bIsDir = isDir(b.handle);

      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;

      return a.handle.name.localeCompare(b.handle.name);
    });
  }, [directoryEntries]);

  return (
    <div className="mx-auto max-w-screen-md">
      <div className="mb-4 flex justify-between">
        <FilePathBreadcrumb
          paths={pathItems}
          onNavigate={handleNavigate}
          className="mb-4"
        />
        {manifest?.manifestId && (
          <div>
            <Label htmlFor="permalink">Permalink</Label>
            <div className="flex items-center">
              <Input
                id="permalink"
                className="font-mono rounded-r-none"
                readOnly
                onClick={(e) => {
                  e.currentTarget.select();
                }}
                defaultValue={`ar://${manifest.manifestId}/`}
              />
              <Button
                variant={"outline"}
                className="border-l-0 rounded-l-none"
                onClick={() =>
                  navigator.clipboard.writeText(`ar://${manifest.manifestId}/`)
                }
              >
                <CopyIcon />
              </Button>
            </div>
          </div>
        )}
      </div>
      <ul className="space-y-1">
        {sortedEntries.map((entry) => (
          <FileSystemEntry
            key={entry.handle.name}
            entry={entry}
            currentPath={currentPath}
            manifestInfo={getFilePath(entry, currentPath, manifest)}
            onClick={handleEntryClick}
          />
        ))}
      </ul>
    </div>
  );
};

DirectoryView.displayName = "DirectoryView";
