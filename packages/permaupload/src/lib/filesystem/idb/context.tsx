"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import IDBManager from "./manager.js";

interface IdbContextValue {
  idb: IDBManager | undefined;
  root: FileSystemDirectoryHandle | undefined;
  getInstance: () => Promise<IDBManager>;
  setRoot: (handle: FileSystemDirectoryHandle) => Promise<"root" | undefined>;
}

const IdbContext = createContext<IdbContextValue | null>(null);

interface IdbProviderProps extends PropsWithChildren {
  initialIdb?: IDBManager;
  initialRoot?: FileSystemDirectoryHandle;
}

export const IdbProvider = ({
  children,
  initialIdb = undefined,
  initialRoot = undefined,
}: IdbProviderProps) => {
  const [idb, setIdb] = useState<IDBManager | undefined>(initialIdb);
  const [root, setRoot] = useState<FileSystemDirectoryHandle | undefined>(
    initialRoot
  );

  const getInstance = useCallback(async () => {
    const instance = await IDBManager.getInstance();
    const rootHandle = await instance.getRoot();

    setIdb(instance);
    setRoot(rootHandle);

    return instance;
  }, []);

  const handleSetRoot = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      if (!idb) {
        console.error("No instance of the IndexedDB manager");
      }

      setRoot(handle);
      return idb?.setRoot(handle);
    },
    [idb]
  );

  useEffect(() => {
    if (!idb) {
      getInstance().catch(console.error);
    }
  }, [getInstance, idb]);

  const contextValue = useMemo(
    () => ({
      idb,
      root,
      getInstance,
      setRoot: handleSetRoot,
    }),
    [idb, root, getInstance, handleSetRoot]
  );

  return (
    <IdbContext.Provider value={contextValue}>{children}</IdbContext.Provider>
  );
};

export const useIdb = () => {
  const context = useContext(IdbContext);

  if (!context) {
    throw new Error("useIdb must be used within an IdbProvider");
  }

  return context;
};

// Component display names
IdbProvider.displayName = "IdbProvider";
