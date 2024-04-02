import React, { useContext } from 'react';
import { StateContext } from '../../store';

export const StrokeWidth: React.FC = () => {
  const { strokeWidth, setStrokeWidth } = useContext(StateContext);

  return (
    <li className="strokeWidth" key="strokeWidth">
      <label htmlFor="strokeWidthRange">Stroke Width [{strokeWidth}px]</label>
      <input
        type="range"
        min="1"
        max="20"
        value={strokeWidth}
        id="strokeWidthRange"
        onChange={(e) => {
          setStrokeWidth(Number(e.target.value));
        }}
      />
    </li>
  );
};
