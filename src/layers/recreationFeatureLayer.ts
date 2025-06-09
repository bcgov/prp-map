import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import EsriJSON from "ol/format/EsriJSON";
import { tile as tileStrategy } from "ol/loadingstrategy";
import { createXYZ } from "ol/tilegrid";
import { Style } from "ol/style";
import { FeatureLike } from "ol/Feature";
import {
  featureLabelText,
  locationDotBlueIcon,
  locationDotRedIcon,
} from "@/styles/mapStyles";

import { MAP_LAYER, MAP_URLS } from "@/constants";
import { capitalizeWords } from "@/utils";

// Cache for styles and names to avoid unnecessary recalculations
const styleCache = new Map<string, Style>();
const nameCache = new Map<string, string>();

const getCapitalizedName = (name: string): string => {
  if (!nameCache.has(name)) {
    nameCache.set(name, capitalizeWords(name));
  }
  return nameCache.get(name)!;
};

export const createRecreationFeatureStyle = (
  maxTextResolution: number = MAP_LAYER.MAX_TEXT_RESOLUTION,
) => {
  return (feature: FeatureLike, resolution: number) => {
    const isClosed = feature.get("CLOSURE_IND") === "Y";
    const name = feature.get("PROJECT_NAME") || "Unnamed";
    const isLabelVisible = resolution < maxTextResolution;
    const label = isLabelVisible ? getCapitalizedName(name) : "";

    const key = `${isClosed}-${label}`;

    if (!styleCache.has(key)) {
      const icon = isClosed
        ? locationDotRedIcon.getImage()
        : locationDotBlueIcon.getImage();

      const style = new Style({
        image: icon ?? undefined,
        text: label ? featureLabelText(label) : undefined,
      });

      styleCache.set(key, style);
    }

    return styleCache.get(key)!;
  };
};

export const createRecreationFeatureSource = (
  tileSize: number = MAP_LAYER.TILE_SIZE,
  recResourceIds?: string[], // Optional filter for specific recResourceIds
) =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(",");
      const baseWhere = "1=1";
      let forestFilter = "";
      if (recResourceIds && recResourceIds.length > 0) {
        const quotedIds = recResourceIds.map((id) => `'${id}'`).join(",");
        forestFilter = `AND FOREST_FILE_ID IN (${quotedIds})`;
      }

      return (
        `${MAP_URLS.recreationFeature}/query/?` +
        `f=json` +
        `&where=${encodeURIComponent(`${baseWhere} ${forestFilter}`)}` +
        `&outFields=PROJECT_NAME,CLOSURE_IND,FOREST_FILE_ID` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: tileStrategy(createXYZ({ tileSize })),
    wrapX: false,
  });

export const createRecreationFeatureLayer = (
  source: VectorSource,
  options?: {
    declutter?: boolean;
    maxTextResolution: number;
    updateWhileInteracting?: boolean;
    updateWhileAnimating?: boolean;
    renderBuffer?: number;
  },
) =>
  new VectorLayer({
    source,
    style: createRecreationFeatureStyle(
      options?.maxTextResolution ?? MAP_LAYER.MAX_TEXT_RESOLUTION,
    ),
    declutter: options?.declutter ?? true,
    updateWhileInteracting: options?.updateWhileInteracting ?? true,
    updateWhileAnimating: options?.updateWhileAnimating ?? true,
    renderBuffer: options?.renderBuffer ?? 300,
  });
