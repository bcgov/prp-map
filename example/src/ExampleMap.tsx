import { CSSProperties, useMemo } from "react";
import "ol/ol.css";
import VectorFeatureMap from "@/components/VectorFeatureMap/VectorFeatureMap";
import {
  createRecreationFeatureSource,
  createRecreationFeatureLayer,
} from "@/layers";

const TILE_SIZE = 512;
const MAX_TEXT_RESOLUTION = 400;

interface SearchableMapProps {
  style?: CSSProperties;
}

const ExampleMap = ({ style }: SearchableMapProps) => {
  const featureSource = useMemo(
    () => createRecreationFeatureSource(TILE_SIZE),
    [],
  );

  const featureLayer = useMemo(
    () => createRecreationFeatureLayer(featureSource, MAX_TEXT_RESOLUTION),
    [featureSource],
  );

  const layers = useMemo(
    // Add layers here
    () => [{ id: "features", layerInstance: featureLayer, visible: true }],
    [featureLayer],
  );

  return <VectorFeatureMap style={style} layers={layers} />;
};

export default ExampleMap;
