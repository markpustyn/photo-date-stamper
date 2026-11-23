import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Header() {
  return (
    <div className="bg-white font-sans text-foreground">
      <header className=" bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 py-4 md:px-2 px-4">
          <a
            href="/home"
            aria-label="Date Stamper home"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-md">
              <Image src="/logo-sage.svg" alt="" width={36} height={36} />
            </span>
            Date Stamper
          </a>

          <span className="hidden border-l border-slate-200 pl-4 text-sm text-slate-600 sm:inline">
            Photo date stamping
          </span>

          <nav aria-label="Main navigation" className="ml-auto">
            <Link
              href="/home"
              className="inline-flex rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}

export default Header;
