import { useEffect, useMemo } from "react";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { applyStyle } from "ol-mapbox-style";
import { useGetMapStyles } from "@/hooks";
import { MAP_URLS } from "@/constants";

/**
 * Hook that creates and manages vector tile base layers
 * @returns Array of base layers with applied styles
 */
export const useMapBaseLayers = () => {
  const { data: glStyles } = useGetMapStyles();

  const baseLayers = useMemo(
    () => [
      new VectorTileLayer({
        declutter: true,
        renderMode: "hybrid",
        renderBuffer: 100,
        updateWhileAnimating: true,
        // Preload controls how many zoom levels beyond the current zoom level OpenLayers will
        // load tiles for in advance at the cost of memory and cpu. Reduces white tiles while panning/zooming.
        preload: 2,
        updateWhileInteracting: true,
        source: new VectorTileSource({
          format: new MVT(),
          url: MAP_URLS.baseLayer,
          wrapX: true,
          cacheSize: 1024,
        }),
      }),
    ],
    [],
  );

  useEffect(() => {
    if (glStyles) {
      baseLayers.forEach((baseLayer) => {
        applyStyle(baseLayer, glStyles, "esri");
      });
    }
  }, [glStyles, baseLayers]);

  return baseLayers;
};
