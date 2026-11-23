import { ChevronDown } from "lucide-react";

const useCases = [
  [
    "On a building site",
    "Photograph the same area each week. Visible dates make the sequence easier to follow when you send progress photos to a client.",
  ],
  [
    "At a property inspection",
    "Date photos of a leak, a repair, or a room’s condition before a tenant moves in. It saves looking up file details later.",
  ],
  [
    "For a claim or incident report",
    "Add a date to the copies you include in a report. Keep the original files too: an editable stamp cannot verify when a photo was taken.",
  ],
  [
    "For a film-camera look",
    "Try a small orange stamp in the bottom-right corner. It’s a familiar detail from older point-and-shoot cameras.",
  ],
];

const questions = [
  [
    "Do you upload or store my photos?",
    "No. The photo is opened and stamped in your browser. The app does not send your images to a server.",
  ],
  [
    "Which files can I use?",
    "JPG, PNG, and WebP, up to 50 MB and 40 megapixels per image. Other formats need to be converted first.",
  ],
  [
    "Why isn’t the date showing up automatically?",
    "The app needs a readable saved date. If it can’t find one, enter the date in the Date and time field. Always check the date in the preview before saving.",
  ],
  [
    "Can I download all my photos at once?",
    "Yes. Select up to 25 photos and choose Download ZIP to save the stamped PNGs together. Stamp settings apply to every photo. Each uses its own saved date unless you enter a custom date, which applies to all photos. If a photo has no saved date, you’ll be asked to enter one before exporting.",
  ],
  [
    "Will this replace my original file?",
    "No. Downloading creates a separate PNG at the original image dimensions, with the stamp added to the picture.",
  ],
  [
    "Can I change the style of the stamp?",
    "Yes. The settings let you change the date format, text size, color, and position. Add a shadow for contrast or a glow in your chosen text color.",
  ],
];

export function PhotoGuide() {
  return (
    <div className="mt-12 w-full sm:mt-16">
      <section
        aria-labelledby="privacy-title"
        className="border-l-2 border-accent py-1 pl-5 sm:pl-6"
      >
        <h2 id="privacy-title" className="text-base font-semibold">
          Your photos stay on your device
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Opening a photo here doesn’t upload it. Everything happens in your
          browser, and the download is a new copy.{" "}
          <strong className="font-semibold text-slate-900">
            No image uploads or server storage; your originals stay untouched.
          </strong>
        </p>
      </section>

      <section aria-labelledby="how-it-works-title" className="mt-16 sm:mt-20">
        <h2
          id="how-it-works-title"
          className="text-2xl font-semibold tracking-tight"
        >
          How to add a date to a photo
        </h2>
        <ol className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            [
              "Open your photos",
              "Choose files from your phone or computer, or drag them into the box above.",
            ],
            [
              "Check the date and style",
              "Use the saved date or type one in. Adjust the stamp while watching the preview.",
            ],
            [
              "Download a copy",
              "Save one photo as a PNG, or download all selected photos together in a ZIP file.",
            ],
          ].map(([title, description], index) => (
            <li
              key={title}
              className="rounded border border-slate-200 bg-white p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold">
                <span className="mr-2 text-primary">{index + 1}.</span>
                {title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="features-title"
        className="mt-16 grid gap-7 border-t border-slate-200 pt-8 sm:mt-20 md:grid-cols-[1fr_2fr] md:gap-12"
      >
        <div>
          <h2
            id="features-title"
            className="text-2xl font-semibold tracking-tight"
          >
            What you can adjust
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-7 text-slate-600">
            The preview updates as you go. Start with the date, then find a spot
            where the stamp is easy to read.
          </p>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {[
            [
              "Date & time",
              "Read a saved capture date when available, or enter a custom date and time.",
            ],
            [
              "Format",
              "Choose MM/DD/YYYY, MM.DD.YYYY, YYYY-MM-DD, a written month, or a date with time.",
            ],
            [
              "Appearance",
              "Adjust text size and color. Keep it plain, or add a shadow or glow.",
            ],
            [
              "Placement",
              "Six positions across the top and bottom of the photo.",
            ],
            [
              "Output",
              "PNGs at the original pixel dimensions. Multiple selected photos download together in a ZIP file.",
            ],
          ].map(([label, description]) => (
            <ul
              key={label}
              className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6"
            >
              <li className="text-sm font-semibold">{label}</li>
              <li className="text-sm leading-7 text-slate-600">
                {description}
              </li>
            </ul>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="use-cases-title"
        className="mt-16 w-full rounded-lg border border-accent/30 bg-accent/5 p-5 sm:mt-20 sm:p-8 lg:p-10"
      >
        <div className="max-w-2xl">
          <h2
            id="use-cases-title"
            className="font-serif text-3xl tracking-tight text-slate-900"
          >
            When a date on the photo helps
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            A photo’s file details don’t always follow it into a message, a
            report, or a printed album. A visible date does.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
          {useCases.map(([title, description]) => (
            <article
              key={title}
              className="min-w-0 rounded-lg border border-accent/30 bg-white p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="faq-title"
        className="mx-auto mt-16 max-w-3xl pb-8 sm:mt-24 sm:pb-12"
      >
        <div className="mb-8 text-center sm:mb-10">
          <h2 id="faq-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            A few things to know before you stamp your photos.
          </p>
        </div>
        <div className="space-y-4">
          {questions.map(([question, answer]) => (
            <details key={question} className="group rounded-lg border border-slate-200 bg-white shadow-sm open:border-primary/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-6 py-5 text-sm font-semibold hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden="true"
                  size={18}
                  className="shrink-0 text-primary motion-safe:transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="px-6 pb-6 pt-1 text-sm leading-7 text-slate-600">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
