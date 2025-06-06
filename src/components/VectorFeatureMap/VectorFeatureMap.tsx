import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Coordinate } from "ol/coordinate";
import {
  useAddVectorLayersToMap,
  useMapBaseLayers,
  useMapInitialization,
  useOpenLayersTracking,
} from "@/hooks";
import MapControls from "@/components/MapControls/MapControls";
import { DEFAULT_MAP_ZOOM } from "@/constants";
import { VectorLayerConfig } from "@/types";

interface VectorFeatureMapProps {
  /** Optional CSS styles to apply to the map container */
  style?: React.CSSProperties;
  /** Array of vector layer configurations to display on the map */
  layers: VectorLayerConfig[];
  /** Child components to render within the map context */
  children?: ReactNode;
  /** Enables or disables tracking with matomo */
  enableTracking?: boolean;
}

/**
 * A map component that displays vector features with custom styling
 * Uses OpenLayers library for map rendering and management
 */

const VectorFeatureMap: React.FC<VectorFeatureMapProps> = ({
  enableTracking = false,
  style,
  layers,
  children,
}) => {
  const [featureExtent, setFeatureExtent] = useState<Coordinate | null>(null);
  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  // Track if map has already been fit to extent once
  const hasFittedRef = useRef(false);

  const handleCallback = useCallback(
    (extent: Coordinate) => {
      if (!hasFittedRef.current) {
        const view = map.getView();
        view.fit(extent);
        view.setZoom(DEFAULT_MAP_ZOOM);
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
      <MapControls map={map} extent={featureExtent ?? undefined} />
    </div>
  );
};

export default memo(VectorFeatureMap);
