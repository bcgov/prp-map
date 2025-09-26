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
import { useBaseLayers } from "@/hooks/useBaseLayers";
import { useOpenLayersTracking } from "@/hooks/useOpenLayersTracking";
import { useMapInitialization } from "@/hooks/useMapInitialization";
import MapControls from "@/components/MapControls/MapControls";
import BaseLayerControls from "@/components/BaseLayerControls/BaseLayerControls";
import { DEFAULT_MAP_ZOOM, MAP_LAYER } from "@/constants";
import { VectorLayerConfig, BaseLayerOption } from "@/types";
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
  /** Optional custom base layers to use instead of default BC base layer */
  baseLayers?: BaseLayerOption[];
  /** Enables base layer controls when multiple base layers are provided */
  enableBaseLayerControls?: boolean;
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
      baseLayers,
      enableBaseLayerControls = true,
    },
    ref,
  ) => {
    const [featureExtent, setFeatureExtent] = useState<Coordinate | null>(null);
    const [activeBaseId, setActiveBaseId] = useState<string>(
      baseLayers?.[0]?.id || "default",
    );

    const mapBaseLayers = useBaseLayers(baseLayers);
    const hasMultipleBaseLayers = (baseLayers?.length ?? 0) > 1;
    const map = useMapInitialization(mapBaseLayers, {
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

    // Handle base layer changes
    const handleBaseMapChange = useCallback((id: string) => {
      setActiveBaseId(id);
    }, []);

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

    // Manage base layer switching when custom base layers are provided
    useEffect(() => {
      if (!map || !baseLayers?.length) return;

      const activeBaseLayer = baseLayers.find(
        (bl) => bl.id === activeBaseId,
      )?.layer;
      if (!activeBaseLayer) return;

      // Remove all base layers
      const mapLayers = map.getLayers();
      baseLayers.forEach((bl) => {
        if (mapLayers.getArray().includes(bl.layer)) {
          map.removeLayer(bl.layer);
        }
      });

      // Add the active base layer
      mapLayers.insertAt(0, activeBaseLayer);
    }, [map, baseLayers, activeBaseId]);

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
        {hasMultipleBaseLayers && enableBaseLayerControls && (
          <BaseLayerControls
            baseMaps={baseLayers || []}
            activeBaseId={activeBaseId}
            onChange={handleBaseMapChange}
            enableTracking={enableTracking}
          />
        )}
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
