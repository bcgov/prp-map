import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { BaseLayerOption } from "@/types";
import { trackEvent } from "@/utils/matomo";
import "./BaseLayerControls.css";

interface BaseLayerControlsProps {
  baseMaps: BaseLayerOption[];
  activeBaseId: string;
  onChange: (id: string) => void;
  style?: React.CSSProperties;
  enableTracking?: boolean;
}

const BaseLayerControls: React.FC<BaseLayerControlsProps> = ({
  baseMaps,
  activeBaseId,
  onChange,
  style,
  enableTracking = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get initial base layer from URL parameter
  const getInitialBaseId = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const baseLayerParam = urlParams.get("base_layer");
    const validBaseIds = baseMaps.map((b) => b.id);

    if (baseLayerParam && validBaseIds.includes(baseLayerParam)) {
      return baseLayerParam;
    }

    return baseMaps[0]?.id || "osm";
  }, [baseMaps]);

  // Update active base ID when URL parameter changes
  useEffect(() => {
    const newBaseId = getInitialBaseId();
    if (newBaseId !== activeBaseId) {
      onChange(newBaseId);
    }
  }, [baseMaps, getInitialBaseId, activeBaseId, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBaseMapChange = useCallback(
    (id: string) => {
      onChange(id);

      if (enableTracking) {
        const selectedBaseMap = baseMaps.find((b) => b.id === id);
        trackEvent({
          category: "Map",
          action: "Base Layer Selection",
          name: selectedBaseMap?.name ?? id,
        });
      }

      // Update URL search parameter
      const url = new URL(window.location.href);
      url.searchParams.set("base_layer", id);
      window.history.replaceState({}, "", url.toString());
    },
    [onChange, enableTracking, baseMaps],
  );

  return (
    <div className="base-layer-controls" ref={containerRef} style={style}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`base-layer-toggle-button ${isOpen ? "open" : ""}`}
        aria-expanded={isOpen}
        aria-label="Toggle basemap options"
      >
        <FontAwesomeIcon icon={faGlobe} />
      </button>

      {isOpen && (
        <div className="base-layer-options" data-testid="base-layer-options">
          {baseMaps.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBaseMapChange(b.id)}
              aria-pressed={activeBaseId === b.id}
              className="base-layer-option"
            >
              {b.image && (
                <img
                  src={b.image}
                  alt={`${b.name} preview`}
                  className="base-layer-preview"
                />
              )}
              <span className="base-layer-name">{b.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BaseLayerControls;
