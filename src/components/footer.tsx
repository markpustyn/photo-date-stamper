import React from "react";

function Footer() {
  return (
    <div>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-xs text-slate-600 sm:px-8">
          <span className="text-base font-bold text-primary">
            Photo Date Stamper
          </span>
          <span>Image date stamping workspace</span>

          <span className="inline-flex items-center gap-2 sm:ml-auto">
            Browser-based processing
            <span className="size-2 rounded-full bg-primary" />
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
