import { useContext, useEffect, useState } from 'react';
import './styles.css';
import { StorageContext } from '../../providers/storage-provider';
import { changeColorScript } from '../../scripts/changeColorScript';
import { createAndMoveScript } from '../../scripts/createAndMoveScript';

export const Emulator = () => {
  const [execute, setExecute] = useState<boolean>(false);
  const [option, setOption] = useState<string>('option1');

  const { setLayers, handleCommand, cb } = useContext(StorageContext);

  useEffect(() => {
    let stopColorScript: (() => void) | undefined;
    if (execute) {
      if (option === 'option1') {
        stopColorScript = changeColorScript(setLayers, handleCommand, cb);
      } else if (option === 'option2') {
        stopColorScript = createAndMoveScript(setLayers, handleCommand, cb);
      }
    } else {
      if (stopColorScript) stopColorScript();
    }

    return () => {
      if (stopColorScript) stopColorScript();
    };
  }, [execute]);

  return (
    <div className="computer-container">
      <select
        className="computer-select"
        onChange={(e) => setOption(e.target.value)}
      >
        <option value="option1">Create and change color</option>
        <option value="option2">Create and move</option>
      </select>
      <button className="computer-submit" onClick={() => setExecute(!execute)}>
        {execute ? 'Stop' : 'Execute'}
      </button>
    </div>
  );
};
