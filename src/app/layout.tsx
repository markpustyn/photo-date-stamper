import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = "https://datestamper.io";
const title = "Free Photo Date Stamper — Add Dates to Photos Online";
const description =
  "Add date and location stamps to photos online for free. Customize the style and download full-resolution PNGs. Your photos stay on your device.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Date Stamper",
  title: {
    default: title,
    template: "%s | Date Stamper",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Date Stamper",
    locale: "en_US",
    title,
    description,
    images: [
      {
        url: "/images/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Date Stamper photo timestamp tool",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [
      {
        url: "/images/android-chrome-512x512.png",
        alt: "Date Stamper photo timestamp tool",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    shortcut: "/images/favicon.ico",
    icon: [
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      {
        url: "/images/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/images/site.webmanifest",
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
