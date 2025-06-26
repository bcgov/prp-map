import { renderHook } from "@testing-library/react";
import { useMapInitialization } from "@/hooks/useMapInitialization";
import OlMap from "ol/Map";
import OlView from "ol/View";
import { DEFAULT_MAP_ZOOM, MAP_CENTER_COORDINATES } from "@/constants";

describe("useMapInitialization", () => {
  it("returns an OlMap instance with correct config", () => {
    const layers: any[] = [];

    const { result } = renderHook(
      ({ layers, zoom }) => useMapInitialization(layers, zoom),
      {
        initialProps: { layers, zoom: undefined },
      },
    );

    const map = result.current;

    expect(map).toBeInstanceOf(OlMap);

    const view = map.getView();
    expect(view).toBeInstanceOf(OlView);
    expect(view.getCenter()).toEqual(MAP_CENTER_COORDINATES);
    expect(view.getZoom()).toBe(DEFAULT_MAP_ZOOM);
    expect(view.getMinZoom()).toBe(6);
    expect(view.getMaxZoom()).toBe(20);
    expect(view.getRotation()).toBe(0);

    expect(map.getLayers().getLength()).toBe(layers.length);
  });
});
