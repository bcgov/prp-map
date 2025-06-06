import { Feature } from "ol";
import { Layer } from "ol/layer";
import { Coordinate } from "ol/coordinate";

export interface VectorLayerConfig {
  id: string;
  features?: Feature[]; // used if constructing from features
  layerInstance?: Layer; // used for already constructed layers like ArcGIS or WMS
  visible?: boolean;
  onLayerAdded?: (extent: Coordinate) => void;
}
