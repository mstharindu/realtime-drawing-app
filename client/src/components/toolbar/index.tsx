import React, { useContext, useMemo } from 'react';
import './styles.css';
import { Pen } from './pen';
import { Eraser } from './eraser';
import { Color } from './color';
import { Undo } from './undo';
import { Redo } from './redo';
import { Tool } from './tool';
import { Mode } from '../../store';
import { StateContext } from '../../store';
import { StrokeWidth } from './stroke-width';

export const Toolbar: React.FC = () => {
  const { mode, handleClick, canUndo, canRedo } = useContext(StateContext);

  const toolbarOptions = useMemo(() => {
    return [
      {
        id: 'penBtn',
        ariaLabel: 'Pen',
        title: 'Pen',
        component: <Pen />,
        mode: Mode.Pen,
      },
      {
        id: 'eraserBtn',
        ariaLabel: 'Eraser',
        title: 'Eraser',
        component: <Eraser />,
        mode: Mode.Eraser,
      },
      {
        id: 'colorBtn',
        ariaLabel: 'Color',
        title: 'Color',
        component: <Color />,
        mode: Mode.Color,
      },
      {
        id: 'undoBtn',
        ariaLabel: 'Undo',
        title: 'Undo',
        component: <Undo />,
        mode: Mode.Undo,
        disabled: !canUndo,
      },
      {
        id: 'redoBtn',
        ariaLabel: 'Redo',
        title: 'Redo',
        component: <Redo />,
        mode: Mode.Redo,
        disabled: !canRedo,
      },
    ];
  }, [canUndo, canRedo]);

  return (
    <ul className="toolbar">
      {toolbarOptions.map((option) => (
        <li key={option.id}>
          <Tool
            id={option.id}
            ariaLabel={option.ariaLabel}
            title={option.title}
            handleClick={() => handleClick(option.mode)}
            active={option.mode === mode}
            disabled={option.disabled}
          >
            {option.component}
          </Tool>
        </li>
      ))}
      <StrokeWidth />
    </ul>
  );
};
