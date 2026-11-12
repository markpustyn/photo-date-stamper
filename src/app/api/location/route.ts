import { parseCoordinates, parsePlace } from "../../../lib/location";

export const runtime = "nodejs";

function reply(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return reply({ error: "Send valid coordinates as JSON." }, 400);
  }
  const coordinates = parseCoordinates(body?.latitude, body?.longitude);
  if (!coordinates) return reply({ error: "Latitude or longitude is missing or invalid." }, 400);

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return reply({ error: "Location lookup is not configured on the server." }, 503);

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${coordinates.latitude},${coordinates.longitude}`);
  url.searchParams.set("language", "en");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return reply({ error: "Location service is unavailable. Try again later." }, 502);
    const data = await response.json();
    if (data.status === "ZERO_RESULTS") return reply({ error: "No place name found. Use coordinates instead." }, 404);
    if (data.status !== "OK") {
      return reply({ error: "Google could not complete the lookup. Check the server’s API key, billing, and Geocoding API access." }, 502);
    }
    return reply(parsePlace(data.results ?? []));
  } catch {
    // Never return provider errors or request URLs: they may contain the key.
    return reply({ error: "Location lookup failed or timed out. Please try again." }, 502);
  }
}
