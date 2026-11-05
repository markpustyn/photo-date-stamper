import exifParser from "exif-parser";
import { parseCaptureDate } from "./stamp";

export async function readCaptureDate(file: File): Promise<string | null> {
  let tags;
  if (file.type === "image/jpeg") {
    const bytes = await file.arrayBuffer();
    tags = exifParser
      .create(bytes, globalThis)
      .enableImageSize(false)
      .enableSimpleValues(false)
      .parse().tags;
  } else {
    // exif-parser expects JPEG segments. PNG and WebP use different containers.
    const { default: exifr } = await import("exifr");
    tags = await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate"],
      reviveValues: false,
    });
  }
  return (
    parseCaptureDate(tags?.DateTimeOriginal) ??
    parseCaptureDate(tags?.CreateDate)
  );
}
