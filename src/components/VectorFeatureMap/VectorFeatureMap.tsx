import { ReactNode, useCallback, useEffect, useState } from "react";
import { Feature } from "ol";
import { StyleLike } from "ol/style/Style";
import {
  useAddVectorLayerToMap,
  useMapBaseLayers,
  useMapInitialization,
  useOpenLayersTracking,
} from "@/hooks";
import { Coordinate } from "ol/coordinate";
import { MapControls } from "@";
import { DEFAULT_MAP_ZOOM } from "@/constants";
import "@/components/VectorFeatureMap/VectorFeatureMap.scss";

interface StyledVectorFeatureMapProps {
  /** Child components to render within the map context */
  children?: ReactNode;
  /** Enable matomo tracking for map interactions */
  enableMatomoTracking?: boolean;
  /** Array of OpenLayers features to display on the map as vector layers */
  features: Feature[];
  /** Style configuration for the vector features */
  layerStyle: StyleLike;
  /** Optional CSS styles to apply to the map container */
  style?: React.CSSProperties;
}

/**
 * A map component that displays vector features with custom styling
 * Uses OpenLayers library for map rendering and management
 */
const VectorFeatureMap: React.FC<StyledVectorFeatureMapProps> = ({
  children,
  enableMatomoTracking = false,
  features,
  layerStyle,
  style,
}) => {
  const [featureExtent, setFeatureExtent] = useState<Coordinate>();
  const baseLayers = useMapBaseLayers();
  const map = useMapInitialization(baseLayers);

  // centers the map on the given extent
  const handleCallback = useCallback(
    (extent: Coordinate) => {
      const view = map.getView();
      view.fit(extent);
      view.setZoom(DEFAULT_MAP_ZOOM);
      setFeatureExtent(extent);
    },
    [map],
  );

  // add the given features are vector layers
  useAddVectorLayerToMap({
    map,
    features,
    layerStyle,
    onLayerAdded: handleCallback,
  });

  // track map interactions
  useOpenLayersTracking(map, enableMatomoTracking);

  useEffect(() => {
    const targetElement = document.getElementById("map-container");
    if (targetElement) {
      map.setTarget(targetElement);
    }
  }, [map]);

  return (
    <div
      id="map-container"
      className="map-container"
      data-testid="map-container"
      style={{
        width: "500px",
        height: "500px",
        ...style,
      }}
      aria-label="styled-vector-feature-map"
    >
      {children}
      <MapControls map={map} extent={featureExtent} />
    </div>
  );
};

export default VectorFeatureMap;
