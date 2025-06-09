import { renderHook } from "@testing-library/react";
import { useMapBaseLayers } from "./useMapBaseLayers";
import * as getMapStylesHook from "@/hooks/useGetMapStyles";
import { applyStyle } from "ol-mapbox-style";

vi.mock("ol-mapbox-style", () => ({
  applyStyle: vi.fn(),
}));

describe("useMapBaseLayers", () => {
  const mockGLStyle = { style: "mock-style" };

  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(getMapStylesHook, "useGetMapStyles").mockReturnValue({
      data: mockGLStyle,
      isLoading: false,
      error: null,
    });
  });

  it("returns an array of VectorTileLayer", () => {
    const { result } = renderHook(() => useMapBaseLayers());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current[0]?.constructor?.name).toBe("VectorTileLayer");
  });

  it("applies style when glStyles is available", () => {
    renderHook(() => useMapBaseLayers());
    expect(applyStyle).toHaveBeenCalledTimes(1);
    expect(applyStyle).toHaveBeenCalledWith(
      expect.any(Object),
      mockGLStyle,
      "esri",
    );
  });

  it("does not apply style if glStyles is null", () => {
    vi.spyOn(getMapStylesHook, "useGetMapStyles").mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    renderHook(() => useMapBaseLayers());
    expect(applyStyle).not.toHaveBeenCalled();
  });
});
