import * as ExifReader from "exifreader";
import { parseCaptureDate } from "./stamp";
import { parseCoordinates } from "./location";

export async function readCaptureDate(file: File): Promise<string | null> {
  return (await readPhotoMetadata(file)).captureDate;
}

export async function readPhotoMetadata(file: File) {
  const tags = await ExifReader.load(file, {
    expanded: true,
    excludeTags: {
      exif: ["MakerNote", 0x9286],
    },
  });

  console.log("EXIF Metadata:", tags);

  const rawDate =
    tags.exif?.GPSDateStamp?.description ?? tags.xmp?.GPSDateStamp?.description ??
    null;

  console.log("Raw capture date:", rawDate);

  return {
    captureDate: parseCaptureDate(rawDate),
    coordinates: parseCoordinates(tags.gps?.Latitude, tags.gps?.Longitude),
  };
}
