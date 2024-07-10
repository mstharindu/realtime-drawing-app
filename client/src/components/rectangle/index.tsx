import React from 'react';
import { Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { Layer, RectangleShape } from '../../types';
import { AtLeastOne } from '../../commands';

interface RectangleProps {
  shapeProps: RectangleShape;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: AtLeastOne<Layer>, actionEnd: boolean) => void;
}

const Rectangle: React.FC<RectangleProps> = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
}) => {
  const shapeRef = React.useRef<Konva.Rect>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      const layer = trRef.current.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
  }, [isSelected]);

  const handleMove = (actionEnd: boolean = false) => {
    const node = shapeRef.current;
    onChange(
      {
        x: node!.x(),
        y: node!.y(),
      },
      actionEnd
    );
  };

  const handleScaleRotate = (actionEnd: boolean = false) => {
    const node = shapeRef.current;
    const scaleX = node!.scaleX();
    const scaleY = node!.scaleY();

    node!.scaleX(1);
    node!.scaleY(1);

    node!.width(node!.width() * scaleX);
    node!.height(node!.height() * scaleY);

    onChange(
      {
        x: node!.x(),
        y: node!.y(),
        width: Math.max(5, node!.width() * scaleX),
        height: Math.max(5, node!.height() * scaleY),
        rotation: node!.rotation(),
      },
      actionEnd
    );
  };

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragMove={() => {
          handleMove(false);
        }}
        onDragEnd={() => {
          handleMove(true);
        }}
        onTransform={() => {
          handleScaleRotate(false);
        }}
        onTransformEnd={() => {
          handleScaleRotate(true);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default Rectangle;
