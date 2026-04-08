import { AppException } from "@/lib/errors";
import { GeocodedPlace } from "@/lib/geocoding";

export interface OrsRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: unknown;
}

export async function calculateRoute(
  coordinates: GeocodedPlace[]
): Promise<OrsRoute> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    throw new AppException(
      "MISSING_API_KEY",
      500,
      "ORS API key is not configured. Set ORS_API_KEY in environment variables."
    );
  }

  // ORS expects [lon, lat] pairs
  const coords = coordinates.map((c) => [c.lon, c.lat]);

  let res: Response;
  try {
    res = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({ coordinates: coords }),
      }
    );
  } catch (error) {
    throw new AppException(
      "ORS_ERROR",
      502,
      `ORS API call failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "unknown");
    throw new AppException(
      "ORS_ERROR",
      502,
      `ORS API returned ${res.status}: ${errorBody}`
    );
  }

  const data = await res.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new AppException(
      "ORS_ERROR",
      502,
      "ORS returned no routes for the given coordinates"
    );
  }

  return {
    distance: route.summary.distance,
    duration: route.summary.duration,
    geometry: route.geometry,
  };
}
