import React, { useContext } from 'react';
import { StateContext } from '../../store';

/* Vectors and icons by https://www.svgrepo.com */

export const Color: React.FC = () => {
  const { fillColor, setFillColor } = useContext(StateContext);

  return (
    <input
      type="color"
      value={fillColor}
      onChange={(e) => setFillColor(e.target.value)}
    />
  );
};
