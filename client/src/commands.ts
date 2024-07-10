import { Dispatch, SetStateAction } from 'react';
import { Layer } from './types';

export interface CreateLayerProps {
  layer: Layer;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
}

// Utility type to enforce at least one property
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export interface UpdateLayerProps {
  layerId: string;
  payload: AtLeastOne<Layer>;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
}

export interface DeleteLayerProps {
  layerId: string;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
}

export abstract class Command<T> {
  props: T;
  constructor(props: T) {
    this.props = props;
  }
  abstract execute(): void;
  abstract undo(): void;
}

export class CreateLayerCommand<T extends CreateLayerProps> extends Command<T> {
  constructor(props: T) {
    super(props);
    this.props = props;
  }

  execute(): void {
    this.props.setLayers((prevLayers) => [...prevLayers, this.props.layer]);
  }
  undo(): void {
    this.props.setLayers((layers) =>
      layers.filter((l) => l.id !== this.props.layer.id)
    );
  }
}

export class UpdateLayerCommand<T extends UpdateLayerProps> extends Command<T> {
  private previousPayload: Partial<Layer> = {};

  constructor(props: T) {
    super(props);
    this.props = props;
  }

  execute(): void {
    this.props.setLayers((prevLayers) => {
      return prevLayers.map((layer) => {
        if (layer.id === this.props.layerId) {
          // Store the previous state for undo
          Object.keys(this.props.payload).forEach((key) => {
            const typedKey = key as keyof Layer;
            this.previousPayload = {
              ...this.previousPayload,
              [typedKey]: layer[typedKey],
            };
          });
          // Apply the new properties
          return { ...layer, ...this.props.payload };
        }
        return layer;
      });
    });
  }
  undo(): void {
    this.props.setLayers((prevLayers) => {
      return prevLayers.map((layer) => {
        if (layer.id === this.props.layerId) {
          return { ...layer, ...this.previousPayload };
        }
        return layer;
      });
    });
  }
}

export class DeleteLayerCommand<T extends DeleteLayerProps> extends Command<T> {
  private deletedLayer: Layer | null = null;

  constructor(props: T) {
    super(props);
    this.props = props;
  }

  execute(): void {
    this.props.setLayers((prevLayers) => {
      const index = prevLayers.findIndex(
        (l: Layer) => l.id === this.props.layerId
      );

      if (index === -1) return prevLayers;
      this.deletedLayer = prevLayers[index];
      return [...prevLayers.slice(0, index), ...prevLayers.slice(index + 1)];
    });
  }
  undo(): void {
    this.props.setLayers((prevLayers) => {
      if (this.deletedLayer) return [...prevLayers, this.deletedLayer];

      return prevLayers;
    });
  }
}
