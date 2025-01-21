import { z } from "zod";
import { FileNavigator } from "../lib/filesystem/navigator.js";
import type { FileSystemEntryEntity } from "@permaupload/types/filesystem.js";

// Schema for manifest paths entries
const manifestPathSchema = z.object({
  id: z.string(),
});

// Schema for the manifest matching the exact structure
export const manifestSchema = z.object({
  manifest: z.literal("arweave/paths"),
  manifestId: z.string().optional(),
  version: z.string(),
  paths: z.record(z.string(), manifestPathSchema),
});

export type ManifestData = z.infer<typeof manifestSchema>;

export async function readManifest(
  fileNavigator: FileNavigator
): Promise<ManifestData | null> {
  try {
    const data = await fileNavigator.readJsonFromFile<object>({
      fileName: "manifest.json",
    });

    // Parse and validate the manifest data
    const result = manifestSchema.safeParse(data);

    if (!result.success) {
      console.error("Invalid manifest format:", result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    // If file doesn't exist or can't be read, return null
    return null;
  }
}

// Helper to match file entries with manifest items
export function getFilePath(
  entry: FileSystemEntryEntity,
  currentPath: string,
  manifest: ManifestData | null
): { id: string; url: string } | null {
  if (!manifest || !entry.file) return null;

  // Construct the relative path for the current file
  const filePath = currentPath
    ? `${currentPath}/${entry.file.name}`
    : entry.file.name;

  // Check if this path exists in the manifest
  const manifestEntry = manifest.paths[filePath];
  const relativePath = manifest.manifestId
    ? `https://arweave.net/${manifest.manifestId}/${filePath}`
    : undefined;

  if (!manifestEntry) return null;

  return {
    id: manifestEntry.id,
    url: relativePath || `https://arweave.net/${manifestEntry.id}`,
  };
}
