import { useCallback } from "react";
import { useStorage } from "../providers/storageProvider.jsx";

export interface UseNavigationOptions {
  onNavigate?: () => void;
  onRefreshComplete?: () => void;
}

export const useNavigation = ({
  onNavigate,
  onRefreshComplete,
}: UseNavigationOptions = {}) => {
  const {
    chooseDirectory,
    currentPath,
    pathItems,
    entries,
    manifestId,
    manifestInfo,
    isRefreshing,
    navigateToIndex,
    navigateToDirectory,
    refresh,
  } = useStorage();

  const handleNavigate = useCallback(
    async (index: number) => {
      await navigateToIndex(index);
      onNavigate?.();
    },
    [navigateToIndex, onNavigate]
  );

  const handleEntryClick = useCallback(
    async (entry: FileSystemHandle) => {
      if (entry instanceof FileSystemDirectoryHandle) {
        await navigateToDirectory(entry);
        onNavigate?.();
      }
    },
    [navigateToDirectory, onNavigate]
  );

  const handleRefresh = useCallback(async () => {
    await refresh();
    onRefreshComplete?.();
  }, [refresh, onRefreshComplete]);

  return {
    currentPath,
    pathItems,
    entries,
    manifestId,
    manifestInfo,
    isRefreshing,
    chooseDirectory,
    handleNavigate,
    handleEntryClick,
    refresh: handleRefresh,
  };
};
