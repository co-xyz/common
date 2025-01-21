import type { FileSystemEntryEntity } from "@co-xyz/permaupload";
import { useState, useCallback, useEffect } from "react";

interface UseFileSelectionProps {
  entries: FileSystemEntryEntity[];
  onSelectionChange?: (selectedEntries: FileSystemEntryEntity[]) => void;
}

interface UseFileSelectionReturn {
  selectedEntries: FileSystemEntryEntity[];
  lastSelectedIndex: number | null;
  isSelected: (entry: FileSystemEntryEntity) => boolean;
  handleSelect: (
    entry: FileSystemEntryEntity,
    index: number,
    event: React.MouseEvent
  ) => void;
  handleKeyboardSelect: (event: React.KeyboardEvent, index: number) => void;
  clearSelection: () => void;
  selectAll: () => void;
}

export const useFileSelection = ({
  entries,
  onSelectionChange,
}: UseFileSelectionProps): UseFileSelectionReturn => {
  const [selectedEntries, setSelectedEntries] = useState<
    FileSystemEntryEntity[]
  >([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(
    null
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Clear selection when entries change
  useEffect(() => {
    setSelectedEntries([]);
    setLastSelectedIndex(null);
    setFocusedIndex(null);
  }, [entries]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedEntries);
  }, [selectedEntries, onSelectionChange]);

  const isSelected = useCallback(
    (entry: FileSystemEntryEntity) => {
      return selectedEntries.some(
        (selected) => selected.handle.name === entry.handle.name
      );
    },
    [selectedEntries]
  );

  const handleRangeSelect = useCallback(
    (startIdx: number, endIdx: number) => {
      const start = Math.min(startIdx, endIdx);
      const end = Math.max(startIdx, endIdx);
      const rangeEntries = entries.slice(start, end + 1);
      setSelectedEntries(rangeEntries);
      setLastSelectedIndex(endIdx);
    },
    [entries]
  );

  const handleSelect = useCallback(
    (entry: FileSystemEntryEntity, index: number, event: React.MouseEvent) => {
      event.preventDefault();
      setFocusedIndex(index);

      if (event.shiftKey && lastSelectedIndex !== null) {
        handleRangeSelect(lastSelectedIndex, index);
      } else if (event.ctrlKey || event.metaKey) {
        setSelectedEntries((prev) => {
          const isEntrySelected = isSelected(entry);
          const newSelection = isEntrySelected
            ? prev.filter((e) => e.handle.name !== entry.handle.name)
            : [...prev, entry];
          return newSelection;
        });
        setLastSelectedIndex(index);
      } else {
        setSelectedEntries([entry]);
        setLastSelectedIndex(index);
      }
    },
    [lastSelectedIndex, isSelected, handleRangeSelect]
  );

  const handleKeyboardSelect = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const currentIndex = focusedIndex ?? index;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, entries.length - 1);
          setFocusedIndex(nextIndex);
          if (event.shiftKey) {
            handleRangeSelect(lastSelectedIndex ?? currentIndex, nextIndex);
          }
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          setFocusedIndex(prevIndex);
          if (event.shiftKey) {
            handleRangeSelect(lastSelectedIndex ?? currentIndex, prevIndex);
          }
          break;
        }
        case " ": {
          event.preventDefault();
          if (currentIndex !== null && entries[currentIndex]) {
            handleSelect(entries[currentIndex], currentIndex, {
              ...event,
              preventDefault: () => {},
            } as unknown as React.MouseEvent);
          }
          break;
        }
        case "a": {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            selectAll();
          }
          break;
        }
        case "Escape": {
          event.preventDefault();
          clearSelection();
          setFocusedIndex(null);
          break;
        }
      }
    },
    [entries, focusedIndex, lastSelectedIndex, handleSelect, handleRangeSelect]
  );

  const clearSelection = useCallback(() => {
    setSelectedEntries([]);
    setLastSelectedIndex(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedEntries([...entries]);
    setLastSelectedIndex(entries.length - 1);
  }, [entries]);

  return {
    selectedEntries,
    lastSelectedIndex,
    isSelected,
    handleSelect,
    handleKeyboardSelect,
    clearSelection,
    selectAll,
  };
};

// Constants for keyboard navigation handling
export const SELECTION_KEYS = ["ArrowUp", "ArrowDown", " ", "a", "Escape"];
