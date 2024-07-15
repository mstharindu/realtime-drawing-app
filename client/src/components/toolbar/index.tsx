import { useContext } from 'react';
import { Redo } from './redo';
import './styles.css';
import { Undo } from './undo';
import { Mode, Shape } from '../../types';
import { Rectangle } from './rectangle';
import { Select } from './select';
import { CanvasStateContext } from '../../providers/state-provider';
import { StorageContext } from '../../providers/storage-provider';
import { Color } from './color';

export const Toolbar = () => {
  const { setCanvasState, canvasState } = useContext(CanvasStateContext);

  const { undo, redo, canUndo, canRedo } = useContext(StorageContext);

  return (
    <div className="toolbar_container">
      <div className="toolbar">
        <button
          className={[
            `toolbar_option`,
            canvasState.mode === Mode.None ||
            canvasState.mode === Mode.Select ||
            canvasState.mode === Mode.Move ||
            canvasState.mode === Mode.Scale
              ? 'toolbar_option_active'
              : '',
          ].join(' ')}
          aria-label="Create new rectangle"
          onClick={() =>
            setCanvasState({
              mode: Mode.Insert,
              type: Shape.Rectangle,
            })
          }
        >
          <Select />
        </button>
        <div className="divider"></div>
        <button
          className={[
            `toolbar_option`,
            canvasState.mode === Mode.Insert &&
            canvasState.type === Shape.Rectangle
              ? 'toolbar_option_active'
              : '',
          ].join(' ')}
          aria-label="Create new rectangle"
          onClick={() =>
            setCanvasState({
              mode: Mode.Insert,
              type: Shape.Rectangle,
            })
          }
        >
          <Rectangle />
        </button>
        <div className="divider"></div>
        <button
          className="toolbar_option"
          aria-label="Undo last action"
          onClick={undo}
          disabled={!canUndo()}
        >
          <Undo />
        </button>
        <div className="divider"></div>
        <button
          className="toolbar_option"
          aria-label="Redo last action"
          onClick={redo}
          disabled={!canRedo()}
        >
          <Redo />
        </button>
        <div className="divider"></div>
        <Color />
      </div>
    </div>
  );
};
