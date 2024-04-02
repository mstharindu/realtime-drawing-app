import { useState } from "react";
import { Command } from "../models/Command";

export const useHistory = <T,>() => {
  const [undoStack, setUndoStack] = useState<Command<T>[]>([]);
  const [redoStack, setRedoStack] = useState<Command<T>[]>([]);

  const execute = (command: Command<T>, pauseHistory?: boolean) => {
    command.execute();

    if (pauseHistory) return;

    setUndoStack((prev) => [...prev, command]);
    setRedoStack([]);
  };

  const undo = (): void => {
    if (undoStack.length === 0) return;

    const undoCommand = undoStack[undoStack.length - 1];
    undoCommand.undo();

    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, undoCommand]);
  };

  const redo = (): void => {
    if (redoStack.length === 0) return;

    const redoCommand = redoStack[redoStack.length - 1];

    redoCommand.execute();
    setUndoStack((prev) => [...prev, redoCommand]);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const canUndo = (): boolean => undoStack.length > 0;

  const canRedo = (): boolean => redoStack.length > 0;

  const getInfo = (): void => {
    console.log('undoStack:::', undoStack);
    console.log('redoStack:::', redoStack);
  };

  return { execute, undo, redo, canUndo, canRedo, getInfo };
};
