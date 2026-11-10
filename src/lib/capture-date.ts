import * as ExifReader from "exifreader";
import { parseCaptureDate } from "./stamp";

export async function readCaptureDate(file: File): Promise<string | null> {
  const tags = await ExifReader.load(file, {
    excludeTags: {
      exif: ["MakerNote", 0x9286],
    },
  });

  console.log("EXIF Metadata:", tags);

  const rawDate =
    tags["GPSDateStamp"]?.description ??
    null;

  console.log("Raw capture date:", rawDate);

  return parseCaptureDate(rawDate);
}