import { Button, ButtonGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FC, memo, useCallback } from "react";
import OlMap from "ol/Map";
import { Coordinate } from "ol/coordinate";
import { DEFAULT_MAP_ZOOM, MAP_EXTENT_COORDINATES } from "@/constants";
import { trackEvent } from "@/utils/matomo";
import "@/components/MapControls/MapControls.css";

interface MapControlsProps {
  map: OlMap;
  extent?: Coordinate;
  defaultZoom?: number;
  enableTracking?: boolean;
}

/**
 * Provides zoom and center controls for an OpenLayers map
 *
 * @component
 * @param {Object} props - Component props
 * @param {OlMap} props.map - OpenLayers Map instance to control
 * @param {Coordinate} [props.extent] - Optional coordinate extent to center the map on
 */
const MapControls: FC<MapControlsProps> = ({
  map,
  extent,
  defaultZoom = DEFAULT_MAP_ZOOM,
  enableTracking = false,
}) => {
  const view = map.getView();

  const onZoomIn = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const zoom = view.getZoom() ?? 0;
      view.animate({ zoom: zoom + 1, duration: 250 });
      
      if (enableTracking) {
        trackEvent({
          category: "Map",
          action: "Button Click",
          name: "Zoom In",
        });
      }
    },
    [view, enableTracking],
  );

  const onZoomOut = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const zoom = view.getZoom() ?? 0;
      view.animate({ zoom: zoom - 1, duration: 250 });
      
      if (enableTracking) {
        trackEvent({
          category: "Map",
          action: "Button Click",
          name: "Zoom Out",
        });
      }
    },
    [view, enableTracking],
  );

  const onCenter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      view.fit(extent ?? MAP_EXTENT_COORDINATES);
      view.setZoom(defaultZoom);
      
      if (enableTracking) {
        trackEvent({
          category: "Map",
          action: "Button Click",
          name: "Center Map",
        });
      }
    },
    [view, extent, defaultZoom, enableTracking],
  );

  return (
    <div className="zoom-control">
      <Button
        variant="light"
        className="zoom-btn mb-2"
        onClick={onCenter}
        aria-label="Center map to full extent"
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />
      </Button>

      <ButtonGroup vertical className="zoom-btn-group">
        <Button
          variant="light"
          onClick={onZoomIn}
          className="zoom-btn zoom-btn--grouped zoom-btn--first"
          aria-label="Zoom in"
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
        <Button
          variant="light"
          onClick={onZoomOut}
          className="zoom-btn zoom-btn--grouped zoom-btn--with-divider"
          aria-label="Zoom out"
        >
          <FontAwesomeIcon icon={faMinus} />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default memo(MapControls);
