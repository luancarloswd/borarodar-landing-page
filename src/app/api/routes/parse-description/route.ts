import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AppException } from "@/lib/errors";
import { parseRouteDescription } from "@/lib/ai";
import {
  geocodeCity,
  geocodeCities,
  validateGeocodedRoute,
  GeocodedPlace,
} from "@/lib/geocoding";
import { calculateRoute } from "@/lib/ors";

const parseDescriptionSchema = z.object({
  description: z.string().min(1, "Description is required"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Input validation
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const parsed = parseDescriptionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          code: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { description } = parsed.data;

    // 2. Parse the natural language description with LLM
    const routeData = await parseRouteDescription(description);

    // 3. Geocode all cities
    const allWaypointNames = routeData.waypoints;
    const [originResult, destinationResult, waypointsResult] =
      await Promise.all([
        geocodeCity(routeData.origin),
        geocodeCity(routeData.destination),
        geocodeCities(allWaypointNames),
      ]);

    // 4. Validate that required cities were geocoded
    validateGeocodedRoute(
      originResult,
      destinationResult,
      routeData.origin,
      routeData.destination,
      waypointsResult.failed
    );

    // 5. Build coordinate list for ORS
    const coordinates: GeocodedPlace[] = [
      originResult!,
      ...waypointsResult.resolved,
      destinationResult!,
    ];

    if (routeData.returnToOrigin) {
      coordinates.push(originResult!);
    }

    // 6. Calculate route via ORS
    const orsRoute = await calculateRoute(coordinates);

    // 7. Return the complete result
    return NextResponse.json({
      parsed: routeData,
      geocoded: {
        origin: originResult,
        destination: destinationResult,
        waypoints: waypointsResult.resolved,
        failedWaypoints: waypointsResult.failed,
      },
      route: {
        distance: orsRoute.distance,
        duration: orsRoute.duration,
        geometry: orsRoute.geometry,
      },
    });
  } catch (error) {
    if (error instanceof AppException) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          ...(error.details ? { details: error.details } : {}),
        },
        { status: error.statusCode }
      );
    }

    console.error("parse-description error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
