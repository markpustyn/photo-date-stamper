import { ArrowUp, ShieldCheck } from "lucide-react";
import Image from "next/image";

function Footer() {
  return (
    <footer className="border-t border-primary/15 bg-[#f0f1ea]">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12 sm:py-12">
          <div className="max-w-sm">
            <a
              href="/home"
              aria-label="Date Stamper home"
              className="inline-flex items-center gap-3 rounded-sm text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Image src="/logo-sage.svg" alt="" width={32} height={32} />
              Date Stamper
            </a>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Every photo has a moment.
              <br />
              Add the date. Keep the memory.
            </p>
          </div>

          <nav aria-label="Footer" className="sm:pt-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-900">
              A little guidance
            </p>
            <ul className="mt-4 flex flex-col items-start gap-3">
              {[
                ["/#how-it-works-title", "How it works"],
                ["/#features-title", "Stamp options"],
                ["/#faq-title", "Common questions"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="rounded-sm text-sm text-slate-600 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col items-start gap-4 border-t border-primary/15 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-xs leading-5 text-slate-600">
            <ShieldCheck
              aria-hidden="true"
              className="size-4 shrink-0 text-primary"
            />
            Photos stay on your device. Originals stay yours.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-sm text-sm text-slate-600 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Back to top
            <ArrowUp aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
