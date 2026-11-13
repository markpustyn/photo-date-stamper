import { test } from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { createPhotoArchive } from "./photo-archive";
import type { LoadedPhoto } from "./images";
import { defaultSettings } from "./stamp";

function fakePhoto(file: File, date: string | null, index = 0): LoadedPhoto {
  return { image: {} as HTMLImageElement, url: `blob:${index}`, name: file.name,
    width: 100, height: 100, captureDate: date, metadataWarning: !date,
    coordinates: { latitude: index, longitude: 0 } };
}

test("ZIP preserves duplicate photos, individual dates, location and settings, and releases images", async () => {
  const files = [new File(["one"], "photo.jpg"), new File(["two"], "photo.jpg")];
  const settings = { ...defaultSettings, location: "coordinates" as const };
  const released: string[] = [];
  const progress: number[] = [];
  let loaded = 0;
  const blob = await createPhotoArchive(files, settings, null, (completed) => progress.push(completed), {
    loadPhoto: async (file) => {
      assert.equal(released.length, loaded);
      const index = loaded++;
      return fakePhoto(file, `2026-11-${12 + index}`, index);
    },
    exportPhoto: async (photo, timestamp, selectedSettings) => {
      assert.equal(selectedSettings, settings);
      return new Blob([`${timestamp}:${photo.coordinates?.latitude}`]);
    },
    release: (url) => { released.push(url); },
  });
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  assert.deepEqual(Object.keys(zip.files), ["photo-datestampIO.png", "photo-datestampIO-2.png"]);
  assert.equal(await zip.file("photo-datestampIO.png")!.async("string"), "2026-11-12:0");
  assert.equal(await zip.file("photo-datestampIO-2.png")!.async("string"), "2026-11-13:1");
  assert.deepEqual(released, ["blob:0", "blob:1"]);
  assert.deepEqual(progress, [0, 1, 2]);
});

test("ZIP applies a custom date and cleans up after export failures", async () => {
  const file = new File(["image"], "photo.jpg");
  let released = 0;
  const operations = {
    loadPhoto: async () => fakePhoto(file, null),
    exportPhoto: async (_photo: LoadedPhoto, timestamp: string) => {
      assert.equal(timestamp, "2026-01-02");
      return new Blob(["image"]);
    },
    release: () => { released++; },
  };
  await createPhotoArchive([file], defaultSettings, "2026-01-02", () => {}, operations);
  assert.equal(released, 1);
  await assert.rejects(createPhotoArchive([file], defaultSettings, null, () => {}, operations), /photo.jpg: No capture date/);
  assert.equal(released, 2);
  await assert.rejects(createPhotoArchive([file], defaultSettings, "2026-01-02", () => {}, {
    ...operations, exportPhoto: async () => { throw new Error("Rendering failed"); },
  }), /photo.jpg: Rendering failed/);
  assert.equal(released, 3);
});
