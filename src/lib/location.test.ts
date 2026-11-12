import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCoordinates, formatCoordinates, parsePlace, formatPlace } from "./location";
import { defaultSettings, drawStamp } from "./stamp";

test("GPS coordinates preserve hemispheres and accept zero", () => {
  assert.deepEqual(parseCoordinates(0, 0), { latitude: 0, longitude: 0 });
  assert.equal(formatCoordinates({ latitude: -33.8688, longitude: 151.2093 }), "33.86880° S, 151.20930° E");
  assert.equal(formatCoordinates({ latitude: 37.7749, longitude: -122.4194 }), "37.77490° N, 122.41940° W");
  for (const [lat, lon] of [[undefined, 1], [1, undefined], [NaN, 1], [1, Infinity], [91, 0], [0, -181], ["12", 34]]) {
    assert.equal(parseCoordinates(lat, lon), null);
  }
});

test("preview and export draw coordinates only when enabled and present", async () => {
  const coordinates = { latitude: -33.8688, longitude: 151.2093 };
  for (const maxDimension of [undefined, 1600]) {
    for (const location of ["none", "coordinates"] as const) {
      for (const gps of [null, coordinates]) {
        const drawn: { text: string; x: number; y: number }[] = [];
        const ctx = {
          drawImage() {},
          measureText(text: string) { return { width: text.length * 20 }; },
          fillText(text: string, x: number, y: number) { drawn.push({ text, x, y }); },
        };
        const canvas = { width: 0, height: 0, getContext: () => ctx } as unknown as HTMLCanvasElement;
        await drawStamp(canvas, {} as CanvasImageSource, 3000, 2000, "2026-11-11", { ...defaultSettings, location }, maxDimension, gps);
        assert.equal(drawn[0].text, "11/11/2026");
        assert.equal(drawn.length, location === "coordinates" && gps ? 2 : 1);
        if (drawn.length === 2) {
          assert.equal(drawn[1].text, formatCoordinates(coordinates));
          assert.ok(drawn[1].y > drawn[0].y);
          assert.ok(drawn[0].x >= 0 && drawn[1].x >= 0);
          assert.ok(drawn[1].y < canvas.height);
        }
      }
    }
  }
});

test("place formats select city, state, and country without empty separators", () => {
  const place = parsePlace([{ address_components: [
    { types: ["locality"], long_name: "Los Angeles" },
    { types: ["administrative_area_level_1"], long_name: "California", short_name: "CA" },
    { types: ["country"], long_name: "United States", short_name: "US" },
  ] }]);
  assert.equal(formatPlace(place, "city"), "Los Angeles");
  assert.equal(formatPlace(place, "city-state"), "Los Angeles, CA");
  assert.equal(formatPlace(place, "city-state-country"), "Los Angeles, CA, US");
  assert.equal(formatPlace({ ...place, state: "" }, "city-state-country"), "Los Angeles, US");
  assert.equal(parsePlace([{ address_components: [{ types: ["country"], long_name: "Canada" }] }]).country, "Canada");
  assert.equal(formatPlace(parsePlace([]), "city"), "");
  assert.equal(parsePlace([{ address_components: [{ types: ["postal_town"], long_name: "Reading" }] }]).city, "Reading");
});
