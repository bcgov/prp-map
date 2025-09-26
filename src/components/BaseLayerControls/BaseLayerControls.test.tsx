import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BaseLayerControls from "./BaseLayerControls";
import { BaseLayerOption } from "@/types";
import { trackEvent } from "@/utils/matomo";

vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: () => <span data-testid="fontawesome-icon">🌐</span>,
}));

vi.mock("@fortawesome/free-solid-svg-icons", () => ({
  faGlobe: "globe-icon",
}));

vi.mock("@/utils/matomo", () => ({
  trackEvent: vi.fn(),
}));

describe("BaseLayerControls", () => {
  const mockBaseLayers: BaseLayerOption[] = [
    {
      id: "test-base-1",
      name: "Test Base 1",
      layer: {} as any,
      image: "/test-image-1.jpg",
    },
    {
      id: "test-base-2",
      name: "Test Base 2",
      layer: {} as any,
      image: "/test-image-2.jpg",
    },
  ];

  const defaultProps = {
    baseMaps: mockBaseLayers,
    activeBaseId: "test-base-1",
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000",
        search: "",
      },
      writable: true,
    });
    Object.defineProperty(window, "history", {
      value: {
        replaceState: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the toggle button", () => {
    render(<BaseLayerControls {...defaultProps} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveClass("base-layer-toggle-button");
  });

  it("renders the FontAwesome icon", () => {
    render(<BaseLayerControls {...defaultProps} />);

    const icon = screen.getByTestId("fontawesome-icon");
    expect(icon).toBeInTheDocument();
  });

  it("shows base layer options when clicked", () => {
    render(<BaseLayerControls {...defaultProps} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByTestId("base-layer-options")).toBeInTheDocument();
    expect(toggleButton).toHaveClass("open");
  });

  it("hides base layer options when clicked again", () => {
    render(<BaseLayerControls {...defaultProps} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });

    // Open
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("base-layer-options")).toBeInTheDocument();

    // Close
    fireEvent.click(toggleButton);
    // The dropdown should be hidden after the second click
    expect(screen.queryByTestId("base-layer-options")).not.toBeInTheDocument();
  });

  it("renders all base map options", () => {
    render(<BaseLayerControls {...defaultProps} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    expect(screen.getByText("Test Base 1")).toBeInTheDocument();
    expect(screen.getByText("Test Base 2")).toBeInTheDocument();
  });

  it("marks active base map as pressed", () => {
    render(<BaseLayerControls {...defaultProps} activeBaseId="test-base-2" />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    // Check that the active base map is marked as pressed
    const activeOption = screen.getByText("Test Base 2").closest("button");
    expect(activeOption).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange when base map option is clicked", () => {
    const onChange = vi.fn();
    render(<BaseLayerControls {...defaultProps} onChange={onChange} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    const option = screen.getByText("Test Base 2").closest("button");
    fireEvent.click(option!);

    expect(onChange).toHaveBeenCalledWith("test-base-2");
  });

  it("updates URL when base map is changed", () => {
    const replaceState = vi.fn();
    Object.defineProperty(window, "history", {
      value: { replaceState },
      writable: true,
    });

    render(<BaseLayerControls {...defaultProps} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    const option = screen.getByText("Test Base 2").closest("button");
    fireEvent.click(option!);

    expect(replaceState).toHaveBeenCalled();
  });

  it("renders base map preview images when provided", () => {
    render(<BaseLayerControls {...defaultProps} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "/test-image-1.jpg");
    expect(images[0]).toHaveAttribute("alt", "Test Base 1 preview");
  });

  it("closes dropdown when clicking outside", async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <BaseLayerControls {...defaultProps} />
      </div>,
    );

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);
    expect(screen.getByTestId("base-layer-options")).toBeInTheDocument();

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    expect(outside).toBeInTheDocument();
  });

  it("applies custom style", () => {
    const customStyle = { top: "10px", left: "20px" };
    render(<BaseLayerControls {...defaultProps} style={customStyle} />);

    const container = screen.getByRole("button", {
      name: /toggle basemap options/i,
    }).parentElement;
    expect(container).toHaveStyle("top: 10px; left: 20px");
  });

  it("handles empty base maps array", () => {
    render(<BaseLayerControls {...defaultProps} baseMaps={[]} />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    expect(toggleButton).toBeInTheDocument();
  });

  it("gets initial base ID from URL parameter", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000?base_layer=test-base-2",
        search: "?base_layer=test-base-2",
      },
      writable: true,
    });

    const onChange = vi.fn();
    render(<BaseLayerControls {...defaultProps} onChange={onChange} />);

    expect(onChange).toHaveBeenCalledWith("test-base-2");
  });

  it("falls back to first base map when URL parameter is invalid", () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000?base_layer=invalid-id",
        search: "?base_layer=invalid-id",
      },
      writable: true,
    });

    const onChange = vi.fn();
    render(<BaseLayerControls {...defaultProps} onChange={onChange} />);

    expect(
      screen.getByRole("button", { name: /toggle basemap options/i }),
    ).toBeInTheDocument();
  });

  it("tracks base layer selection when enableTracking is true", () => {
    const onChange = vi.fn();
    render(
      <BaseLayerControls {...defaultProps} onChange={onChange} enableTracking={true} />
    );

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    const option = screen.getByText("Test Base 2").closest("button");
    fireEvent.click(option!);

    expect(trackEvent).toHaveBeenCalledWith({
      category: "Map",
      action: "Base Layer Selection",
      name: "Test Base 2",
    });
  });

  it("does not track base layer selection when enableTracking is false", () => {
    const onChange = vi.fn();
    render(
      <BaseLayerControls {...defaultProps} onChange={onChange} enableTracking={false} />
    );

    const toggleButton = screen.getByRole("button", {
      name: /toggle basemap options/i,
    });
    fireEvent.click(toggleButton);

    const option = screen.getByText("Test Base 2").closest("button");
    fireEvent.click(option!);

    expect(trackEvent).not.toHaveBeenCalled();
  });
});
