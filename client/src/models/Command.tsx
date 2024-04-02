import { Layer } from './Layer';

export abstract class Command<T> {
  props: T;
  constructor(props: T) {
    this.props = props;
  }
  abstract execute(): void;
  abstract undo(): void;
}

export interface LayerProps {
  layer: Layer;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}

export interface DrawLayerProps {
  layerId: string;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  mousePosition: [number, number];
}

export class AddLayerCommand<T extends LayerProps> extends Command<T> {
  constructor(props: T) {
    super(props);
    this.props = props;
  }

  execute(): void {
    this.props.setLayers((prevLayers) => [...prevLayers, this.props.layer]);
  }
  undo(): void {
    this.props.setLayers((prevLayers) => {
      return prevLayers.filter((r) => r.id !== this.props.layer.id);
    });
  }
}

export class DrawLayerCommand<T extends DrawLayerProps> extends Command<T> {
  constructor(props: T) {
    super(props);
    this.props = props;
  }

  execute(): void {
    this.props.setLayers((prevLayers) => {
      return prevLayers.map((layer) => {
        if (layer.id === this.props.layerId) {
          return {
            ...layer,
            shape: [...layer.shape, this.props.mousePosition],
          };
        }

        return layer;
      });
    });
  }

  undo(): void {
    this.props.setLayers((prevLayers) => {
      return prevLayers.map((layer) => {
        if (layer.id === this.props.layerId) {
          return {
            ...layer,
            shape: [...layer.shape.slice(0, -1)],
          };
        }

        return layer;
      });
    });
  }
}
