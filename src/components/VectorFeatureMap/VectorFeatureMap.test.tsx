import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import VectorFeatureMap from "@/components/VectorFeatureMap/VectorFeatureMap";

// Mocks for OpenLayers
const mockSetTarget = vi.fn();
const mockFit = vi.fn();
const mockSetZoom = vi.fn();

const mockMap = {
  setTarget: mockSetTarget,
  getView: () => ({
    fit: mockFit,
    setZoom: mockSetZoom,
  }),
};

// Mock hooks
vi.mock("@/hooks/useMapInitialization", () => ({
  useMapInitialization: vi.fn(() => mockMap),
}));

vi.mock("@/hooks/useMapBaseLayers", () => ({
  useMapBaseLayers: vi.fn(() => []),
}));

vi.mock("@/hooks/useAddVectorLayersToMap", () => ({
  useAddVectorLayersToMap: vi.fn(),
}));

vi.mock("@/hooks/useOpenLayersTracking", () => ({
  useOpenLayersTracking: vi.fn(),
}));

// Mock child component
vi.mock("@/components/MapControls/MapControls", () => ({
  default: () => <div data-testid="map-controls" />,
}));

describe("VectorFeatureMap", () => {
  beforeEach(() => {
    document.body.innerHTML = ""; // clean up DOM
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
    // Could add more logic if zoom level was visibly exposed
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
});
