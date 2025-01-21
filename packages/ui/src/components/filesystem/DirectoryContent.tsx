import { useEffect } from "react";
import { type DirectoryContentProps } from "./types.js";
import { DirectoryItem } from "./DirectoryItem.js";
import { useFileSelection, SELECTION_KEYS } from "./hooks/useFileSelection.js";

export const DirectoryContent = ({
  entries,
  currentPath,
  manifestInfo,
  onEntryClick,
  onSelectionChange,
}: DirectoryContentProps) => {
  const {
    selectedEntries,
    isSelected,
    handleSelect,
    handleKeyboardSelect,
    clearSelection,
  } = useFileSelection({
    entries,
    onSelectionChange,
  });

  // Clear selection when path changes
  useEffect(() => {
    clearSelection();
  }, [currentPath, clearSelection]);

  // Handle keyboard navigation at container level
  const handleContainerKeyDown = (event: React.KeyboardEvent) => {
    if (SELECTION_KEYS.includes(event.key)) {
      event.preventDefault();
    }
  };

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>This folder is empty</p>
      </div>
    );
  }

  return (
    <ul
      className="space-y-1"
      onKeyDown={handleContainerKeyDown}
      role="listbox"
      aria-multiselectable="true"
    >
      {entries.map((entry, index) => (
        <DirectoryItem
          key={entry.handle.name}
          entry={entry}
          currentPath={currentPath}
          manifestInfo={manifestInfo?.[entry.handle.name]}
          onClick={onEntryClick}
          isSelected={isSelected(entry)}
          index={index}
          onSelect={handleSelect}
          onKeyDown={handleKeyboardSelect}
        />
      ))}
    </ul>
  );
};

DirectoryContent.displayName = "DirectoryContent";
