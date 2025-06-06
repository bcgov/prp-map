import { useEffect, useRef } from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import { Layer } from "ol/layer";
import { VectorLayerConfig } from "@/types";

interface UseMultipleVectorLayersProps {
  /** OpenLayers map instance */
  map: OlMap;
  /** Array of vector layer configurations */
  layers: VectorLayerConfig[];
}

/**
 * Hook to manage multiple vector layers on an OpenLayers map.
 * Efficiently adds, updates, or removes layers with minimal re-renders.
 */

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

    // Add new or replace existing
    layers.forEach(({ id, features, layerInstance, visible = true }) => {
      const existing = addedLayers.current.get(id);
      if (existing) {
        existing.setVisible(visible);
        return;
      }

      let layer: Layer | null = null;

      if (layerInstance) {
        layer = layerInstance;
      } else if (features?.length) {
        layer = new VectorLayer({
          source: new VectorSource({ features }),
        });
      }

      if (layer) {
        layer.set("id", id);
        layer.setVisible(visible);
        map.addLayer(layer);
        addedLayers.current.set(id, layer);
      }
    });
  }, [map, layers]);
};
