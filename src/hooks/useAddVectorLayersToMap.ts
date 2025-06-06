import { useEffect, useRef } from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import { Layer } from "ol/layer";
import { VectorLayerConfig } from "@/types";

interface UseMultipleVectorLayersProps {
  map: OlMap;
  layers: VectorLayerConfig[];
}

export const useAddVectorLayersToMap = ({
  map,
  layers,
}: UseMultipleVectorLayersProps) => {
  const addedLayers = useRef<Map<string, Layer>>(new Map());

  useEffect(() => {
    if (!map) return;

    const newIds = new Set(layers.map((l) => l.id));

    // Remove old layers
    addedLayers.current.forEach((layer, id) => {
      if (!newIds.has(id)) {
        map.removeLayer(layer);
        addedLayers.current.delete(id);
      }
    });

    // Add or update layers
    layers.forEach(
      ({ id, features, layerInstance, visible = true, onLayerAdded }) => {
        const existing = addedLayers.current.get(id);
        if (existing) {
          existing.setVisible(visible);
          return;
        }

        let layer: Layer | null = null;

        if (layerInstance) {
          layer = layerInstance;

          const source = (layer as any).getSource?.();
          if (source && onLayerAdded) {
            map.once("rendercomplete", () => {
              const extent = source.getExtent();
              onLayerAdded(extent);
            });
          }
        } else if (features?.length) {
          const source = new VectorSource({ features });
          layer = new VectorLayer({ source });

          if (onLayerAdded) {
            map.once("rendercomplete", () => {
              const extent = source.getExtent();
              onLayerAdded(extent);
            });
          }
        }

        if (layer) {
          layer.set("id", id);
          layer.setVisible(visible);
          map.addLayer(layer);
          addedLayers.current.set(id, layer);
        }
      },
    );
  }, [map, layers]);
};
