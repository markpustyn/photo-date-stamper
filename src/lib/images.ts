import { readCaptureDate } from "./capture-date";
import { drawStamp, type StampSettings } from "./stamp";
export type LoadedPhoto = {
  image: HTMLImageElement;
  url: string;
  name: string;
  width: number;
  height: number;
  captureDate: string | null;
  metadataWarning: boolean;
};
export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "Choose a JPG, PNG, or WebP image. This file type isn’t supported.",
    );
  if (file.size > 50 * 1024 * 1024)
    throw new Error(
      "This image is too large. Choose a photo smaller than 50 MB.",
    );
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth * image.naturalHeight > 40_000_000)
      throw new Error(
        "Choose an image under 40 megapixels so your browser can safely process it.",
      );
    let captureDate: string | null = null;
    let metadataWarning = false;
    try {
      captureDate = await readCaptureDate(file);
      metadataWarning = captureDate === null;
    } catch (error) {
      console.error("Failed to read metadata:", error);
      metadataWarning = true;
    }
    return {
      image,
      url,
      name: file.name,
      width: image.naturalWidth,
      height: image.naturalHeight,
      captureDate,
      metadataWarning,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.startsWith("Choose"))
      throw error;
    throw new Error(
      "We couldn’t read this image. It may be damaged. Please try another JPG, PNG, or WebP.",
    );
  }
}
export async function exportPhoto(
  photo: LoadedPhoto,
  timestamp: string,
  settings: StampSettings,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  drawStamp(
    canvas,
    photo.image,
    photo.width,
    photo.height,
    timestamp,
    settings,
  );
  // PNG preserves transparency and avoids another lossy compression pass.
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => {
      canvas.width = 0;
      canvas.height = 0;
      if (blob) resolve(blob);
      else
        reject(
          new Error("The image could not be exported. Try a smaller photo."),
        );
    }, "image/png"),
  );
}
