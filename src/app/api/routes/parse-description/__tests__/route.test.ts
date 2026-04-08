import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

// Mock all external service modules
vi.mock("@/lib/ai", () => ({
  parseRouteDescription: vi.fn(),
}));

vi.mock("@/lib/geocoding", () => ({
  geocodeCity: vi.fn(),
  geocodeCities: vi.fn(),
  validateGeocodedRoute: vi.fn(),
}));

vi.mock("@/lib/ors", () => ({
  calculateRoute: vi.fn(),
}));

import { parseRouteDescription } from "@/lib/ai";
import { geocodeCity, geocodeCities, validateGeocodedRoute } from "@/lib/geocoding";
import { calculateRoute } from "@/lib/ors";
import { AppException } from "@/lib/errors";

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/routes/parse-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createInvalidRequest(): NextRequest {
  return new NextRequest("http://localhost/api/routes/parse-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not-json{",
  });
}

describe("POST /api/routes/parse-description", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = createInvalidRequest();
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when description is missing", async () => {
    const req = createRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when description is empty string", async () => {
    const req = createRequest({ description: "" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("returns full route on success", async () => {
    const parsedRoute = {
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      waypoints: ["Paraty"],
      returnToOrigin: false,
    };

    const originGeo = { name: "São Paulo", lat: -23.55, lon: -46.63 };
    const destGeo = { name: "Rio de Janeiro", lat: -22.91, lon: -43.17 };
    const waypointGeo = { name: "Paraty", lat: -23.22, lon: -44.71 };

    vi.mocked(parseRouteDescription).mockResolvedValue(parsedRoute);
    vi.mocked(geocodeCity)
      .mockResolvedValueOnce(originGeo)
      .mockResolvedValueOnce(destGeo);
    vi.mocked(geocodeCities).mockResolvedValue({
      resolved: [waypointGeo],
      failed: [],
    });
    vi.mocked(validateGeocodedRoute).mockImplementation(() => {});
    vi.mocked(calculateRoute).mockResolvedValue({
      distance: 500000,
      duration: 21600,
      geometry: "encoded",
    });

    const req = createRequest({
      description: "De São Paulo para o Rio passando por Paraty",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.parsed).toEqual(parsedRoute);
    expect(data.geocoded.origin).toEqual(originGeo);
    expect(data.geocoded.destination).toEqual(destGeo);
    expect(data.geocoded.waypoints).toEqual([waypointGeo]);
    expect(data.geocoded.failedWaypoints).toEqual([]);
    expect(data.route.distance).toBe(500000);
    expect(data.route.duration).toBe(21600);
  });

  it("maps AppException to proper HTTP response", async () => {
    vi.mocked(parseRouteDescription).mockRejectedValue(
      new AppException("AI_PARSE_FAILED", 502, "LLM returned garbage", {
        raw: "bad",
      })
    );

    const req = createRequest({ description: "qualquer coisa" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.code).toBe("AI_PARSE_FAILED");
    expect(data.error).toBe("LLM returned garbage");
    expect(data.details).toEqual({ raw: "bad" });
  });

  it("maps GEOCODE_FAILED to 422", async () => {
    vi.mocked(parseRouteDescription).mockResolvedValue({
      origin: "FakeCity",
      destination: "Rio",
      waypoints: [],
      returnToOrigin: false,
    });
    vi.mocked(geocodeCity).mockResolvedValue(null);
    vi.mocked(geocodeCities).mockResolvedValue({
      resolved: [],
      failed: [],
    });
    vi.mocked(validateGeocodedRoute).mockImplementation(() => {
      throw new AppException("GEOCODE_FAILED", 422, "Could not geocode", {
        unresolvedCities: ["FakeCity"],
      });
    });

    const req = createRequest({ description: "De FakeCity para Rio" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.code).toBe("GEOCODE_FAILED");
  });

  it("maps ORS_ERROR to 502", async () => {
    vi.mocked(parseRouteDescription).mockResolvedValue({
      origin: "SP",
      destination: "RJ",
      waypoints: [],
      returnToOrigin: false,
    });
    vi.mocked(geocodeCity).mockResolvedValue({
      name: "test",
      lat: -23,
      lon: -46,
    });
    vi.mocked(geocodeCities).mockResolvedValue({
      resolved: [],
      failed: [],
    });
    vi.mocked(validateGeocodedRoute).mockImplementation(() => {});
    vi.mocked(calculateRoute).mockRejectedValue(
      new AppException("ORS_ERROR", 502, "ORS down")
    );

    const req = createRequest({ description: "De SP para RJ" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.code).toBe("ORS_ERROR");
  });

  it("returns 500 for unexpected errors", async () => {
    vi.mocked(parseRouteDescription).mockRejectedValue(
      new Error("unexpected boom")
    );

    const req = createRequest({ description: "something" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.code).toBe("INTERNAL_ERROR");
    // Should not leak internal error details
    expect(data.error).toBe("Internal server error");
  });

  it("includes returnToOrigin coordinate in ORS call", async () => {
    const originGeo = { name: "SP", lat: -23, lon: -46 };
    const destGeo = { name: "SP", lat: -23, lon: -46 };

    vi.mocked(parseRouteDescription).mockResolvedValue({
      origin: "SP",
      destination: "SP",
      waypoints: [],
      returnToOrigin: true,
    });
    vi.mocked(geocodeCity)
      .mockResolvedValueOnce(originGeo)
      .mockResolvedValueOnce(destGeo);
    vi.mocked(geocodeCities).mockResolvedValue({
      resolved: [],
      failed: [],
    });
    vi.mocked(validateGeocodedRoute).mockImplementation(() => {});
    vi.mocked(calculateRoute).mockResolvedValue({
      distance: 1000,
      duration: 60,
      geometry: "test",
    });

    const req = createRequest({ description: "Volta SP" });
    await POST(req);

    // calculateRoute should receive origin, destination, and origin again
    expect(vi.mocked(calculateRoute)).toHaveBeenCalledWith([
      originGeo,
      destGeo,
      originGeo,
    ]);
  });
});
