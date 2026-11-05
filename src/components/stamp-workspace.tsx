"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ImagePlus,
  Info,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { exportPhoto, loadPhoto, type LoadedPhoto } from "@/lib/images";
import { Button } from "@/components/ui/button";
import {
  defaultSettings,
  drawStamp,
  formatTimestamp,
  validDate,
  type DateFormat,
  type Position,
  type StampSettings,
} from "@/lib/stamp";

const positions: Position[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const colors = [
  { name: "White", value: "#ffffff" },
  { name: "Warm yellow", value: "#f6d990" },
  { name: "Peach", value: "#f29b68" },
  { name: "Forest green", value: "#172e28" },
];

const treatments = [
  { label: "Plain", value: "none" },
  { label: "Shadow", value: "shadow" },
  { label: "Background", value: "background" },
] as const;

function localNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function StampWorkspace() {
  const [files, setFiles] = useState<File[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);

  const [opened, setOpened] = useState(true);

  const [settings, setSettings] = useState<StampSettings>(defaultSettings);
  const [source, setSource] = useState<"exif" | "manual">("exif");
  const [manualDate, setManualDate] = useState("");

  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [renderError, setRenderError] = useState("");
  const [notice, setNotice] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<LoadedPhoto | null>(null);
  const requestRef = useRef(0);
  const dragDepth = useRef(0);

  const validManualDate = validDate(manualDate);
  const customTimestamp = validManualDate ? manualDate : null;
  const timestamp =
    source === "exif" ? (photo?.captureDate ?? null) : customTimestamp;

  const controlsDisabled = busy || exporting;
  const canDownload = Boolean(
    photo && timestamp && !controlsDisabled && !renderError,
  );
  const displayedError = error || renderError;

  useEffect(() => {
    setManualDate(localNow());

    return () => {
      requestRef.current++;

      if (photoRef.current) {
        URL.revokeObjectURL(photoRef.current.url);
        photoRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setRenderError("");

    const canvas = canvasRef.current;
    if (!photo || !canvas) return;

    try {
      drawStamp(
        canvas,
        photo.image,
        photo.width,
        photo.height,
        timestamp,
        settings,
        1600,
      );
    } catch (err) {
      setRenderError(
        err instanceof Error
          ? err.message
          : "The preview could not be rendered.",
      );
    }
  }, [photo, timestamp, settings]);

  function updateSetting<K extends keyof StampSettings>(
    key: K,
    value: StampSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function clearPreview() {
    if (photoRef.current) {
      URL.revokeObjectURL(photoRef.current.url);
      photoRef.current = null;
    }

    setPhoto(null);
    setError("");
    setRenderError("");
    setNotice("");
  }

  async function openPhoto(file: File) {
    const request = ++requestRef.current;

    clearPreview();
    setBusy(true);

    try {
      const loaded = await loadPhoto(file);

      if (request !== requestRef.current) {
        URL.revokeObjectURL(loaded.url);
        return;
      }

      photoRef.current = loaded;
      setPhoto(loaded);
      setSource(loaded.captureDate ? "exif" : "manual");
    } catch (err) {
      if (request === requestRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : `Could not open ${file.name}. Please try another image.`,
        );
      }
    } finally {
      if (request === requestRef.current) {
        setBusy(false);
      }
    }
  }

  function addFiles(selection: FileList | null) {
    const added = Array.from(selection ?? []);
    if (added.length === 0 || controlsDisabled) return;

    setFiles([...files, ...added]);
    setActiveIndex(files.length);
    void openPhoto(added[0]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    addFiles(input.files);
    input.value = "";
  }

  function handlePhotoChange(event: ChangeEvent<HTMLSelectElement>) {
    const index = Number(event.currentTarget.value);
    const file = files[index];
    if (!file) return;

    setActiveIndex(index);
    void openPhoto(file);
  }

  function removePhoto() {
    const remaining = files.filter((_, index) => index !== activeIndex);
    setFiles(remaining);

    if (remaining.length === 0) {
      requestRef.current++;
      clearPreview();
      setActiveIndex(0);
      setBusy(false);
      inputRef.current?.focus();
      return;
    }

    const nextIndex = Math.min(activeIndex, remaining.length - 1);
    setActiveIndex(nextIndex);
    void openPhoto(remaining[nextIndex]);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (controlsDisabled) return;

    dragDepth.current++;
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) {
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function downloadPhoto() {
    if (!photo || !timestamp || !canDownload) return;

    setExporting(true);
    setError("");
    setNotice("");

    try {
      const blob = await exportPhoto(photo, timestamp, settings);
      const url = URL.createObjectURL(blob);
      const filename = photo.name.replace(/\.[^.]+$/, "");

      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}-daymark.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setNotice("Your stamped photo is ready. Download started.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The download failed. Please try a smaller image.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">
      <section className="pb-8 pt-10 sm:pt-14 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary ">
          IMAGE TOOLS / DATE STAMP
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Image date stamper
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600 text-center mx-auto">
          Add a capture date or custom timestamp to your photos, then export
          each image at its original resolution.
        </p>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Photo picker and preview */}
        <section
          aria-label="Photo workspace"
          className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold">
              {photo ? "Image preview" : "Source images"}
            </h3>

            <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
              {files.length === 0
                ? "NO IMAGES SELECTED"
                : `${activeIndex + 1} / ${files.length}`}
            </span>
          </div>

          <input
            ref={inputRef}
            id="photo-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            aria-label="Select source images"
            className="sr-only"
            disabled={controlsDisabled}
            onChange={handleFileChange}
          />

          {files.length > 0 && (
            <div className="px-4 pt-4">
              <label
                htmlFor="selected-photo"
                className="mb-2 block text-sm font-semibold"
              >
                Selected photo
              </label>

              <select
                id="selected-photo"
                value={activeIndex}
                disabled={controlsDisabled}
                onChange={handlePhotoChange}
                className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {files.map((file, index) => (
                  <option key={index} value={index}>
                    {index + 1} of {files.length} · {file.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            data-dragging={dragging}
            data-loaded={Boolean(photo)}
            aria-busy={busy}
            onDragEnter={handleDragEnter}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="
                relative m-4 grid min-h-72 place-items-center overflow-hidden
                rounded-md border-2 border-dashed border-slate-300 p-5
                data-[loaded=true]:border-solid data-[loaded=true]:bg-slate-100
                data-[loaded=true]:p-2 data-[dragging=true]:border-primary
                data-[dragging=true]:ring-2 data-[dragging=true]:ring-primary
                sm:min-h-96
              "
          >
            {photo ? (
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={
                  timestamp
                    ? `${photo.name} stamped ${formatTimestamp(timestamp, settings.format)}`
                    : `${photo.name} without a timestamp`
                }
                className="block h-auto max-h-[70vh] w-auto max-w-full object-contain"
              />
            ) : (
              <Empty className="px-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="size-14 text-primary">
                    <ImagePlus
                      className="size-7"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </EmptyMedia>
                  <EmptyTitle
                    role="heading"
                    aria-level={3}
                    className="text-xl font-semibold"
                  >
                    {busy
                      ? "Opening photo…"
                      : files.length > 0
                        ? "Photo unavailable"
                        : "Select photos to begin"}
                  </EmptyTitle>
                  <EmptyDescription>
                    Drag and drop photos here, or browse your device.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    type="button"
                    disabled={controlsDisabled}
                    onClick={() => inputRef.current?.click()}
                    size="lg"
                    className="px-5"
                  >
                    {busy ? (
                      <LoaderCircle
                        size={17}
                        className="motion-safe:animate-spin"
                      />
                    ) : (
                      <ImagePlus size={17} />
                    )}
                    Select photos
                    <ArrowRight size={16} />
                  </Button>

                  <span className="text-xs text-slate-500">
                    JPG, PNG or WebP · Up to 50 MB / 40 MP per photo
                  </span>
                </EmptyContent>
              </Empty>
            )}

            {dragging && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-950/75 p-4 text-center font-semibold text-white">
                Drop to add photos
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
            {files.length > 0 ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {files[activeIndex]?.name}
                  </p>

                  {photo && (
                    <p className="mt-1 text-xs text-slate-600">
                      {photo.width.toLocaleString()} ×{" "}
                      {photo.height.toLocaleString()} px · Original resolution
                      export
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  title="Remove current image"
                  aria-label="Remove current image"
                  disabled={controlsDisabled}
                  onClick={removePhoto}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                >
                  <Trash2 size={17} />
                </button>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                  <LockKeyhole size={14} />
                  Processed on your device
                </span>

                <span className="text-xs text-slate-600">
                  Original files preserved
                </span>
              </>
            )}
          </div>

          {files.length > 0 && (
            <button
              type="button"
              disabled={controlsDisabled}
              onClick={() => inputRef.current?.click()}
              className="mb-4 ml-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              <ImagePlus size={15} />
              Add more photos
            </button>
          )}
        </section>

        {/* Stamp settings */}
        <aside
          aria-labelledby="settings-title"
          className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          {opened && (
            <div className="space-y-5 p-5">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">
                  Timestamp source
                </legend>

              {photo && !photo.captureDate && (
                <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-800">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  {photo.metadataWarning
                    ? "We couldn’t read the EXIF data. Use a custom date for this photo."
                    : "No EXIF capture date found. Use a custom date for this photo."}
                </p>
              )}
                <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-600">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  {photo?.captureDate
                    ? `Captured ${formatTimestamp(photo.captureDate, "datetime")} (camera time)`
                    : "Uses the capture date saved by your camera."}
                </p>
                <div className="mt-3">
                  <label
                    htmlFor="custom-date"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Date and time
                  </label>

                  <input
                    id="custom-date"
                    type="datetime-local"
                    min="0100-01-01T00:00"
                    max="9999-12-31T23:59"
                    value={manualDate}
                    aria-invalid={!validManualDate}
                    onChange={(event) => {
                      setManualDate(event.currentTarget.value);
                      setNotice("");
                    }}
                    className="block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm aria-[invalid=true]:border-red-500"
                  />

                  {!validManualDate && (
                    <p className="mt-2 text-xs text-amber-800">
                      Enter a valid date and time.
                    </p>
                  )}
                </div>
            </fieldset>

            <div className="border-t border-slate-200" />

            <div>
              <label
                htmlFor="date-format"
                className="mb-2 block text-sm font-semibold"
              >
                Date format
              </label>

              <div className="relative">
                <select
                  id="date-format"
                  value={settings.format}
                  onChange={(event) =>
                    updateSetting(
                      "format",
                      event.currentTarget.value as DateFormat,
                    )
                  }
                  className="block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-9 text-sm"
                >
                  <option value="classic">MM.DD.YYYY</option>
                  <option value="iso">YYYY-MM-DD</option>
                  <option value="written">MON DD, YYYY</option>
                  <option value="datetime">MM.DD.YYYY HH:mm</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                <label htmlFor="text-size">Text size</label>
                <span className="font-mono text-primary">{settings.size}%</span>
              </div>

              <input
                id="text-size"
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={settings.size}
                onChange={(event) =>
                  updateSetting("size", Number(event.currentTarget.value))
                }
                className="w-full cursor-pointer accent-primary"
              />

              <div className="flex justify-between text-xs text-slate-500">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Text color</legend>

              <div className="flex flex-wrap items-center gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    data-color={color.value}
                    aria-label={color.name}
                    aria-pressed={settings.color === color.value}
                    onClick={() => updateSetting("color", color.value)}
                    className="
                        grid size-8 place-items-center rounded-full border
                        border-black/15 text-[#253f36]
                        data-[color='#ffffff']:bg-white
                        data-[color='#f6d990']:bg-[#f6d990]
                        data-[color='#f29b68']:bg-[#f29b68]
                        data-[color='#172e28']:bg-[#172e28]
                        data-[color='#172e28']:text-white
                        aria-pressed:ring-2 aria-pressed:ring-primary
                        aria-pressed:ring-offset-2
                      "
                  >
                    {settings.color === color.value && <Check size={16} />}
                  </button>
                ))}

                <label
                  title="Choose a custom text color"
                  className="relative rounded-lg border border-slate-300 px-2 py-1.5 font-mono text-xs focus-within:ring-2 focus-within:ring-primary"
                >
                  <input
                    type="color"
                    aria-label="Custom text color"
                    value={settings.color}
                    onChange={(event) =>
                      updateSetting("color", event.currentTarget.value)
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {settings.color.toUpperCase()}
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Position</legend>

              <div className="flex items-center gap-4">
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                  {positions.map((position) => (
                    <button
                      key={position}
                      type="button"
                      aria-label={position.replaceAll("-", " ")}
                      aria-pressed={settings.position === position}
                      onClick={() => updateSetting("position", position)}
                      className="grid h-7 w-8 place-items-center rounded border border-slate-200 bg-white text-slate-400 hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                    </button>
                  ))}
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Selected position
                  <span className="block font-semibold capitalize text-slate-800">
                    {settings.position.replaceAll("-", " ")}
                  </span>
                </p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold">
                Text treatment
              </legend>

              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {treatments.map((treatment) => (
                  <button
                    key={treatment.value}
                    type="button"
                    aria-pressed={settings.treatment === treatment.value}
                    onClick={() => updateSetting("treatment", treatment.value)}
                    className="rounded-md px-1 py-2 text-xs font-medium text-slate-600 hover:bg-white/60 aria-pressed:bg-white aria-pressed:text-primary aria-pressed:shadow-sm"
                  >
                    {treatment.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          )}
            <div className="space-y-3 border-t border-slate-100 p-5">
              <Button
                type="button"
                size="lg"
                disabled={!canDownload}
                onClick={() => void downloadPhoto()}
                className="w-full justify-center gap-2"
              >
                {exporting ? (
                  <LoaderCircle size={18} className="motion-safe:animate-spin" />
                ) : (
                  <ArrowDownToLine size={18} />
                )}

                {exporting ? "Preparing your photo…" : "Download stamped photo"}
              </Button>

              <div className="grid auto-cols-fr grid-flow-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setSettings(defaultSettings);
                    setNotice("");
                  }}
                  className="w-full px-3"
                >
                  Reset
                </Button>

                {!opened && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setOpened(true)}
                    className="w-full px-3"
                  >
                    More Settings
                  </Button>
                )}
              </div>
            </div>
        </aside>
      </div>

      {displayedError && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <Info size={18} className="shrink-0" />
          {displayedError}
        </div>
      )}

      <div role="status" aria-live="polite">
        {notice && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-primary">
            <Check size={18} className="shrink-0" />
            {notice}
          </div>
        )}
      </div>

      <section className="mt-6 flex items-start gap-3 rounded-md border border-slate-200 bg-slate-100 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-primary">
          <ShieldCheck size={20} />
        </span>

        <div>
          <h3 className="text-sm font-semibold">
            Private processing. Original quality.
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Images are processed in your browser and are never uploaded or
            stored on a server.
          </p>
        </div>
      </section>
    </main>
  );
}
