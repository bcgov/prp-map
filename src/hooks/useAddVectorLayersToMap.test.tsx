import { render } from "@testing-library/react";
import { useAddVectorLayersToMap } from "@/hooks/useAddVectorLayersToMap";
import { VectorLayerConfig } from "@/types";
import { vi } from "vitest";

class MockLayer {
  _visible = true;
  _source: any = { getExtent: vi.fn(() => [0, 0, 10, 10]) };
  _id: string | undefined;

  setVisible = vi.fn();
  set = vi.fn();
  get = vi.fn();
  getSource = vi.fn(() => this._source);
}

const createMockMap = () => {
  const layers = new Set<any>();
  return {
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    once: vi.fn((event, cb) => {
      if (event === "rendercomplete") cb();
    }),
    getLayers: () => layers,
  };
};

const TestComponent = ({
  map,
  layers,
}: {
  map: any;
  layers: VectorLayerConfig[];
}) => {
  useAddVectorLayersToMap({ map, layers });
  return null;
};

describe("useAddVectorLayersToMap", () => {
  let mapMock: ReturnType<typeof createMockMap>;
  let mockLayer: MockLayer;

  beforeEach(() => {
    mapMock = createMockMap();
    mockLayer = new MockLayer();
  });

  it("adds new layers and calls onLayerAdded on rendercomplete", () => {
    const onLayerAdded = vi.fn();

    const layers: VectorLayerConfig[] = [
      {
        id: "test-layer",
        layerInstance: mockLayer as any,
        visible: true,
        onLayerAdded,
      },
    ];

    render(<TestComponent map={mapMock as any} layers={layers} />);

    expect(mapMock.addLayer).toHaveBeenCalledWith(mockLayer);
    expect(mockLayer.setVisible).toHaveBeenCalledWith(true);
    expect(onLayerAdded).toHaveBeenCalledWith([0, 0, 10, 10]);
  });

  it("removes layers that are not in the new layers array", () => {
    const existingLayer = new MockLayer();
    existingLayer.set("id", "existing-layer");

    const layers1: VectorLayerConfig[] = [
      {
        id: "existing-layer",
        layerInstance: existingLayer as any,
        visible: true,
      },
    ];

    const { rerender } = render(
      <TestComponent map={mapMock as any} layers={layers1} />,
    );

    expect(mapMock.addLayer).toHaveBeenCalledWith(existingLayer);

    const layers2: VectorLayerConfig[] = [
      {
        id: "new-layer",
        layerInstance: mockLayer as any,
        visible: true,
      },
    ];

    rerender(<TestComponent map={mapMock as any} layers={layers2} />);

    expect(mapMock.removeLayer).toHaveBeenCalledWith(existingLayer);
    expect(mapMock.addLayer).toHaveBeenCalledWith(mockLayer);
  });

  it("updates visibility of existing layers without adding new layers", () => {
    const layer = new MockLayer();
    layer.set("id", "existing-layer");

    const layers1: VectorLayerConfig[] = [
      {
        id: "existing-layer",
        layerInstance: layer as any,
        visible: true,
      },
    ];

    const { rerender } = render(
      <TestComponent map={mapMock as any} layers={layers1} />,
    );

    expect(mapMock.addLayer).toHaveBeenCalledWith(layer);
    expect(layer.setVisible).toHaveBeenCalledWith(true);

    const layers2: VectorLayerConfig[] = [
      {
        id: "existing-layer",
        layerInstance: layer as any,
        visible: false,
      },
    ];

    rerender(<TestComponent map={mapMock as any} layers={layers2} />);
    expect(layer.setVisible).toHaveBeenCalledWith(false);
  });
});
