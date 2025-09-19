import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { useStyledLayer } from "./useStyledLayer";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { applyStyle } from "ol-mapbox-style";
import { useGetMapStyles } from "./useGetMapStyles";

vi.mock("ol/layer/VectorTile", () => ({
  default: vi.fn(),
}));

vi.mock("ol/source/VectorTile", () => ({
  default: vi.fn(),
}));

vi.mock("ol/format/MVT", () => ({
  default: vi.fn(),
}));

vi.mock("ol-mapbox-style", () => ({
  applyStyle: vi.fn(),
}));

vi.mock("./useGetMapStyles", () => ({
  useGetMapStyles: vi.fn(),
}));

describe("useStyledLayer", () => {
  let mockVectorTileLayer: any;
  let mockVectorTileSource: any;
  let mockMVT: any;
  let mockApplyStyle: Mock;
  let mockUseGetMapStyles: Mock;

  const mockMapUrl = "https://example.com/tiles/{z}/{x}/{y}.pbf";
  const mockStyleUrl = "https://example.com/style.json";
  const mockStyleType = "esri";

  const mockStyleData = {
    version: 8,
    sprite: "https://example.com/sprites/sprite",
    sources: {
      test: {
        type: "vector",
        tiles: [mockMapUrl],
      },
    },
    layers: [
      {
        id: "test-layer",
        type: "fill",
        source: "test",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockVectorTileLayer = {
      setVisible: vi.fn(),
      getSource: vi.fn(),
      changed: vi.fn(),
    };
    (VectorTileLayer as unknown as Mock).mockImplementation(
      () => mockVectorTileLayer,
    );

    mockVectorTileSource = {
      setTileLoadFunction: vi.fn(),
    };
    (VectorTileSource as unknown as Mock).mockImplementation(
      () => mockVectorTileSource,
    );

    mockMVT = {};
    (MVT as unknown as Mock).mockImplementation(() => mockMVT);

    mockApplyStyle = vi.mocked(applyStyle);

    mockUseGetMapStyles = vi.mocked(useGetMapStyles);
    mockUseGetMapStyles.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
  });

  describe("layer creation", () => {
    it("should create a VectorTileLayer with correct configuration", () => {
      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(VectorTileLayer).toHaveBeenCalledWith({
        declutter: true,
        renderMode: "hybrid",
        renderBuffer: 100,
        updateWhileAnimating: true,
        preload: 2,
        updateWhileInteracting: true,
        source: mockVectorTileSource,
        visible: false,
      });
    });

    it("should create a VectorTileSource with correct configuration", () => {
      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(VectorTileSource).toHaveBeenCalledWith({
        format: mockMVT,
        url: mockMapUrl,
        wrapX: true,
        cacheSize: 1024,
      });
    });

    it("should return the created layer", () => {
      const { result } = renderHook(() =>
        useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType),
      );

      expect(result.current).toBe(mockVectorTileLayer);
    });
  });

  describe("style fetching and application", () => {
    it("should call useGetMapStyles with the provided styleUrl", () => {
      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(mockUseGetMapStyles).toHaveBeenCalledWith(mockStyleUrl);
    });

    it("should call useGetMapStyles with the provided styleUrl", () => {
      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl));

      expect(mockUseGetMapStyles).toHaveBeenCalledWith(mockStyleUrl);
    });

    it("should apply style with correct parameters when style data is loaded", () => {
      mockUseGetMapStyles.mockReturnValue({
        data: mockStyleData,
        isLoading: false,
        error: null,
      });

      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(mockApplyStyle).toHaveBeenCalledWith(
        mockVectorTileLayer,
        mockStyleData,
        mockStyleType,
        { styleUrl: mockStyleUrl },
      );
    });

    it("should pass styleUrl option to applyStyle to fix sprite URL resolution", () => {
      mockUseGetMapStyles.mockReturnValue({
        data: mockStyleData,
        isLoading: false,
        error: null,
      });

      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(mockApplyStyle).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        mockStyleType,
        expect.objectContaining({
          styleUrl: mockStyleUrl,
        }),
      );
    });

    it("should make layer visible after styles are applied", () => {
      mockUseGetMapStyles.mockReturnValue({
        data: mockStyleData,
        isLoading: false,
        error: null,
      });

      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(mockApplyStyle).toHaveBeenCalled();
      expect(mockVectorTileLayer.setVisible).toHaveBeenCalledWith(true);
    });

    it("should not apply style when no style data is available", () => {
      mockUseGetMapStyles.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType));

      expect(mockApplyStyle).not.toHaveBeenCalled();
      expect(mockVectorTileLayer.setVisible).not.toHaveBeenCalled();
    });
  });

  describe("style type parameter", () => {
    it('should default to "esri" when no styleType is provided', () => {
      mockUseGetMapStyles.mockReturnValue({
        data: mockStyleData,
        isLoading: false,
        error: null,
      });

      renderHook(() => useStyledLayer(mockMapUrl, mockStyleUrl));

      expect(mockApplyStyle).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        "esri",
        expect.any(Object),
      );
    });

    it("should use provided styleType", () => {
      mockUseGetMapStyles.mockReturnValue({
        data: mockStyleData,
        isLoading: false,
        error: null,
      });

      const customStyleType = "mapbox";
      renderHook(() =>
        useStyledLayer(mockMapUrl, mockStyleUrl, customStyleType),
      );

      expect(mockApplyStyle).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        customStyleType,
        expect.any(Object),
      );
    });
  });

  describe("hook dependencies", () => {
    it("should re-create layer when mapUrl changes", () => {
      const { rerender } = renderHook(
        ({ mapUrl }) => useStyledLayer(mapUrl, mockStyleUrl, mockStyleType),
        { initialProps: { mapUrl: mockMapUrl } },
      );

      expect(VectorTileLayer).toHaveBeenCalledTimes(1);

      const newMapUrl = "https://example.com/new-tiles/{z}/{x}/{y}.pbf";
      rerender({ mapUrl: newMapUrl });

      expect(VectorTileLayer).toHaveBeenCalledTimes(2);
    });

    it("should apply style when style data changes", () => {
      const { rerender } = renderHook(() =>
        useStyledLayer(mockMapUrl, mockStyleUrl, mockStyleType),
      );

      // Initially no style data
      expect(mockApplyStyle).not.toHaveBeenCalled();

      // Style data becomes available
      mockUseGetMapStyles.mockReturnValue({
        data: mockStyleData,
        isLoading: false,
        error: null,
      });

      rerender();

      expect(mockApplyStyle).toHaveBeenCalledWith(
        mockVectorTileLayer,
        mockStyleData,
        mockStyleType,
        { styleUrl: mockStyleUrl },
      );
    });
  });
});
