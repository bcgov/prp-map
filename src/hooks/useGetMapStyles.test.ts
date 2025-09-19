import { renderHook, waitFor } from "@testing-library/react";
import { useGetMapStyles } from "./useGetMapStyles";
import { MAP_URLS } from "@/constants";

describe("useGetMapStyles", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns loading state initially", async () => {
    // eslint-disable-next-line promise/avoid-new
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})) as any);

    const { result } = renderHook(() => useGetMapStyles(MAP_URLS.styles));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("returns data after successful fetch", async () => {
    const mockData = { foo: "bar" };
    vi.stubGlobal(
      "fetch",
      vi.fn((url) => {
        expect(url).toBe(MAP_URLS.styles);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        });
      }) as any,
    );

    const { result } = renderHook(() => useGetMapStyles(MAP_URLS.styles));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it("returns error on fetch failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 500 })) as any,
    );

    const { result } = renderHook(() => useGetMapStyles(MAP_URLS.styles));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("500");
  });
});
