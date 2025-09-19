import { useMemo } from "react";
import { BaseLayerOption } from "@/types";
import { useStyledLayer } from "./useStyledLayer";
import { MAP_URLS } from "@/constants";

/**
 * Hook that provides flexible base layer management
 * Can use either custom base layers or default BC base layers
 * @param customBaseLayers - Optional array of custom base layer options
 * @returns Array of base layers (either custom or default)
 */
export const useBaseLayers = (customBaseLayers?: BaseLayerOption[]) => {
  const defaultBaseLayer = useStyledLayer(MAP_URLS.baseLayer, MAP_URLS.styles);

  return useMemo(() => {
    if (customBaseLayers?.length) {
      return customBaseLayers.map((bl) => bl.layer);
    }
    return [defaultBaseLayer];
  }, [customBaseLayers, defaultBaseLayer]);
};
