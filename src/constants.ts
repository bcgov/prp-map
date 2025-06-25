// Coordinate Reference System (CRS) projections
export const MAP_PROJECTION_BC_ALBERS = "EPSG:3005";
export const MAP_PROJECTION_WEB_MERCATOR = "EPSG:3857";
export const MAP_PROJECTION_WGS84 = "EPSG:4326";

/**
 * Default map center coordinates in Web Mercator (EPSG:3857) projection
 * Centered on Williams Lake, British Columbia
 */
export const MAP_CENTER_COORDINATES = [-13599121.904043, 6826743.870206];

/**
 * Map extent coordinates defining the viewable boundary of British Columbia
 * Includes padding around the province border
 * Format: [West, South, East, North] in Web Mercator projection
 */
export const MAP_EXTENT_COORDINATES = [
  -17280139.91792959, 4325438.545421897, -11463395.850036409,
  10040592.902794234,
];

/**
 * URLs for map services
 * @property baseLayer - Vector tile service URL for BC base map
 * @property styles - URL for map styling configuration
 */
export const MAP_URLS = {
  baseLayer:
    "https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{x}/{y}.pbf",
  styles:
    "https://www.arcgis.com/sharing/rest/content/items/b1624fea73bd46c681fab55be53d96ae/resources/styles/root.json",
  recreationFeature:
    "https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/RecSitesReservesInterpForests_DetailsClosures_publicView/FeatureServer/0",
  recreationRegionBoundaries:
    "https://maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_admin_boundaries/MapServer/44",
};

/**
 * Default zoom level for the map
 */
export const DEFAULT_MAP_ZOOM = 8;

export enum MAP_LAYER {
  TILE_SIZE = 512,
  MIN_ZOOM_LEVEL = 0,
  MAX_ZOOM_LEVEL = 30,
  MAX_TEXT_RESOLUTION = 400,
  HIDE_AT_ZOOM_OUT_RESOLUTION = 2500,
}
