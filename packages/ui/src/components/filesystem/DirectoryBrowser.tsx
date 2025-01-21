import { DirectoryHeader } from "./DirectoryHeader.js";
import { DirectoryContent } from "./DirectoryContent.js";
import { useNavigation } from "@co-xyz/permaupload/hooks";
import { Button } from "@ui/lib/shadcn/button.jsx";

export const DirectoryBrowser = () => {
  const {
    chooseDirectory,
    currentPath,
    pathItems,
    entries,
    manifestId,
    manifestInfo,
    handleNavigate,
    handleEntryClick,
  } = useNavigation();

  if (!currentPath) {
    return <Button onClick={chooseDirectory}>Choose Directory</Button>;
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      <DirectoryHeader
        paths={pathItems}
        manifestId={manifestId}
        onNavigate={handleNavigate}
      />

      <DirectoryContent
        entries={entries}
        currentPath={currentPath}
        manifestInfo={manifestInfo}
        onEntryClick={handleEntryClick}
      />
    </div>
  );
};

DirectoryBrowser.displayName = "DirectoryBrowser";

// Export all components and types
export * from "./DirectoryHeader.js";
export * from "./DirectoryContent.js";
export * from "./DirectoryItem.js";
export * from "./types.js";
export * from "./hooks/useDirectoryNavigation.js";
