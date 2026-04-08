import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateRoute } from "@/lib/ors";
import { AppException } from "@/lib/errors";
import { GeocodedPlace } from "@/lib/geocoding";

const originalFetch = globalThis.fetch;

const sampleCoords: GeocodedPlace[] = [
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
];

describe("calculateRoute", () => {
  beforeEach(() => {
    vi.stubEnv("ORS_API_KEY", "test-ors-key");
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("throws MISSING_API_KEY when ORS_API_KEY is not set", async () => {
    vi.stubEnv("ORS_API_KEY", "");

    await expect(calculateRoute(sampleCoords)).rejects.toMatchObject({
      code: "MISSING_API_KEY",
      statusCode: 500,
    });
  });

  it("returns route data for valid coordinates", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          routes: [
            {
              summary: { distance: 432000, duration: 18000 },
              geometry: "encoded-polyline",
            },
          ],
        }),
    });

    const result = await calculateRoute(sampleCoords);

    expect(result).toEqual({
      distance: 432000,
      duration: 18000,
      geometry: "encoded-polyline",
    });
  });

  it("sends [lon, lat] coordinates to ORS", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          routes: [
            {
              summary: { distance: 1000, duration: 60 },
              geometry: "test",
            },
          ],
        }),
    });

    await calculateRoute(sampleCoords);

    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toContain("openrouteservice.org");
    expect(options.headers["Authorization"]).toBe("test-ors-key");

    const body = JSON.parse(options.body);
    // ORS expects [lon, lat], not [lat, lon]
    expect(body.coordinates[0]).toEqual([-46.6333, -23.5505]);
    expect(body.coordinates[1]).toEqual([-43.1729, -22.9068]);
  });

  it("throws ORS_ERROR when API returns non-200", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: () => Promise.resolve("Service Unavailable"),
    });

    await expect(calculateRoute(sampleCoords)).rejects.toMatchObject({
      code: "ORS_ERROR",
      statusCode: 502,
    });
  });

  it("throws ORS_ERROR when fetch throws", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("DNS failure"));

    await expect(calculateRoute(sampleCoords)).rejects.toMatchObject({
      code: "ORS_ERROR",
      statusCode: 502,
    });
  });

  it("throws ORS_ERROR when no routes returned", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ routes: [] }),
    });

    await expect(calculateRoute(sampleCoords)).rejects.toMatchObject({
      code: "ORS_ERROR",
      statusCode: 502,
      message: "ORS returned no routes for the given coordinates",
    });
  });
});
