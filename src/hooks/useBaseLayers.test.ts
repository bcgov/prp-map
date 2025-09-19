import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useBaseLayers } from "./useBaseLayers";
import { BaseLayerOption } from "@/types";

// Mock the useStyledLayer hook
vi.mock("./useStyledLayer", () => ({
  useStyledLayer: vi.fn(),
}));

// Mock the MAP_URLS constant
vi.mock("@/constants", () => ({
  MAP_URLS: {
    baseLayer: "https://example.com/base-layer/{z}/{x}/{y}.pbf",
    styles: "https://example.com/styles.json",
  },
}));

describe("useBaseLayers", () => {
  let mockDefaultBaseLayer: any;
  let mockUseStyledLayer: any;
  const mockCustomBaseLayers: BaseLayerOption[] = [
    {
      id: "custom-1",
      name: "Custom Base 1",
      layer: { id: "custom-layer-1" } as any,
      image: "/custom-1.jpg",
    },
    {
      id: "custom-2",
      name: "Custom Base 2",
      layer: { id: "custom-layer-2" } as any,
      image: "/custom-2.jpg",
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDefaultBaseLayer = {
      id: "default-base-layer",
      setVisible: vi.fn(),
      changed: vi.fn(),
    };

    const { useStyledLayer } = await import("./useStyledLayer");
    mockUseStyledLayer = vi.mocked(useStyledLayer);
    mockUseStyledLayer.mockReturnValue(mockDefaultBaseLayer);
  });

  describe("with custom base layers", () => {
    it("should return custom base layers when provided", () => {
      const { result } = renderHook(() => useBaseLayers(mockCustomBaseLayers));

      expect(result.current).toEqual([
        { id: "custom-layer-1" },
        { id: "custom-layer-2" },
      ]);
    });

    it("should still call useStyledLayer to create default base layer even when custom base layers are provided", () => {
      renderHook(() => useBaseLayers(mockCustomBaseLayers));

      expect(mockUseStyledLayer).toHaveBeenCalledWith(
        "https://example.com/base-layer/{z}/{x}/{y}.pbf",
        "https://example.com/styles.json",
      );
    });

    it("should return single custom layer when only one provided", () => {
      const singleLayer = [mockCustomBaseLayers[0]];
      const { result } = renderHook(() => useBaseLayers(singleLayer));

      expect(result.current).toEqual([{ id: "custom-layer-1" }]);
    });

    it("should return default base layer when empty array provided", () => {
      const { result } = renderHook(() => useBaseLayers([]));

      expect(result.current).toEqual([mockDefaultBaseLayer]);
    });
  });

  describe("without custom base layers", () => {
    it("should return default base layer when no custom layers provided", () => {
      const { result } = renderHook(() => useBaseLayers());

      expect(result.current).toEqual([mockDefaultBaseLayer]);
    });

    it("should return default base layer when undefined provided", () => {
      const { result } = renderHook(() => useBaseLayers(undefined));

      expect(result.current).toEqual([mockDefaultBaseLayer]);
    });

    it("should call useStyledLayer with correct parameters", () => {
      renderHook(() => useBaseLayers());

      expect(mockUseStyledLayer).toHaveBeenCalledWith(
        "https://example.com/base-layer/{z}/{x}/{y}.pbf",
        "https://example.com/styles.json",
      );
    });
  });

  describe("memoization", () => {
    it("should memoize result when custom layers do not change", () => {
      const { result, rerender } = renderHook(
        ({ baseLayers }) => useBaseLayers(baseLayers),
        { initialProps: { baseLayers: mockCustomBaseLayers } },
      );

      const firstResult = result.current;

      rerender({ baseLayers: mockCustomBaseLayers });

      expect(result.current).toBe(firstResult);
    });

    it("should update result when custom layers change", () => {
      const { result, rerender } = renderHook(
        ({ baseLayers }) => useBaseLayers(baseLayers),
        { initialProps: { baseLayers: [mockCustomBaseLayers[0]] } },
      );

      const firstResult = result.current;

      rerender({ baseLayers: mockCustomBaseLayers });

      expect(result.current).not.toBe(firstResult);
      expect(result.current).toHaveLength(2);
    });
  });

  describe("edge cases", () => {
    it("should handle null custom base layers", () => {
      const { result } = renderHook(() => useBaseLayers(null as any));

      expect(result.current).toEqual([mockDefaultBaseLayer]);
    });

    it("should handle custom base layers with undefined layer property", () => {
      const invalidBaseLayers = [
        {
          id: "invalid-1",
          name: "Invalid Base 1",
          layer: undefined,
        },
      ] as any;

      const { result } = renderHook(() => useBaseLayers(invalidBaseLayers));

      expect(result.current).toEqual([undefined]);
    });

    it("should handle custom base layers with empty array", () => {
      const { result } = renderHook(() => useBaseLayers([]));

      expect(result.current).toEqual([mockDefaultBaseLayer]);
    });
  });

  describe("return value structure", () => {
    it("should return an array", () => {
      const { result } = renderHook(() => useBaseLayers());

      expect(Array.isArray(result.current)).toBe(true);
    });

    it("should return array with default base layer when no custom layers", () => {
      const { result } = renderHook(() => useBaseLayers());

      expect(result.current).toEqual([mockDefaultBaseLayer]);
    });

    it("should return array with custom layers when provided", () => {
      const { result } = renderHook(() => useBaseLayers(mockCustomBaseLayers));

      expect(result.current).toEqual([
        { id: "custom-layer-1" },
        { id: "custom-layer-2" },
      ]);
    });
  });
});
