import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import EsriJSON from "ol/format/EsriJSON";

import { tile as tileStrategy } from "ol/loadingstrategy";
import { createXYZ } from "ol/tilegrid";
import { Style, Stroke } from "ol/style";
import { MAP_LAYER, MAP_URLS } from "@/constants";

const regionBoundaryStyle = new Style({
  stroke: new Stroke({
    color: "#2464a4",
    width: 2,
  }),
});

export const createRecreationRegionSource = (
  tileSize: number = MAP_LAYER.TILE_SIZE,
  maxZoom: number = MAP_LAYER.MAX_ZOOM_LEVEL,
) =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) =>
      `${MAP_URLS.recreationRegionBoundaries}/query/?` +
      `f=json` +
      `&where=1=1` +
      `&geometry=${extent.join(",")}` +
      `&geometryType=esriGeometryEnvelope` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&inSR=3857` +
      `&outSR=3857`,
    strategy: tileStrategy(createXYZ({ tileSize, maxZoom })),
  });

export const createRecreationRegionLayer = (source: VectorSource) =>
  new VectorLayer({
    source,
    style: regionBoundaryStyle,
  });
