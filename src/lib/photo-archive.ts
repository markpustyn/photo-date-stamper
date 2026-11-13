import { exportPhoto, loadPhoto } from "./images";
import { validDate, type StampSettings } from "./stamp";

const defaultOperations = {
  loadPhoto,
  exportPhoto,
  release: (url: string) => URL.revokeObjectURL(url),
};

export async function createPhotoArchive(
  files: File[],
  settings: StampSettings,
  manualTimestamp: string | null,
  onProgress: (completed: number, total: number) => void,
  operations = defaultOperations,
): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const names = new Set<string>();
  onProgress(0, files.length);

  // Process one decoded image at a time to avoid retaining every full-size canvas.
  for (const [index, file] of files.entries()) {
    let photo;
    try {
      photo = await operations.loadPhoto(file);
      const timestamp = manualTimestamp ?? photo.captureDate;
      if (!timestamp || !validDate(timestamp)) {
        throw new Error("No capture date found. Enter a custom date to apply to all photos, then try again.");
      }
      const blob = await operations.exportPhoto(photo, timestamp, settings);
      const base = file.name.replace(/\.[^.]+$/, "").replace(/[\\/\x00-\x1f]/g, "_").trim() || "photo";
      let name = `${base}-datestampIO.png`;
      let suffix = 2;
      while (names.has(name.toLowerCase())) name = `${base}-datestampIO-${suffix++}.png`;
      names.add(name.toLowerCase());
      zip.file(name, await blob.arrayBuffer());
      onProgress(index + 1, files.length);
    } catch (error) {
      throw new Error(`${file.name}: ${error instanceof Error ? error.message : "Could not export this photo."}`);
    } finally {
      if (photo) operations.release(photo.url);
    }
  }
  // PNG is already compressed; storing it avoids an expensive extra compression pass.
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}
