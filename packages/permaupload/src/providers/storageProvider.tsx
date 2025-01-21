import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type IDBPDatabase, openDB } from "idb";
import { FileNavigator } from "../lib/filesystem/navigator.js";
import {
  DB_NAME,
  ROOT_KEY,
  STORE_NAME,
  type AppSchema,
} from "@permaupload/lib/filesystem/idb/schema.js";
import { getFilePath, readManifest } from "@permaupload/utils/manifest.js";
import { isDir } from "@permaupload/utils/index.js";
import type {
  FileManifestInfo,
  FileSystemEntryEntity,
} from "@permaupload/types/index.js";

interface StorageState {
  db: IDBPDatabase<AppSchema> | null;
  root: FileSystemDirectoryHandle | null;
  fileNavigator: FileNavigator | null;
  permissionGranted: boolean;
  error: Error | null;
  isLoading: boolean;
  // Navigation state
  currentPath: string;
  pathItems: string[];
  entries: FileSystemEntryEntity[];
  manifestId?: string;
  manifestInfo?: Record<string, FileManifestInfo>;
  isRefreshing: boolean;
}

interface StorageContextValue extends StorageState {
  initialize: () => Promise<void>;
  setRoot: (handle: FileSystemDirectoryHandle) => Promise<void>;
  requestPermission: () => Promise<void>;
  chooseDirectory: () => Promise<void>;
  // Navigation methods
  navigateToIndex: (index: number) => Promise<void>;
  navigateToDirectory: (directory: FileSystemDirectoryHandle) => Promise<void>;
  refresh: () => Promise<void>;
}

const StorageContext = createContext<StorageContextValue | null>(null);

export const StorageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<StorageState>({
    db: null,
    root: null,
    fileNavigator: null,
    permissionGranted: false,
    error: null,
    isLoading: false,
    currentPath: "",
    pathItems: [],
    entries: [],
    isRefreshing: false,
  });

  const refreshContents = useCallback(async (navigator: FileNavigator) => {
    const contents = await navigator.getContents();
    const manifest = await readManifest(navigator);
    const pathItems = navigator.getPathItems();
    const currentPath = pathItems.slice(1).join("/");

    // Create manifest info mapping
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

    // Sort entries
    const sortedEntries = contents.sort((a, b) => {
      const aIsDir = isDir(a.handle);
      const bIsDir = isDir(b.handle);
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.handle.name.localeCompare(b.handle.name);
    });

    setState((prev) => ({
      ...prev,
      entries: sortedEntries,
      manifestId: manifest?.manifestId,
      manifestInfo: manifestMapping,
      pathItems,
      currentPath,
    }));
  }, []);

  const refresh = useCallback(async () => {
    if (!state.fileNavigator) return;

    setState((prev) => ({ ...prev, isRefreshing: true }));
    await refreshContents(state.fileNavigator);
    setState((prev) => ({ ...prev, isRefreshing: false }));
  }, [state.fileNavigator, refreshContents]);

  const navigateToIndex = useCallback(
    async (index: number) => {
      if (!state.fileNavigator) return;

      // Reset to root
      while (!state.fileNavigator.isRoot()) {
        state.fileNavigator.goUp();
      }

      // Navigate to target index
      for (let i = 1; i <= index; i++) {
        const path = state.pathItems[i];
        if (path) {
          await state.fileNavigator.goDown(path);
        }
      }

      await refresh();
    },
    [state.fileNavigator, state.pathItems, refresh]
  );

  const navigateToDirectory = useCallback(
    async (directory: FileSystemDirectoryHandle) => {
      if (!state.fileNavigator) return;

      try {
        await state.fileNavigator.goDown(directory.name);
        await refresh();
      } catch (error) {
        console.error("Failed to navigate:", error);
      }
    },
    [state.fileNavigator, refresh]
  );

  const initialize = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Initialize IndexedDB
      const db = await openDB<AppSchema>(DB_NAME, 1, {
        upgrade(database) {
          database.createObjectStore(STORE_NAME);
        },
      });

      // Try to load existing root
      const existingRoot = await db.get(STORE_NAME, ROOT_KEY);
      const fileNavigator = existingRoot
        ? new FileNavigator(existingRoot)
        : null;

      setState((prev) => ({
        ...prev,
        db,
        root: existingRoot || null,
        fileNavigator,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to initialize storage"),
        isLoading: false,
      }));
    }
  }, []);

  const setRoot = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      if (!state.db) {
        throw new Error("Database not initialized");
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Save to IndexedDB
        await state.db.put(STORE_NAME, handle, ROOT_KEY);

        // Update state
        setState((prev) => ({
          ...prev,
          root: handle,
          fileNavigator: new FileNavigator(handle),
          error: null,
          isLoading: false,
          permissionGranted: false, // Reset permission status for new root
        }));
      } catch (error) {
        console.error("Failed to set root:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error : new Error("Failed to set root"),
          isLoading: false,
        }));
      }
    },
    [state.db]
  );

  const requestPermission = useCallback(async () => {
    if (!state.root) return;

    try {
      // @ts-expect-error: FileSystem API types
      const permission = await state.root.requestPermission({
        mode: "readwrite",
      });

      if (permission !== "granted") {
        throw new Error("Permission not granted");
      }

      setState((prev) => ({
        ...prev,
        permissionGranted: true,
        error: null,
      }));
    } catch (error) {
      console.error("Failed to request permission:", error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to request permission"),
        permissionGranted: false,
      }));
    }
  }, [state.root]);

  const chooseDirectory = useCallback(async () => {
    try {
      // @ts-expect-error: FileSystem API types
      const handle = await window.showDirectoryPicker({
        type: "openDirectory",
        mode: "readwrite",
      });
      await setRoot(handle);
      console.log("Root set:", handle);
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        console.error("Failed to choose directory:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error
              : new Error("Failed to choose directory"),
        }));
      }
    }
  }, [setRoot]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auto-request permission when root changes and permission not granted
  useEffect(() => {
    if (state.root && !state.permissionGranted) {
      requestPermission();
    }
  }, [state.root, state.permissionGranted, requestPermission]);

  const value = {
    ...state,
    initialize,
    setRoot,
    requestPermission,
    chooseDirectory,
    navigateToIndex,
    navigateToDirectory,
    refresh,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within StorageProvider");
  }
  return context;
};

StorageProvider.displayName = "StorageProvider";
