import {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Coordinate } from "ol/coordinate";
import { useAddVectorLayersToMap } from "@/hooks/useAddVectorLayersToMap";
import { useMapBaseLayers } from "@/hooks/useMapBaseLayers";
import { useOpenLayersTracking } from "@/hooks/useOpenLayersTracking";
import { useMapInitialization } from "@/hooks/useMapInitialization";
import MapControls from "@/components/MapControls/MapControls";
import { DEFAULT_MAP_ZOOM, MAP_LAYER } from "@/constants";
import { VectorLayerConfig } from "@/types";
import "@/components/VectorFeatureMap/VectorFeatureMap.css";

interface VectorFeatureMapProps {
  /** Optional CSS styles to apply to the map container */
  style?: React.CSSProperties;
  /** Array of vector layer configurations to display on the map */
  layers: VectorLayerConfig[];
  /** Child components to render within the map context */
  children?: ReactNode;
  /** Enables or disables tracking with matomo */
  enableTracking?: boolean;
  /** Optional initial zoom level for the map */
  defaultZoom?: number;
  /** Optional minimum zoom level for the map */
  minZoom?: number;
  /** Optional maximum zoom level for the map */
  maxZoom?: number;
  /** Optional center coordinate for the map */
  center?: [number, number];
  /** Optional extent to fit the map to */
  extent?: [number, number, number, number];
}

/**
 * A map component that displays vector features with custom styling
 * Uses OpenLayers library for map rendering and management
 */

const VectorFeatureMap = forwardRef<any, VectorFeatureMapProps>(
  (
    {
      enableTracking = false,
      style,
      layers,
      children,
      defaultZoom = DEFAULT_MAP_ZOOM,
      minZoom = MAP_LAYER.MIN_ZOOM_LEVEL,
      maxZoom = MAP_LAYER.MAX_ZOOM_LEVEL,
      center,
      extent,
    },
    ref,
  ) => {
    const [featureExtent, setFeatureExtent] = useState<Coordinate | null>(null);
    const baseLayers = useMapBaseLayers();
    const map = useMapInitialization(baseLayers, {
      defaultZoom,
      minZoom,
      maxZoom,
      center,
      extent,
    });

    useImperativeHandle(ref, () => ({
      getMap: () => map,
    }));

    // Track if map has already been fit to extent once
    const hasFittedRef = useRef(false);

    const handleCallback = useCallback(
      (extent: Coordinate) => {
        if (!hasFittedRef.current) {
          const view = map.getView();
          view.fit(extent);
          view.setZoom(defaultZoom);
          setFeatureExtent(extent);
          hasFittedRef.current = true;
        }
      },
      [map],
    );

    const memoizedLayers = useMemo(() => {
      return layers?.map((layer) => ({
        ...layer,
        onLayerAdded: handleCallback,
      }));
    }, [layers, handleCallback]);

    useAddVectorLayersToMap({ map, layers: memoizedLayers });

    useEffect(() => {
      const targetElement = document.getElementById("map-container");
      if (targetElement) {
        map.setTarget(targetElement);
      }
    }, [map]);

    useOpenLayersTracking(map, enableTracking);

    return (
      <div
        id="map-container"
        data-testid="map-container"
        style={style}
        aria-label="styled-vector-feature-map"
      >
        {children}
        <MapControls
          map={map}
          extent={featureExtent ?? undefined}
          defaultZoom={defaultZoom}
        />
      </div>
    );
  },
);

export default VectorFeatureMap;
