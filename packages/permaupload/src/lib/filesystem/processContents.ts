import type { TaggedFile } from "@permaupload/types/filesystem.js";

import { FileNavigator } from "./navigator.js";
import { createFileWithPath } from "./file.js";

// Interface for file processing options
interface ProcessContentOptions {
  excludePatterns?: Array<string | RegExp>;
  maxDepth?: number;
  includeHidden?: boolean;
}

// Interface to track accumulated files and size
interface FileAccumulator {
  files: File[];
  totalSize: number;
  skippedFiles: string[];
}

const DEFAULT_EXCLUDE_PATTERNS = [
  /^\.git$/, // Git directory
  /^\.DS_Store$/, // macOS system files
  /^node_modules$/, // Node.js dependencies
  /^thumbs\.db$/i, // Windows thumbnail cache
  /^desktop\.ini$/i, // Windows folder settings
  /^manifest\.json$/i, // Arweave manifest
];

/**
 * Checks if a file or directory should be excluded based on patterns
 * @param name - Name of the file or directory
 * @param patterns - Array of patterns to match against
 * @returns boolean indicating if the item should be excluded
 */
const shouldExclude = (
  name: string,
  patterns: Array<string | RegExp> = []
): boolean => {
  return patterns.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(name);
    }
    return name === pattern;
  });
};

/**
 * Recursively processes directory contents with configurable options
 * @param navigator - FileNavigator instance for traversing the file system
 * @param options - Configuration options for processing
 * @param currentPath - Current path being processed (used internally)
 * @param currentDepth - Current recursion depth (used internally)
 * @param accumulator - Accumulator for tracking files and sizes (used internally)
 * @returns Promise resolving to FileAccumulator containing processed files and metadata
 */
export const processContents = async (
  navigator: FileNavigator,
  options: ProcessContentOptions = {},
  currentPath: string = "",
  currentDepth: number = 0,
  accumulator: FileAccumulator = { files: [], totalSize: 0, skippedFiles: [] }
): Promise<FileAccumulator> => {
  const {
    excludePatterns = DEFAULT_EXCLUDE_PATTERNS,
    maxDepth = Infinity,
    includeHidden = false,
  } = options;

  // If we've exceeded maxDepth, return current accumulator
  if (currentDepth > maxDepth) {
    return accumulator;
  }

  // Combine default and custom exclude patterns
  const allPatterns = includeHidden
    ? excludePatterns
    : [...DEFAULT_EXCLUDE_PATTERNS, ...excludePatterns];

  const contents = await navigator.getContents();

  return contents.reduce(async (promiseAcc, entry) => {
    const acc = await promiseAcc;
    const name = entry.handle.name;

    // Check if the current item should be excluded
    if (shouldExclude(name, allPatterns)) {
      acc.skippedFiles.push(currentPath ? `${currentPath}/${name}` : name);
      return acc;
    }

    if (entry.file) {
      // Process file entry
      const relativePath = currentPath
        ? `${currentPath}/${entry.file.name}`
        : entry.file.name;

      const item = createFileWithPath(entry.file as TaggedFile, relativePath);

      acc.files.push(item);
      acc.totalSize += entry.file.size;
    } else if (entry.handle instanceof FileSystemDirectoryHandle) {
      // Process directory entry
      try {
        await navigator.goDown(entry.handle.name);

        const newPath = currentPath
          ? `${currentPath}/${entry.handle.name}`
          : entry.handle.name;

        // Recursively process subdirectory
        const subDirResults = await processContents(
          navigator,
          options,
          newPath,
          currentDepth + 1,
          acc
        );

        // Merge results
        acc.files.push(...subDirResults.files);
        acc.totalSize += subDirResults.totalSize;
        acc.skippedFiles.push(...subDirResults.skippedFiles);

        // Navigate back up
        navigator.goUp();
      } catch (error) {
        console.warn(
          `Failed to process directory ${entry.handle.name}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return acc;
  }, Promise.resolve(accumulator));
};
