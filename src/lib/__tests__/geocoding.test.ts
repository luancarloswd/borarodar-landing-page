import { describe, it, expect, vi, afterEach } from "vitest";
import {
  geocodeCity,
  geocodeCities,
  validateGeocodedRoute,
} from "@/lib/geocoding";
import { AppException } from "@/lib/errors";

const originalFetch = globalThis.fetch;

function mockNominatimResponse(results: Array<{ lat: string; lon: string; display_name: string }>, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(results),
  });
}

describe("geocodeCity", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns geocoded place for a valid city", async () => {
    mockNominatimResponse([
      { lat: "-23.5505", lon: "-46.6333", display_name: "São Paulo, SP, Brasil" },
    ]);

    const result = await geocodeCity("São Paulo");

    expect(result).toEqual({
      name: "São Paulo",
      lat: -23.5505,
      lon: -46.6333,
    });
  });

  it("sends countrycodes=br in the query", async () => {
    mockNominatimResponse([
      { lat: "-22.9068", lon: "-43.1729", display_name: "Rio de Janeiro" },
    ]);

    await geocodeCity("Rio de Janeiro");

    const [url] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("countrycodes=br");
    expect(url).toContain("format=json");
    expect(url).toContain("limit=1");
  });

  it("returns null when no results found", async () => {
    mockNominatimResponse([]);

    const result = await geocodeCity("CidadeInexistente12345");
    expect(result).toBeNull();
  });

  it("returns null when Nominatim returns non-200", async () => {
    mockNominatimResponse([], 500);

    const result = await geocodeCity("São Paulo");
    expect(result).toBeNull();
  });

  it("includes User-Agent header", async () => {
    mockNominatimResponse([
      { lat: "-23.5505", lon: "-46.6333", display_name: "São Paulo" },
    ]);

    await geocodeCity("São Paulo");

    const [, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers["User-Agent"]).toContain("BorarodarApp");
  });
});

describe("geocodeCities", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("geocodes multiple cities and separates resolved from failed", async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { lat: "-23.55", lon: "-46.63", display_name: "São Paulo" },
            ]),
        });
      }
      // Second call fails — no results
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    const result = await geocodeCities(["São Paulo", "FakeCity"]);

    expect(result.resolved).toHaveLength(1);
    expect(result.resolved[0].name).toBe("São Paulo");
    expect(result.failed).toEqual(["FakeCity"]);
  });

  it("returns all resolved for successful geocoding", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { lat: "-22.9068", lon: "-43.1729", display_name: "test" },
        ]),
    });

    const result = await geocodeCities(["CityA", "CityB"]);

    expect(result.resolved).toHaveLength(2);
    expect(result.failed).toHaveLength(0);
  });

  it("handles empty input", async () => {
    const result = await geocodeCities([]);

    expect(result.resolved).toHaveLength(0);
    expect(result.failed).toHaveLength(0);
  });

  it("handles fetch errors gracefully", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network"));

    const result = await geocodeCities(["São Paulo"]);

    expect(result.resolved).toHaveLength(0);
    expect(result.failed).toEqual(["São Paulo"]);
  });
});

describe("validateGeocodedRoute", () => {
  const validPlace = { name: "São Paulo", lat: -23.55, lon: -46.63 };

  it("does not throw when origin and destination are geocoded", () => {
    expect(() =>
      validateGeocodedRoute(validPlace, validPlace, "SP", "SP", [])
    ).not.toThrow();
  });

  it("throws GEOCODE_FAILED when origin is null", () => {
    try {
      validateGeocodedRoute(null, validPlace, "FakeCity", "SP", []);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppException);
      expect((err as AppException).code).toBe("GEOCODE_FAILED");
      expect((err as AppException).statusCode).toBe(422);
      expect((err as AppException).details).toEqual({
        unresolvedCities: ["FakeCity"],
      });
    }
  });

  it("throws GEOCODE_FAILED when destination is null", () => {
    try {
      validateGeocodedRoute(validPlace, null, "SP", "FakeCity", []);
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as AppException).code).toBe("GEOCODE_FAILED");
      expect((err as AppException).details).toEqual({
        unresolvedCities: ["FakeCity"],
      });
    }
  });

  it("throws GEOCODE_FAILED with combined failures", () => {
    try {
      validateGeocodedRoute(null, null, "FakeA", "FakeB", ["FakeC"]);
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as AppException).details).toEqual({
        unresolvedCities: ["FakeA", "FakeB", "FakeC"],
      });
    }
  });

  it("does not throw when only waypoints fail", () => {
    expect(() =>
      validateGeocodedRoute(validPlace, validPlace, "SP", "RJ", [
        "FailedWaypoint",
      ])
    ).not.toThrow();
  });
});
