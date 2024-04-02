import { useEffect } from 'react';
import { Mode } from '../store';

export const useKeyPress = (handleClick: (mode: Mode) => void) => {
  useEffect(() => {
    const handleKeyPresses = (event: KeyboardEvent) => {
      if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
        handleClick(Mode.Undo);
        return;
      }

      if (event.key === 'y' && (event.metaKey || event.ctrlKey)) {
        handleClick(Mode.Redo);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPresses);

    return () => {
      window.removeEventListener('keydown', handleKeyPresses);
    };
  }, [handleClick]);
};
