import { getWidth, getHeight } from "ol/extent";
import type { Extent } from "ol/extent";

export const isEmptyExtent = (extent: Extent) => {
  const width = getWidth(extent);
  const height = getHeight(extent);
  return !isFinite(width) || !isFinite(height) || width <= 0 || height <= 0;
};
