import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/location/route";

const request = (body: unknown) => new Request("http://localhost/api/location", {
  method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
});

test("location route validates coordinates before calling Google", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected request"); });
  for (const body of [null, {}, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: "1" }]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("location route keeps key and provider errors out of responses", async (t) => {
  const originalKey = process.env.GOOGLE_API_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.GOOGLE_API_KEY;
    else process.env.GOOGLE_API_KEY = originalKey;
  });
  delete process.env.GOOGLE_API_KEY;
  assert.equal((await POST(request({ latitude: 0, longitude: 0 }))).status, 503);
  process.env.GOOGLE_API_KEY = "test-private-key";
  const mock = t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get("key"), "test-private-key");
    assert.equal(url.searchParams.get("latlng"), "0,0");
    return Response.json({ status: "OK", results: [{ address_components: [
      { types: ["locality"], long_name: "Los Angeles" },
      { types: ["administrative_area_level_1"], long_name: "California", short_name: "CA" },
      { types: ["country"], long_name: "United States", short_name: "US" },
    ] }] });
  });
  const response = await POST(request({ latitude: 0, longitude: 0 }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { city: "Los Angeles", state: "CA", country: "US" });
  mock.mock.mockImplementation(async () => Response.json({ status: "REQUEST_DENIED", error_message: "test-private-key" }));
  const failure = await POST(request({ latitude: 0, longitude: 0 }));
  assert.equal(failure.status, 502);
  assert.ok(!(await failure.text()).includes("test-private-key"));
  mock.mock.mockImplementation(async () => Response.json({ status: "ZERO_RESULTS" }));
  assert.equal((await POST(request({ latitude: 0, longitude: 0 }))).status, 404);
});
