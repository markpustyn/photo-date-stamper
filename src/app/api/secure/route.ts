import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "Set GOOGLE_MAPS_API_KEY on the server and restart it." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ apiKey }, { headers: { "Cache-Control": "no-store" } });
}
