// Helper function to create a file with a relative path
export function createFileWithPath(file: File, relativePath: string): File {
  const newFile = new File([file], relativePath, {
    type: file.type,
    lastModified: file.lastModified,
  });

  return newFile;
}
