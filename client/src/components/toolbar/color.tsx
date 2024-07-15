import { useContext, useState } from 'react';
import './styles.css';
import { CanvasStateContext } from '../../providers/state-provider';

const colors = [
  '#FF6900',
  '#FCB900',
  '#7BDCB5',
  '#00D084',
  '#8ED1FC',
  '#ABB8C3',
  '#EB144C',
  '#F78DA7',
  '#9900EF',
];

export const Color = () => {
  const { fillColor, setFillColor } = useContext(CanvasStateContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleColorClick = (color: string) => {
    setIsOpen(false);
    setFillColor(color);
  };

  return (
    <div className="toolbar_option">
      <div className="color-picker">
        <div
          className="color-picker-button"
          style={{ backgroundColor: fillColor }}
          onClick={handleButtonClick}
        ></div>
        {isOpen && (
          <div className="color-picker-popover">
            {colors.map((color) => (
              <div
                key={color}
                className="color-picker-color"
                style={{
                  backgroundColor: color,
                  ...(color === fillColor
                    ? { border: '1px solid black' }
                    : { border: '2px solid white' }),
                }}
                onClick={() => handleColorClick(color)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
