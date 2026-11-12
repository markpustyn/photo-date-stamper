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

export async function getCity({ latitude, longitude }: Coordinates, format: PlaceFormat = "city"): Promise<string> {
  const key = `${latitude},${longitude}`;
  let request = placeCache.get(key);
  if (!request) {
    request = fetch("/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude }),
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Location lookup failed. Please try again.");
      return data as Place;
    });
    placeCache.set(key, request);
    request.catch(() => placeCache.delete(key));
  }
  const text = formatPlace(await request, format);
  if (!text) throw new Error("No place name found for these coordinates. Choose coordinates or no location instead.");
  return text;
}
