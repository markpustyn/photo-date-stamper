# Date Stamper

<p align="center">
  <img src="public/logo.png" alt="Date Stamper logo" width="120" />
</p>

Add a visible date and optional location to photos in your browser. Date Stamper includes a live preview, adjustable stamp styling, and batch downloads for up to 25 images.

Built with Next.js App Router, React, TypeScript, and Tailwind CSS.


## Examples

| Date Stamped Images | Location Input |
| --- | --- |
| <img width="400" alt="Date stamped image 1" src="https://github.com/user-attachments/assets/869b07f6-61e9-476c-a770-2823c9aeb8e5" /> | <img width="400" alt="Location input" src="https://github.com/user-attachments/assets/9274ad23-e9d9-4503-9ac8-b8088f903ba8" /> |
| <img width="400" alt="Date stamped image 2" src="https://github.com/user-attachments/assets/2a90547c-32bb-4acf-9935-e3508adf457c" /> | <img width="400" alt="Date stamped image 3" src="https://github.com/user-attachments/assets/c9858c36-fdb4-43a7-aebe-60ae61d5ff22" /> |





## Demo

<img width="2560" height="1440" alt="Screenshot 2026-11-14 140425" src="https://github.com/user-attachments/assets/ea96e3a0-ea31-4903-a7a4-ea3f2b00e8d9" />

## Features

- Select or drag in JPG, PNG, and WebP images.
- Read a date and GPS coordinates from image metadata, or enter a custom date and time.
- Choose slash dates (`11/11/2026`), dotted dates, ISO dates, written dates, or a date with time.
- Adjust text size, color, and placement across six positions.
- Apply a shadow, a glow, or plain text.
- Include GPS coordinates, city, city and state, or city, state, and country. State and country use abbreviations when available.
- Preview and navigate photos using the dock, and remove individual images.
- Download one stamped PNG or all stamped PNGs together in a ZIP.
- Use a collapsible settings panel with a responsive mobile layout.

## Getting started

Requires Node.js 20.9 or later and npm.

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

Development and production builds use Webpack, as configured in `package.json`.

### Optional location lookup

Date stamping and coordinate stamps do not need an API key. Place-name stamps use Google's Geocoding API.

Create `.env.local` in the project root:

```dotenv
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

The app also accepts `GOOGLE_API_KEY` as a fallback. Restart the development server after changing environment variables. For deployment, configure the variable in your hosting environment.

The current implementation retrieves the key through `GET /api/secure`, then calls Google from the browser. Despite its name, this route returns the key to the client; it does not keep the key private. Do not commit real credentials.

## Using the app

1. Add up to 25 photos using the upload area or the dock's add button.
2. Review the detected date, or enter a custom date and time. Choose the stamp format, appearance, position, and optional location.
3. Download the stamped image, or download a ZIP when multiple images are selected.

Batch export uses each photo's detected date unless a custom date is supplied; a custom date applies to all photos. Each photo uses its own GPS coordinates. If a photo has no usable date, batch export asks for a custom date.

## Image handling and privacy

Photo decoding, metadata reading, preview rendering, and export happen in the browser. Image files are not uploaded to the app's server, and original files are not modified.

Choosing a place-name stamp sends the photo's saved coordinates to Google. Coordinate-only stamps do not make that lookup. The app also includes Vercel Analytics, so local photo processing does not mean the page makes no network requests.

- Supported inputs: JPG, PNG, and WebP.
- Limits: 25 images per selection collection, 50 MB per image, and 40 megapixels per image.
- Preview: scaled to a maximum dimension of 1600 pixels.
- Export: PNG at the decoded original dimensions, with the visible stamp baked into the pixels. Source EXIF metadata is not copied.
- Batch export: images are processed sequentially and packaged with JSZip. Duplicate output names receive numbered suffixes.
- Photos and settings are held in memory; refreshing the page clears the workspace. Large batches can still exceed a device's available memory.

### Metadata behavior

The current metadata reader uses ExifReader and reads `GPSDateStamp` from EXIF, falling back to XMP. It does not currently fall back to `DateTimeOriginal` or `CreateDate`. Photos with a capture date but no GPS date may therefore need a custom date.

Date-only metadata stays date-only. The date formatter does not apply timezone conversion, and a GPS date should not be assumed to represent the camera's local capture date.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run library tests with `tsx` |

For a production run:

```sh
npm run build
npm start
```

Use a deployment that supports Next.js route handlers if place-name lookup is required; `/api/secure` needs a server runtime.

## Project structure

```text
src/
  app/
    api/secure/route.ts       Location API key endpoint
    globals.css              Global styles and theme
    layout.tsx               Shared layout, metadata, and analytics
    page.tsx                 Main page
  components/
    stamp-workspace.tsx      Upload, preview, settings, and download UI
    photo-guide.tsx          Instructions and supporting page content
    ui/                      Shared UI components, including the dock
  lib/
    capture-date.ts          Metadata extraction
    images.ts                Image validation, decoding, and PNG export
    location.ts              Coordinates and Google place-name lookup
    photo-archive.ts         Batch ZIP export
    stamp.ts                 Date formatting and canvas stamp rendering
    *.test.ts                Library tests
public/
  images/                    Brand assets and icons
  robots.txt                 Crawler rules
  sitemap.xml                Public sitemap
```

## Verification

```sh
npm run typecheck
npm test
npm run build
```

For a browser smoke check, try photos with and without GPS metadata, a custom date, each stamp treatment, a single PNG download, and a batch ZIP. Check the sidebar, uploader, and dock at a small viewport, and verify that downloaded images match the preview.

## Site metadata

The page metadata and sitemap currently reference `https://datestamper.io`. When deploying under another domain, update `src/app/layout.tsx`, `src/app/page.tsx`, `public/sitemap.xml`, and `public/robots.txt` to match.
