export type Coordinates = { latitude: number; longitude: number };



export function parseCoordinates(latitude: unknown, longitude: unknown): Coordinates | null {
  if (typeof latitude !== "number" || typeof longitude !== "number" ||
      !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

export function formatCoordinates({ latitude, longitude }: Coordinates): string {
  return `${Math.abs(latitude).toFixed(5)}° ${latitude < 0 ? "S" : "N"}, ${Math.abs(longitude).toFixed(5)}° ${longitude < 0 ? "W" : "E"}`;
}

export type PlaceFormat = "city" | "city-state" | "city-state-country";
export type Place = { city: string; state: string; country: string };
type AddressComponent = { types: string[]; long_name: string; short_name?: string };

export function parsePlace(results: { address_components?: AddressComponent[] }[]): Place {
  const components = results.flatMap((result) => result.address_components ?? []);
  const name = (type: string, abbreviated = false) => {
    const part = components.find((part) => part.types.includes(type));
    return (abbreviated ? part?.short_name?.trim() : "") || part?.long_name.trim() || "";
  };
  return {
    city: name("locality") || name("postal_town") || name("sublocality"),
    state: name("administrative_area_level_1", true),
    country: name("country", true),
  };
}

export function formatPlace(place: Place, format: PlaceFormat): string {
  const parts = [place.city];
  if (format !== "city") parts.push(place.state);
  if (format === "city-state-country") parts.push(place.country);
  return parts.filter(Boolean).join(", ");
}

const placeCache = new Map<string, Promise<Place>>();
let apiKeyRequest: Promise<string> | undefined;

function fetchApiKey(): Promise<string> {
  if (!apiKeyRequest) {
    apiKeyRequest = fetch("/api/secure", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok || typeof data.apiKey !== "string" || !data.apiKey.trim()) {
        throw new Error(data.error || "The location API key is not configured.");
      }
      return data.apiKey.trim();
    });
    apiKeyRequest.catch(() => { apiKeyRequest = undefined; });
  }
  return apiKeyRequest;
}

async function fetchPlace({ latitude, longitude }: Coordinates): Promise<Place> {
  const apiKey = await fetchApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${latitude},${longitude}`);
  url.searchParams.set("language", "en");
  url.searchParams.set("key", apiKey);
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new Error("Location lookup failed or timed out. Please try again.");
  }
  if (!response.ok) throw new Error("Location service is unavailable. Please try again.");
  const data = await response.json();
  if (data.status === "ZERO_RESULTS") throw new Error("No place name found. Use coordinates instead.");
  if (data.status !== "OK") throw new Error("Google rejected the lookup. Check the key's restrictions, billing, and Geocoding API access.");
  return parsePlace(data.results ?? []);
}

export async function getCity(coordinates: Coordinates, format: PlaceFormat = "city"): Promise<string> {
  const key = `${coordinates.latitude},${coordinates.longitude}`;
  let request = placeCache.get(key);
  if (!request) {
    request = fetchPlace(coordinates);
    placeCache.set(key, request);
    request.catch(() => placeCache.delete(key));
  }
  const text = formatPlace(await request, format);
  if (!text) throw new Error("No place name found. Choose coordinates or no location instead.");
  return text;
}

