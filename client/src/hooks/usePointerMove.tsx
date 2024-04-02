import { useEffect, useState } from 'react';

export type PointerPosition = [number, number];

export const usePointerMove = () => {
  const [pointerPosition, setPointerPosition] = useState<PointerPosition>([
    0, 0,
  ]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      setPointerPosition([e.clientX, e.clientY]);
    };

    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return pointerPosition;
};
