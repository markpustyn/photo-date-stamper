import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Free Photo Date Stamper",
  description:
    "Add a date and time stamp to mulitple photos in seconds. Free, no signup, and your images never leave your browser. Choose your font, color, position, and format, then download.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-sans">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
