import { AppException } from "@/lib/errors";

export interface GeocodedPlace {
  name: string;
  lat: number;
  lon: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function geocodeCity(cityName: string): Promise<GeocodedPlace | null> {
  const params = new URLSearchParams({
    q: cityName,
    format: "json",
    limit: "1",
    countrycodes: "br",
  });

  const url = `https://nominatim.openstreetmap.org/search?${params}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "BorarodarApp/1.0 (https://borarodar.app)",
    },
  });

  if (!res.ok) {
    return null;
  }

  const results: NominatimResult[] = await res.json();

  if (results.length === 0) {
    return null;
  }

  return {
    name: cityName,
    lat: parseFloat(results[0].lat),
    lon: parseFloat(results[0].lon),
  };
}

export async function geocodeCities(
  cityNames: string[]
): Promise<{ resolved: GeocodedPlace[]; failed: string[] }> {
  const results = await Promise.all(
    cityNames.map(async (name) => {
      try {
        const place = await geocodeCity(name);
        return { name, place };
      } catch {
        return { name, place: null };
      }
    })
  );

  const resolved: GeocodedPlace[] = [];
  const failed: string[] = [];

  for (const r of results) {
    if (r.place) {
      resolved.push(r.place);
    } else {
      failed.push(r.name);
    }
  }

  return { resolved, failed };
}

export function validateGeocodedRoute(
  origin: GeocodedPlace | null,
  destination: GeocodedPlace | null,
  originName: string,
  destinationName: string,
  waypointFailures: string[]
): void {
  const requiredFailures: string[] = [];

  if (!origin) requiredFailures.push(originName);
  if (!destination) requiredFailures.push(destinationName);

  if (requiredFailures.length > 0) {
    throw new AppException(
      "GEOCODE_FAILED",
      422,
      "Could not geocode required cities",
      { unresolvedCities: [...requiredFailures, ...waypointFailures] }
    );
  }
}
