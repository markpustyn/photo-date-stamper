import { LockKeyhole } from "lucide-react";
import Image from "next/image";


function Header() {
  return (
    <div className="bg-white font-sans text-foreground">
      <header className=" bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 py-4 md:px-2 px-4">
          <a
            href="/"
            aria-label="Daymark home"
            className="inline-flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-mdtext-white">
              <Image src="/logo.png" alt="Logo" width={200} height={200} />
            </span>
            Date Stamper
          </a>

          <span className="hidden border-l border-slate-200 pl-4 text-sm text-slate-600 sm:inline">
            Photo date stamping
          </span>

          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-primary">
            <LockKeyhole size={14} />
            100% Secure
          </span>
        </div>
      </header>
    </div>
  );
}

export default Header;
