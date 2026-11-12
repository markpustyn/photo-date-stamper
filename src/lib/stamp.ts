import { formatCoordinates, getCity, type Coordinates } from "./location";

export type DateFormat = "slash" | "classic" | "iso" | "written" | "datetime";
export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type StampSettings = {
  format: DateFormat;
  size: number;
  color: string;
  position: Position;
  treatment: "shadow" | "background" | "none";
  location: "none" | "coordinates" | "city" | "city-state" | "city-state-country";
};
export const defaultSettings: StampSettings = {
  format: "slash",
  size: 4,
  color: "#ffffff",
  position: "bottom-right",
  treatment: "shadow",
  location: "none",
};

const DATE_RE =
  /^(\d{4})([-:])(\d{2})\2(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

// Capture dates are camera-local wall-clock values, never converted to UTC.
export function parseCaptureDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const dateOnly = /^(\d{4})[:-](\d{2})[:-](\d{2})$/.exec(value.trim());
  if (dateOnly) {
    const result = `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
    return validDate(result) ? result : null;
  }
  const match =
    /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min, s] = match;
  const result = `${y}-${m}-${d}T${h}:${min}:${s}`;
  return validDate(result) ? result : null;
}
export function validDate(value: string): boolean {
  const match = DATE_RE.exec(value.trim());
  if (!match) return false;

  const y = Number(match[1]);
  const m = Number(match[3]);
  const d = Number(match[4]);
  const h = Number(match[5] ?? 0);
  const min = Number(match[6] ?? 0);
  const s = Number(match[7] ?? 0);

  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    y >= 100 &&
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d &&
    h < 24 &&
    min < 60 &&
    s < 60
  );
}
export function formatTimestamp(value: string, format: DateFormat): string {
  if (!validDate(value))
    throw new Error("Enter a valid date and time to add your stamp.");
  const match = DATE_RE.exec(value.trim())!;
  const date = `${match[1]}-${match[3]}-${match[4]}`;
  const time = match[5] ? `${match[5]}:${match[6]}` : null;
  const [year, month, day] = date.split("-");
  if (format === "slash") return `${month}/${day}/${year}`;
  if (format === "iso") return date;
  if (format === "datetime")
    return `${month}.${day}.${year}${time ? `  ${time}` : ""}`;
  if (format === "written")
    return `${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][Number(month) - 1]} ${day}, ${year}`;
  return `${month}.${day}.${year}`;
}
export async function drawStamp(
  canvas: HTMLCanvasElement,
  image: CanvasImageSource,
  width: number,
  height: number,
  timestamp: string | null,
  settings: StampSettings,
  maxDimension?: number,
  coordinates?: Coordinates | null,
) {
  const scale = maxDimension
    ? Math.min(1, maxDimension / Math.max(width, height))
    : 1;
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create the image canvas.");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (!timestamp) return;
  const lines = [formatTimestamp(timestamp, settings.format)];
  if (settings.location === "coordinates" && coordinates) {
    lines.push(formatCoordinates(coordinates));
  }
  if (coordinates && settings.location !== "none" && settings.location !== "coordinates") {
    lines.push(await getCity(coordinates, settings.location));
  }
  const short = Math.min(canvas.width, canvas.height);
  let fontSize = (short * settings.size) / 100;
  ctx.font = `500 ${fontSize}px monospace`;
  const margin = short * 0.045;
  fontSize *= Math.min(
    1,
    (canvas.width - 2 * margin) / Math.max(...lines.map((line) => ctx.measureText(line).width)),
  );
  ctx.font = `500 ${fontSize}px monospace`;
  const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const lineHeight = fontSize * 1.35;
  const blockHeight = fontSize + (lines.length - 1) * lineHeight;
  const x = settings.position.endsWith("left")
    ? margin
    : settings.position.endsWith("center")
      ? (canvas.width - textWidth) / 2
      : canvas.width - margin - textWidth;
  const y = settings.position.startsWith("top")
    ? margin
    : canvas.height - margin - blockHeight;
  ctx.textBaseline = "top";
  if (settings.treatment === "background") {
    ctx.fillStyle = "rgba(16, 25, 22, 0.65)";
    ctx.fillRect(
      x - fontSize * 0.3,
      y - fontSize * 0.25,
      textWidth + fontSize * 0.6,
      blockHeight + fontSize * 0.55,
    );
  }
  if (settings.treatment === "shadow") {
    ctx.shadowColor = "rgba(0,0,0,.85)";
    ctx.shadowBlur = fontSize * 0.18;
    ctx.shadowOffsetY = fontSize * 0.07;
  }
  ctx.fillStyle = settings.color;
  lines.forEach((line, index) => {
    const lineWidth = ctx.measureText(line).width;
    const lineX = settings.position.endsWith("left") ? x
      : settings.position.endsWith("center") ? x + (textWidth - lineWidth) / 2
      : x + textWidth - lineWidth;
    ctx.fillText(line, lineX, y + index * lineHeight);
  });
}
