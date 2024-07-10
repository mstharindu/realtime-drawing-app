import { useCallback, useEffect, useState } from 'react';
import { Command } from '../commands';

export const useHistory = <T,>() => {
  const [undoStack, setUndoStack] = useState<Command<T>[]>([]);
  const [redoStack, setRedoStack] = useState<Command<T>[]>([]);

  const execute = (command: Command<T>) => {
    command.execute();

    setUndoStack((prev) => [...prev, command]);
    setRedoStack([]);
  };

  const undo = useCallback((): void => {
    if (undoStack.length === 0) return;

    const undoCommand = undoStack[undoStack.length - 1];
    undoCommand.undo();

    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, undoCommand]);
  }, [undoStack]);

  const redo = useCallback((): void => {
    if (redoStack.length === 0) return;

    const redoCommand = redoStack[redoStack.length - 1];

    redoCommand.execute();
    setUndoStack((prev) => [...prev, redoCommand]);
    setRedoStack((prev) => prev.slice(0, -1));
  }, [redoStack]);

  const canUndo = useCallback((): boolean => undoStack.length > 0, [undoStack]);

  const canRedo = useCallback((): boolean => redoStack.length > 0, [redoStack]);

  const getInfo = (): void => {
    console.log('undoStack:::', undoStack);
    console.log('redoStack:::', redoStack);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (canUndo()) undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (canRedo()) redo();
      } else {
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [canUndo, canRedo, undo, redo]);

  return { execute, undo, redo, canUndo, canRedo, getInfo };
};
