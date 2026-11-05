import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTimestamp, parseCaptureDate, validDate } from "./stamp";
test("EXIF capture date retains camera-local time", () => {
  assert.equal(parseCaptureDate("2024:07:21 17:35:08"), "2024-07-21T17:35:08");
  assert.equal(parseCaptureDate(undefined), null);
  assert.equal(parseCaptureDate("2023:02:29 12:00:00"), null);
});
test("manual dates reject invalid calendar days and time", () => {
  assert.equal(validDate("2024-02-29T12:00"), true);
  for (const value of [
    "",
    "2024-02-30T12:00",
    "2024-01-01T24:00",
    "2024-13-01T12:00",
  ])
    assert.equal(validDate(value), false);
});
test("date formats preserve capture values", () => {
  const date = "2024-07-21T17:35:08";
  assert.equal(formatTimestamp(date, "classic"), "07.21.2024");
  assert.equal(formatTimestamp(date, "iso"), "2024-07-21");
  assert.equal(formatTimestamp(date, "written"), "JUL 21, 2024");
  assert.equal(formatTimestamp(date, "datetime"), "07.21.2024  17:35");
});
