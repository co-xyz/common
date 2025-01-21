import { type IDBPDatabase, openDB } from "idb";
import { DB_NAME, ROOT_KEY, STORE_NAME, type AppSchema } from "./schema.js";

export default class IDBManager {
  private constructor(private db: IDBPDatabase<AppSchema>) {}

  private static instance: IDBManager | null = null;

  public static async getInstance(dbName = DB_NAME): Promise<IDBManager> {
    return (
      IDBManager.instance ??
      new IDBManager(
        await openDB<AppSchema>(dbName, 1, {
          upgrade(database) {
            database.createObjectStore(STORE_NAME);
          },
        })
      )
    );
  }

  public async getRoot() {
    return this.db.get(STORE_NAME, ROOT_KEY);
  }

  public async setRoot(handle: FileSystemDirectoryHandle) {
    return this.db.put(STORE_NAME, handle, ROOT_KEY);
  }
}
