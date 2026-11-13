import { test } from "node:test";
import assert from "node:assert/strict";
import { getCity } from "./location";

test("location lookup loads the secure key first, retries failures, and reuses results", async (t) => {
  let keyRequests = 0;
  let googleRequests = 0;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    if (String(input) === "/api/secure") {
      keyRequests++;
      if (keyRequests === 1) return Response.json({ error: "Key unavailable" }, { status: 503 });
      return Response.json({ apiKey: "test-key" });
    }
    googleRequests++;
    const url = new URL(String(input));
    assert.equal(url.hostname, "maps.googleapis.com");
    assert.equal(url.searchParams.get("key"), "test-key");
    return Response.json({ status: "OK", results: [{ address_components: [
      { types: ["locality"], long_name: "Los Angeles" },
      { types: ["administrative_area_level_1"], long_name: "California", short_name: "CA" },
      { types: ["country"], long_name: "United States", short_name: "US" },
    ] }] });
  });
  const gps = { latitude: 34, longitude: -118 };
  await assert.rejects(getCity(gps), /Key unavailable/);
  assert.equal(googleRequests, 0);
  assert.equal(await getCity(gps, "city-state"), "Los Angeles, CA");
  assert.equal(await getCity(gps, "city-state-country"), "Los Angeles, CA, US");
  assert.equal(keyRequests, 2);
  assert.equal(googleRequests, 1);
});
