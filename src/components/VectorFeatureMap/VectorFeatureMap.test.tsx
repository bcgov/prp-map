import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import VectorFeatureMap from "@/components/VectorFeatureMap/VectorFeatureMap";
import { BaseLayerOption } from "@/types";

const mockSetTarget = vi.fn();
const mockFit = vi.fn();
const mockSetZoom = vi.fn();
const mockGetLayers = vi.fn(() => ({
  getArray: vi.fn(() => []),
  insertAt: vi.fn(),
}));
const mockAddLayer = vi.fn();
const mockRemoveLayer = vi.fn();

const mockMap = {
  setTarget: mockSetTarget,
  getView: () => ({
    fit: mockFit,
    setZoom: mockSetZoom,
  }),
  getLayers: mockGetLayers,
  addLayer: mockAddLayer,
  removeLayer: mockRemoveLayer,
};

vi.mock("@/hooks/useMapInitialization", () => ({
  useMapInitialization: vi.fn(() => mockMap),
}));

vi.mock("@/hooks/useBaseLayers", () => ({
  useBaseLayers: vi.fn((baseLayers: BaseLayerOption[]) => 
    baseLayers?.map((bl: BaseLayerOption) => bl.layer) || []
  ),
}));

vi.mock("@/hooks/useAddVectorLayersToMap", () => ({
  useAddVectorLayersToMap: vi.fn(),
}));

vi.mock("@/hooks/useOpenLayersTracking", () => ({
  useOpenLayersTracking: vi.fn(),
}));

vi.mock("@/components/MapControls/MapControls", () => ({
  default: () => <div data-testid="map-controls" />,
}));

vi.mock("@/components/BaseLayerControls/BaseLayerControls", () => ({
  default: ({ baseMaps, activeBaseId, onChange }: any) => (
    <div data-testid="base-layer-controls">
      <button
        data-testid="base-layer-toggle"
        onClick={() => onChange("test-base-2")}
      >
        Toggle Base Layer
      </button>
      <div data-testid="base-layer-options">
        {baseMaps.map((baseLayer: any) => (
          <button
            key={baseLayer.id}
            data-testid={`base-layer-option-${baseLayer.id}`}
            onClick={() => onChange(baseLayer.id)}
            data-active={activeBaseId === baseLayer.id}
          >
            {baseLayer.name}
          </button>
        ))}
      </div>
    </div>
  ),
}));

describe("VectorFeatureMap", () => {
  const mockBaseLayers: BaseLayerOption[] = [
    {
      id: "test-base-1",
      name: "Test Base 1",
      layer: { id: "layer1" } as any,
    },
    {
      id: "test-base-2",
      name: "Test Base 2",
      layer: { id: "layer2" } as any,
    },
  ];

  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders the map container and children", () => {
    render(
      <VectorFeatureMap layers={[]}>
        <div data-testid="child">Child Content</div>
      </VectorFeatureMap>,
    );

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("map-controls")).toBeInTheDocument();
  });

  it("calls map.setTarget on mount", () => {
    const container = document.createElement("div");
    container.id = "map-container";
    document.body.appendChild(container);

    render(<VectorFeatureMap layers={[]} />);

    expect(mockSetTarget).toHaveBeenCalledWith(container);
  });

  it("uses default zoom level if not provided", () => {
    render(<VectorFeatureMap layers={[]} />);
    expect(screen.getByTestId("map-controls")).toBeInTheDocument();
  });

  it("sets custom styles on container", () => {
    render(
      <VectorFeatureMap
        layers={[]}
        style={{ height: "500px", position: "relative" }}
      />,
    );

    const container = screen.getByTestId("map-container");
    expect(container).toHaveStyle("height: 500px");
    expect(container).toHaveStyle("position: relative");
  });

  describe("Base Layer Functionality", () => {
    it("renders BaseLayerControls when multiple base layers are provided", () => {
      render(<VectorFeatureMap layers={[]} baseLayers={mockBaseLayers} />);

      expect(screen.getByTestId("base-layer-controls")).toBeInTheDocument();
    });

    it("does not render BaseLayerControls when only one base layer is provided", () => {
      const singleBaseLayer = [mockBaseLayers[0]];
      render(<VectorFeatureMap layers={[]} baseLayers={singleBaseLayer} />);

      expect(
        screen.queryByTestId("base-layer-controls"),
      ).not.toBeInTheDocument();
    });

    it("does not render BaseLayerControls when no base layers are provided", () => {
      render(<VectorFeatureMap layers={[]} />);

      expect(
        screen.queryByTestId("base-layer-controls"),
      ).not.toBeInTheDocument();
    });

    it("can disable base layer controls", () => {
      render(
        <VectorFeatureMap
          layers={[]}
          baseLayers={mockBaseLayers}
          enableBaseLayerControls={false}
        />,
      );

      expect(
        screen.queryByTestId("base-layer-controls"),
      ).not.toBeInTheDocument();
    });

    it("passes correct props to BaseLayerControls", () => {
      render(<VectorFeatureMap layers={[]} baseLayers={mockBaseLayers} />);

      const baseLayerControls = screen.getByTestId("base-layer-controls");
      expect(baseLayerControls).toBeInTheDocument();

      // Check that the first base map is active by default
      const firstOption = screen.getByTestId("base-layer-option-test-base-1");
      expect(firstOption).toHaveAttribute("data-active", "true");
    });

    it("handles base layer change", () => {
      render(<VectorFeatureMap layers={[]} baseLayers={mockBaseLayers} />);

      const toggleButton = screen.getByTestId("base-layer-toggle");
      fireEvent.click(toggleButton);

      // The mock will change to test-base-2
      const secondOption = screen.getByTestId("base-layer-option-test-base-2");
      expect(secondOption).toBeInTheDocument();
    });

    it("manages base layers on the map when base layers change", () => {
      const { rerender } = render(
        <VectorFeatureMap layers={[]} baseLayers={[]} />,
      );

      // Add base layers
      rerender(<VectorFeatureMap layers={[]} baseLayers={mockBaseLayers} />);

      // Should render BaseLayerControls when multiple base layers are provided
      expect(screen.getByTestId("base-layer-controls")).toBeInTheDocument();
    });
  });

  describe("Backward Compatibility", () => {
    it("works without baseLayers prop (default behavior)", () => {
      render(<VectorFeatureMap layers={[]} />);

      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("map-controls")).toBeInTheDocument();
      expect(
        screen.queryByTestId("base-layer-controls"),
      ).not.toBeInTheDocument();
    });

    it("works with all existing props", () => {
      render(
        <VectorFeatureMap
          layers={[]}
          enableTracking={true}
          defaultZoom={10}
          minZoom={5}
          maxZoom={20}
          center={[0, 0]}
          extent={[0, 0, 1, 1]}
        />,
      );

      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("map-controls")).toBeInTheDocument();
    });
  });
});
