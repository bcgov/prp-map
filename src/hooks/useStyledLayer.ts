import { useMemo, useEffect } from "react";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { applyStyle } from "ol-mapbox-style";
import { useGetMapStyles } from "./useGetMapStyles";

/**
 * Hook that creates a styled vector tile layer
 * @param mapUrl - URL for the vector tile service
 * @param styleUrl - URL for the map style configuration
 * @param styleType - Type of style to apply (defaults to 'esri')
 * @returns A styled VectorTileLayer
 */
export const useStyledLayer = (
  mapUrl: string,
  styleUrl: string,
  styleType: string = "esri",
) => {
  const { data: glStyles } = useGetMapStyles(styleUrl);

  const layer = useMemo(
    () =>
      new VectorTileLayer({
        declutter: true,
        renderMode: "hybrid",
        renderBuffer: 100,
        updateWhileAnimating: true,
        preload: 2,
        updateWhileInteracting: true,
        source: new VectorTileSource({
          format: new MVT(),
          url: mapUrl,
          wrapX: true,
          cacheSize: 1024,
        }),
        // Hide the layer until styles are applied to prevent flash
        visible: false,
      }),
    [mapUrl],
  );

  useEffect(() => {
    if (glStyles) {
      // Fix sprite URL resolution by providing the styleUrl option
      // This helps ol-mapbox-style resolve relative URLs correctly
      const applyStyleOptions = {
        styleUrl: styleUrl,
      };

      applyStyle(layer, glStyles, styleType, applyStyleOptions);

      // Make the layer visible after styles are applied
      layer.setVisible(true);
    }
  }, [glStyles, layer, styleType, styleUrl]);

  return layer;
};
