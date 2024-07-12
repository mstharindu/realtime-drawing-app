import { Dispatch, SetStateAction } from 'react';
import { Layer } from './types';
import { SelectedPayload } from './providers/storage-provider';

export interface CreateLayerPayload {
  action: 'create';
  payload: { layer: Layer };
}

export interface DeleteLayerPayload {
  action: 'delete';
  payload: { layerId: string };
}

export interface UpdateLayerPayload {
  action: 'update';
  payload: { layerId: string; payload: Partial<Layer> };
}

export interface CreateLayerProps {
  layer: Layer;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  cb: (payload: CreateLayerPayload | DeleteLayerPayload) => void;
}

// Utility type to enforce at least one property
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];

export interface UpdateLayerProps {
  layerId: string;
  payload: Partial<Layer>;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  setSelectedPayload?: Dispatch<SetStateAction<SelectedPayload | null>>;
  cb: (payload: UpdateLayerPayload) => void;
}

export interface DeleteLayerProps {
  layerId: string;
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  cb: (payload: CreateLayerPayload | DeleteLayerPayload) => void;
}

export abstract class Command<T> {
  props: T;
  constructor(props: T) {
    this.props = props;
  }
  abstract execute(): void;
  abstract undo(): void;
  abstract executeCb(): void;
}

export class CreateLayerCommand<T extends CreateLayerProps> extends Command<T> {
  constructor(props: T) {
    super(props);
    this.props = props;
  }

  execute(): void {
    this.props.setLayers((prevLayers) => {
      const layerExists = prevLayers.find(
        (layer) => layer.id === this.props.layer.id
      );

      if (layerExists) {
        return prevLayers;
      }

      return [...prevLayers, this.props.layer];
    });
    this.props.cb({ action: 'create', payload: { layer: this.props.layer } });
  }
  undo(): void {
    this.props.setLayers((layers) =>
      layers.filter((l) => l.id !== this.props.layer.id)
    );
    this.props.cb({
      action: 'delete',
      payload: { layerId: this.props.layer.id },
    });
  }
  executeCb(): void {}
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

    this.props.cb({
      action: 'update',
      payload: { layerId: this.props.layerId, payload: this.props.payload },
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

    this.props.cb({
      action: 'update',
      payload: { layerId: this.props.layerId, payload: this.previousPayload },
    });
  }

  executeCb(): void {
    if (this.props.setSelectedPayload) {
      this.props.setSelectedPayload({
        layerId: this.props.layerId,
        affectedAttributes: Object.keys(this.previousPayload),
      });
    }

    this.props.cb({
      action: 'update',
      payload: { layerId: this.props.layerId, payload: this.props.payload },
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

    this.props.cb({
      action: 'delete',
      payload: { layerId: this.props.layerId },
    });
  }
  undo(): void {
    this.props.setLayers((prevLayers) => {
      if (this.deletedLayer) return [...prevLayers, this.deletedLayer];

      return prevLayers;
    });

    if (this.deletedLayer) {
      this.props.cb({
        action: 'create',
        payload: { layer: this.deletedLayer },
      });
    }
  }
  executeCb(): void {}
}
