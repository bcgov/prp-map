import { useMemo } from "react";
import OlMap from "ol/Map";
import OlView from "ol/View";
import BaseLayer from "ol/layer/Base";
import { defaults as defaultInteractions } from "ol/interaction";
import MouseWheelZoom from "ol/interaction/MouseWheelZoom";
import PinchZoom from "ol/interaction/PinchZoom";
import {
  DEFAULT_MAP_ZOOM,
  MAP_CENTER_COORDINATES,
  MAP_EXTENT_COORDINATES,
} from "@/constants";

/**
 * Creates and configures an OpenLayers map instance
 * @param layers - Array of base layers to add to the map
 * @returns Configured OpenLayers map instance
 */
export const useMapInitialization = (
  layers: BaseLayer[],
  zoomSettings: {
    defaultZoom?: number;
    minZoom?: number;
    maxZoom?: number;
  } = {},
) => {
  return useMemo(() => {
    const view = new OlView({
      center: MAP_CENTER_COORDINATES,
      zoom: zoomSettings.defaultZoom ?? DEFAULT_MAP_ZOOM,
      enableRotation: false,
      extent: MAP_EXTENT_COORDINATES,
      minZoom: zoomSettings.minZoom ?? 6,
      maxZoom: zoomSettings.maxZoom ?? 20,
    });

    const interactions = defaultInteractions({
      mouseWheelZoom: false,
      pinchZoom: false,
    }).extend([
      new MouseWheelZoom({ duration: 300 }),
      new PinchZoom({ duration: 300 }),
    ]);

    return new OlMap({
      controls: [],
      layers,
      view,
      interactions,
    });
  }, [layers]);
};
