import type {
  FileSystemEntryEntity,
  TaggedFile,
} from "@permaupload/types/filesystem.js";

class FileNavigator {
  private readonly root: FileSystemDirectoryHandle;

  private pathStack: FileSystemDirectoryHandle[];

  public constructor(root: FileSystemDirectoryHandle) {
    this.root = root;
    this.pathStack = [this.root];
  }

  public goUp() {
    if (this.pathStack.length < 2) {
      throw new Error("can't go higher than root");
    }
    return this.pathStack.pop()!;
  }

  public getCurrentDirectory() {
    return this.pathStack.at(-1)!;
  }

  public async goDown(dirName: string) {
    try {
      const subdirectoryHandle =
        await this.getCurrentDirectory().getDirectoryHandle(dirName);
      this.pathStack.push(subdirectoryHandle);
      return subdirectoryHandle;
    } catch (error) {
      throw new Error("unreachable subdirectory");
    }
  }

  public async getContents() {
    const entries: FileSystemEntryEntity[] = [];
    // eslint-disable-next-line no-restricted-syntax
    // @ts-expect-error - TS doesn't know about the values() method
    for await (const handle of this.pathStack.at(-1)!.values()) {
      if (handle instanceof FileSystemDirectoryHandle) {
        entries.push({ handle });
      } else {
        const file = (await (
          handle as FileSystemFileHandle
        ).getFile()) as TaggedFile;
        file.tags = [{ name: "Content-Type", value: file.type }];
        entries.push({ handle: handle as FileSystemFileHandle, file });
      }
    }
    return entries;
  }

  public isRoot() {
    return this.pathStack.length === 1;
  }

  public getPathItems() {
    return this.pathStack.map((handle) => handle.name);
  }

  public getPath() {
    return this.pathStack.reduce(
      (path: string, elem) => path.concat(`${elem.name}/`),
      ""
    );
  }

  public async saveJsonToFile<T extends object>({
    fileName,
    data,
    directory,
  }: {
    fileName: string;
    data: T;
    directory?: FileSystemDirectoryHandle;
  }): Promise<void> {
    try {
      if (!directory) {
        directory = this.getCurrentDirectory();
      }
      const fileHandle = await directory.getFileHandle(fileName, {
        create: true,
      });

      const stream = await fileHandle.createWritable();

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });

      // Write and close
      await stream.write(blob);
      await stream.close();

      this.getContents();
    } catch (error) {
      console.error("Error saving JSON to file:", error);
      throw new Error(
        `Failed to save file ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  public async readJsonFromFile<T extends object>({
    fileName,
    directory,
  }: {
    fileName: string;
    directory?: FileSystemDirectoryHandle;
  }): Promise<T> {
    try {
      if (!directory) {
        directory = this.getCurrentDirectory();
      }
      const fileHandle = await directory.getFileHandle(fileName, {
        create: false,
      });

      const file = await fileHandle.getFile();
      const data = await file.text();
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading JSON from file:", error);
      throw new Error(
        `Failed to read file ${fileName}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export { FileNavigator };
