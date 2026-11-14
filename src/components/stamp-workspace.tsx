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
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  ImagePlus,
  Info,
  LoaderCircle,
  LockKeyhole,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  Pencil,
  PencilIcon,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { DockDemo } from "@/components/dock";
import { exportPhoto, loadPhoto, type LoadedPhoto } from "@/lib/images";
import { createPhotoArchive } from "@/lib/photo-archive";
import { formatCoordinates } from "@/lib/location";
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
import Link from "next/link";
import { Dock, DockIcon } from "./ui/dock";

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
  const [exportProgress, setExportProgress] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [renderError, setRenderError] = useState("");
  const [notice, setNotice] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<LoadedPhoto | null>(null);
  const requestRef = useRef(0);
  const dragDepth = useRef(0);
  const maxImages = 25;
  const validManualDate = validDate(manualDate);
  const customTimestamp = validManualDate ? manualDate : null;
  const timestamp =
    source === "exif" ? (photo?.captureDate ?? null) : customTimestamp;
  const dateInput = source === "exif" ? (photo?.captureDate ?? "") : manualDate;
  const dateOnly = dateInput.length === 10;

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

    let cancelled = false;
    const preview = document.createElement("canvas");
    void drawStamp(
        preview,
        photo.image,
        photo.width,
        photo.height,
        timestamp,
        settings,
        1600,
        photo.coordinates,
      ).then(() => {
        if (cancelled) return;
        canvas.width = preview.width;
        canvas.height = preview.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("The preview could not be rendered.");
        context.drawImage(preview, 0, 0);
      }).catch((err: unknown) => {
      if (cancelled) return;
      setRenderError(
        err instanceof Error
          ? err.message
          : "The preview could not be rendered.",
      );
      });
    return () => { cancelled = true; };
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
    const remaining = maxImages - files.length;
    if (added.length > remaining) {
      setError(remaining === 0
        ? `You can add up to ${maxImages} images. Remove a photo before adding more.`
        : `You can add up to ${maxImages} images. Choose ${remaining} or fewer additional photos.`);
      return;
    }

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
    selectPhoto(Number(event.currentTarget.value));
  }

  function selectPhoto(index: number) {
    if (controlsDisabled || index === activeIndex) return;
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
    setExportProgress("Preparing…");
    setError("");
    setNotice("");

    try {
      const multiple = files.length > 1;
      const blob = multiple
        ? await createPhotoArchive(files, settings, source === "manual" ? timestamp : null, (completed, total) => {
            setExportProgress(completed === total ? "Creating ZIP…" : `Stamping ${completed + 1} of ${total}…`);
          })
        : await exportPhoto(photo, timestamp, settings);
      const url = URL.createObjectURL(blob);
      const filename = photo.name.replace(/\.[^.]+$/, "");

      const link = document.createElement("a");
      link.href = url;
      link.download = multiple ? "datestamper-photos.zip" : `${filename}-datestampIO.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      setNotice(multiple ? `ZIP download started with ${files.length} stamped photos.` : "Stamped photo download started.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The download failed. Please try a smaller image.",
      );
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  }

  return (
    <div data-settings-open={opened} className="relative grid w-full min-h-0 min-w-0 flex-1 grid-cols-1 pb-10 xl:grid-cols-[22rem_minmax(0,1fr)_22rem] xl:data-[settings-open=false]:grid-cols-[0_minmax(0,1fr)_0] xl:grid-rows-[auto_minmax(0,1fr)_auto] xl:gap-x-4 xl:pb-0">
      {!opened && (
        <button
          id="open-stamp-settings"
          type="button"
          aria-controls="stamp-settings"
          aria-expanded={false}
          onClick={() => {
            setOpened(true);
            requestAnimationFrame(() => document.getElementById("close-stamp-settings")?.focus());
          }}
          className="absolute left-4 top-2 z-20 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <PanelLeftOpen aria-hidden="true" size={18} />
          Settings
        </button>
      )}
      <aside
          id="stamp-settings"
          aria-label="Stamp settings"
          className={`${opened ? "flex" : "hidden"} order-3 mt-5 max-h-[calc(100dvh-2rem)] w-full min-h-0 min-w-0 max-w-5xl flex-col justify-self-center overflow-hidden border-r bg-white xl:order-0 xl:col-start-1 xl:row-start-1 xl:row-span-3 xl:mt-0 xl:max-h-full xl:self-stretch xl:rounded-l-none xl:border-l-0`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold">Edit</h2>
            <button
              id="close-stamp-settings"
              type="button"
              aria-label="Close settings panel"
              title="Close settings panel"
              onClick={() => {
                setOpened(false);
                requestAnimationFrame(() => document.getElementById("open-stamp-settings")?.focus({ preventScroll: true }));
              }}
              className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          {opened && (
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">

              
              {photo && !photo.captureDate && (
                <p className="flex items-start gap-2 text-xs leading-5 text-amber-800">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  {photo.metadataWarning
                    ? "We couldn’t read the EXIF data. Use a custom date for this photo."
                    : "No EXIF capture date found. Use a custom date for this photo."}
                </p>
              )}
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
                <div>
                  <div className="flex items-center gap-4">
                  <label
                    htmlFor="custom-date"
                    className="w-24 shrink-0 text-sm font-semibold"
                  >
                    Date and time
                  </label>

                  <input
                    id="custom-date"
                    type={dateOnly ? "date" : "datetime-local"}
                    min={dateOnly ? "0100-01-01" : "0100-01-01T00:00"}
                    max={dateOnly ? "9999-12-31" : "9999-12-31T23:59"}
                    value={dateInput}
                    aria-invalid={!validDate(dateInput)}
                    onChange={(event) => {
                      setManualDate(event.currentTarget.value);
                      setSource("manual");
                    }}
                    className="block min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                  </div>
                </div>
            <div className="flex items-center gap-4">
              <label
                htmlFor="date-format"
                className="w-24 shrink-0 text-sm font-semibold"
              >
                Date format
              </label>

              <div className="relative min-w-0 flex-1">
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
                  <option value="slash">MM/DD/YYYY</option>
                  <option value="classic">MM.DD.YYYY</option>
                  <option value="iso">YYYY-MM-DD</option>
                  <option value="written">MON DD, YYYY</option>
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

            <fieldset disabled={controlsDisabled} className="border-t border-slate-200 pt-5">
              <legend className="text-sm font-semibold">Location</legend>
              <label htmlFor="stamp-location" className="sr-only">Location on stamp</label>
              <select
                id="stamp-location"
                value={settings.location}
                onChange={(event) => updateSetting("location", event.currentTarget.value as StampSettings["location"])}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="none">No location</option>
                <option value="coordinates">Coordinates</option>
                <option value="city">City</option>
                <option value="city-state">City + State</option>
                <option value="city-state-country">City + State + Country</option>
              </select>
              <p className="mt-3 wrap-break-word text-xs leading-5 text-slate-600">
                {!photo ? "Select a photo to read its saved GPS coordinates."
                  : photo.coordinates ? `Saved coordinates: ${formatCoordinates(photo.coordinates)}`
                  : "No readable GPS coordinates found in this photo. Location will be omitted from the stamp."}
              </p>
              {settings.location !== "none" && settings.location !== "coordinates" && (
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  Place names are looked up using Google. Only the saved coordinates are sent; your photo stays on your device.
                </p>
              )}
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
                      className="grid h-7 w-8 place-items-center rounded border border-slate-200 bg-white text-slate-400 hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
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

          </div>
          )}
            <div className="mt-auto shrink-0 space-y-3 border-t border-slate-100 bg-white p-5">
              <div className="grid auto-cols-fr grid-flow-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setSettings(defaultSettings);
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
    <section className="order-1 min-w-0 px-4 pb-6 pt-8 text-center sm:pt-10 xl:order-0 xl:col-start-2 xl:row-start-1">
      <p className="text-xs font-semibold tracking-widest text-primary">
        IMAGE TOOLS / DATE STAMP
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Image Date Stamper
      </h1>
      <h2 className="text-lg font-semibold text-slate-700 mt-2">100% Private</h2>
      <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
       All images are processed securely in your
        browser, never uploaded, stored, or sent to our servers
      </p>
    </section>
      <div className="order-2 grid min-h-0 min-w-0 content-start gap-4 px-4 sm:px-8 xl:order-0 xl:col-start-2 xl:row-start-2 xl:flex xl:flex-col xl:overflow-y-auto xl:overscroll-contain xl:px-0 xl:pb-5">
        {/* Photo picker and preview */}
        <section
          aria-label="Photo workspace"
          data-loaded={Boolean(photo)}
          className="flex w-full min-w-0 max-w-4xl flex-col justify-self-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:mx-auto xl:min-h-56 xl:max-h-[40dvh] xl:flex-1 xl:shrink-0 xl:data-[loaded=true]:max-h-[65dvh]"
        >

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
          <div
            data-dragging={dragging}
            data-loaded={Boolean(photo)}
            aria-busy={busy}
            onDragEnter={handleDragEnter}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="
                relative m-2 grid min-h-[clamp(11rem,28dvh,17rem)] place-items-center overflow-hidden
                rounded-md border-2 border-dashed border-slate-300 p-3 sm:m-3 sm:p-5
                data-[loaded=true]:border-solid data-[loaded=true]:bg-slate-100
                data-[loaded=true]:min-h-0 data-[loaded=true]:p-2 data-[dragging=true]:border-primary
                data-[dragging=true]:ring-2 data-[dragging=true]:ring-primary
                xl:min-h-40 xl:flex-1
              "
          >
            {photo ? (
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={
                  timestamp
                    ? `${photo.name} stamped ${formatTimestamp(timestamp, settings.format)}${settings.location === "coordinates" && photo.coordinates ? `, ${formatCoordinates(photo.coordinates)}` : ""}`
                    : `${photo.name} without a timestamp`
                }
                className="block h-auto max-h-[min(65dvh,40rem)] w-auto max-w-full object-contain xl:absolute xl:inset-0 xl:h-full xl:max-h-full xl:w-full xl:p-2"
              />
            ) : (
              <>
              <button
                type="button"
                aria-label="Select photos to upload"
                disabled={controlsDisabled}
                onClick={() => inputRef.current?.click()}
                className="absolute inset-0 z-10 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:cursor-wait disabled:hover:bg-transparent"
              />
              <Empty className="px-0"
              >
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
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
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
                  </span>

                  <span className="text-xs text-slate-500">
                    Up to {maxImages} images · JPG, PNG or WebP · 50 MB / 40 MP per photo
                  </span>
                </EmptyContent>
              </Empty>
              </>
            )}
            {dragging && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-950/75 p-4 text-center font-semibold text-white">
                Drop to add photos
              </div>
            )}
          </div>
        </section>
    <div className="relative shrink-0 pb-5" role="group" aria-label="Photo actions">
      <Dock direction="middle" iconSize={44} iconMagnification={52} className="mt-0 h-16 max-w-full gap-2 rounded-xl bg-white px-2 shadow-sm">
        <DockIcon className="p-0! [&>div]:size-full">
          <button
            type="button"
            title="Add more photos"
            disabled={controlsDisabled}
            onClick={() => inputRef.current?.click()}
            className="grid size-full place-items-center rounded-lg text-slate-600 hover:bg-accent/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
          >
            <CirclePlus aria-hidden="true" className="size-5" />
          </button>
        </DockIcon>
        <DockIcon className="p-0! [&>div]:size-full">
          <button
              type="button"
              title="Remove current image"
              aria-label="Remove current image"
              disabled={controlsDisabled}
              onClick={removePhoto}
            className="grid size-full place-items-center rounded-lg text-slate-600 hover:bg-accent/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
          >
            <Trash2 aria-hidden="true" className="size-5" />
          </button>
        </DockIcon>
        <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-slate-200" />
        <DockIcon className="p-0! [&>div]:size-full">
          <button
              type="button"
              title="Previous Image"
              aria-label="Previous Image"
              disabled={controlsDisabled || activeIndex <= 0 || files.length === 0}
              onClick={() => selectPhoto(activeIndex - 1)}
            className="grid size-full place-items-center rounded-lg text-slate-600 hover:bg-accent/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
        </DockIcon>
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="min-w-14 shrink-0 text-center text-xs font-medium tabular-nums text-slate-600"
        >
          {files.length > 0 ? `${activeIndex + 1} of ${files.length}` : "0 of 0"}
        </span>
        <DockIcon className="p-0! [&>div]:size-full">
          <button
              type="button"
              title="Next Image"
              aria-label="Next Image"
              disabled={controlsDisabled || activeIndex >= files.length - 1}
              onClick={() => selectPhoto(activeIndex + 1)}
            className="grid size-full place-items-center rounded-lg text-slate-600 hover:bg-accent/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </DockIcon>
        <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-slate-200" />
              <Button
                type="button"
                size="lg"
                disabled={!canDownload}
                onClick={() => void downloadPhoto()}
                className="h-11 justify-center gap-2 rounded-lg px-4 text-white"
              >
                {exporting ? (
                  <LoaderCircle size={18} className="motion-safe:animate-spin" />
                ) : (
                  <ArrowDownToLine size={18} />
                )}
                {exporting ? exportProgress : files.length > 1 ? `Download ZIP (${files.length})` : "Download photo"}
              </Button>
      </Dock>
    </div>

      {displayedError && (
        <div
          role="alert"
          className="flex w-full max-w-5xl items-center gap-2 justify-self-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <Info size={18} className="shrink-0" />
          {displayedError}
        </div>
      )}
      
      </div>
    </div>
  );
}
