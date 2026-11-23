import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  Check,
  Download,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import Footer from "@/components/footer";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "The film-camera date stamp look | Date Stamper",
  description:
    "Give your digital photos that nostalgic point-and-shoot date stamp. Choose a date, make it yours, and download a new copy, right in your browser.",
  alternates: { canonical: "https://datestamper.io/home" },
  openGraph: {
    title: "A little date. A whole feeling.",
    description:
      "The film-camera date stamp look, for the photos you take today.",
    url: "https://datestamper.io/home",
  },
};

const photos = [
  {
    src: "/images/home/lake.jpg",
    alt: "A quiet lake surrounded by mountains",
    date: "08.24.2024",
    caption: "Somewhere we'd go back to.",
    label: "01 / THE WEEKEND AWAY",
  },
  {
    src: "/images/home/forest.jpg",
    alt: "Sunlight falling through a green forest",
    date: "06.12.2024",
    caption: "The long way home.",
    label: "02 / THE EVERYDAY ADVENTURE",
  },
  {
    src: "/images/home/morning.jpg",
    alt: "Soft morning light across a misty meadow",
    date: "09.03.2024",
    caption: "Up before the rest of the world.",
    label: "03 / THE SLOW MORNING",
  },
];

function Photo({
  photo,
  hero = false,
}: {
  photo: (typeof photos)[number];
  hero?: boolean;
}) {
  return (
    <figure className={`${styles.print} ${hero ? styles.heroPrint : ""}`}>
      <div className={styles.photo}>
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1200}
          height={900}
          sizes={
            hero
              ? "(max-width: 600px) 90vw, 45vw"
              : "(max-width: 600px) 90vw, 30vw"
          }
          loading={hero ? "eager" : "lazy"}
        />
        <span className={styles.date}>{photo.date}</span>
      </div>
      <figcaption>
        <span>{photo.caption}</span>
        <Camera size={17} aria-hidden="true" />
      </figcaption>
    </figure>
  );
}

export default function HomePage() {
  return (
    <div className={styles.home} id="top">
      <a href="#content" className={styles.skip}>
        Skip to content
      </a>
      <header className={styles.header}>
        <Link href="/home" className={styles.brand}>
          <Image src="/logo-sage.svg" alt="" width={32} height={32} />
          Date Stamper
        </Link>
        <nav aria-label="Main navigation" className={styles.nav}>
          <a href="#the-look">The look</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/" className={styles.smallButton}>
            Open the editor <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main id="content" className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> DIGITAL PHOTOS. ANALOG NOSTALGIA.
            </p>
            <h1 id="hero-title">
              A little date.
              <br />A whole <em>feeling.</em>
            </h1>
            <p className={styles.intro}>
              That tiny stamp in the corner. That summer you still think about.
              Bring the film-camera date stamp look to the photos you take
              today.
            </p>
            <Link href="/" className={styles.button}>
              Stamp your first photo{" "}
              <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <p className={styles.micro}>
              <Check size={14} aria-hidden="true" /> Free to use <span>·</span>{" "}
              No sign-up <span>·</span> All in your browser
            </p>
          </div>
          <div className={styles.heroArt}>
            <span className={styles.tape} aria-hidden="true" />
            <Photo photo={photos[0]} hero />
            <div className={styles.note}>
              New photos.
              <br />
              Old-school soul.
            </div>
            <span className={styles.frameLabel}>
              A MOMENT WORTH KEEPING — NO. 001
            </span>
          </div>
        </section>

        <div className={styles.ribbon}>
          <span>
            <Camera size={18} /> A little point-and-shoot nostalgia
          </span>
          <span>
            <SlidersHorizontal size={18} /> Your date. Your style.
          </span>
          <span>
            <ShieldCheck size={18} /> Your photos stay yours
          </span>
        </div>

        <section
          id="the-look"
          className={styles.section}
          aria-labelledby="look-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>THE LOOK</p>
              <h2 id="look-title">
                For the days you
                <br />
                want to <em>hold on to.</em>
              </h2>
            </div>
            <p>
              Weekend escapes. Ordinary afternoons. The good stuff in between. A
              small date turns a photo into a keepsake.
            </p>
          </div>
          <div className={styles.gallery}>
            {photos.map((photo) => (
              <div key={photo.date}>
                <Photo photo={photo} />
                <p className={styles.photoLabel}>{photo.label}</p>
              </div>
            ))}
          </div>
          <p className={styles.disclosure}>
            Illustrative date stamp examples. Date Stamper adds a stamp to your
            image; it does not apply a film filter.
          </p>
        </section>

        <section
          id="how-it-works"
          className={styles.how}
          aria-labelledby="how-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>FROM CAMERA ROLL TO KEEPSAKE</p>
              <h2 id="how-title">
                Three steps.
                <br />
                <em>One lovely detail.</em>
              </h2>
            </div>
            <Link href="/" className={styles.textLink}>
              Let’s make one <ArrowUpRight size={19} />
            </Link>
          </div>
          <div className={styles.steps}>
            {[
              {
                icon: Camera,
                title: "Pick a moment",
                copy: "Open a JPG, PNG, or WebP from your camera roll. Start with one, or bring up to 25 photos.",
              },
              {
                icon: SlidersHorizontal,
                title: "Make your mark",
                copy: "Use the saved date or enter your own. Choose the format, color, size, and that perfect little corner.",
              },
              {
                icon: Download,
                title: "Keep it forever",
                copy: "Download a stamped PNG, or a ZIP for the whole batch. Your original photos stay untouched.",
              },
            ].map(({ icon: Icon, title, copy }, index) => (
              <article key={title}>
                <div className={styles.stepTop}>
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  <span>0{index + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.details} aria-labelledby="details-title">
          <div>
            <p className={styles.eyebrow}>SMALL DETAILS, ALL YOURS</p>
            <h2 id="details-title">
              A stamp that feels
              <br />
              like <em>you.</em>
            </h2>
            <p>
              Keep it quiet in soft white. Go nostalgic with a warm glow. Place
              it in a corner, and let the photo do the talking.
            </p>
            <Link href="/" className={styles.textLink}>
              Find your style <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className={styles.swatches}>
            <div>
              <span className={styles.stampClassic}>08.24.2024</span>
              <small>THE CLASSIC / DOTTED DATE</small>
            </div>
            <div>
              <span className={styles.stampWritten}>AUG 24, 2024</span>
              <small>THE EVERYDAY / WRITTEN DATE</small>
            </div>
            <div>
              <span className={styles.stampMinimal}>2024-08-24</span>
              <small>THE MINIMAL / YEAR FIRST</small>
            </div>
          </div>
        </section>
        <section className={styles.cta}>
          <p className={styles.eyebrow}>SOME DAYS DESERVE A DATE STAMP.</p>
          <h2>
            Make today a <em>keepsake.</em>
          </h2>
          <Link href="/" className={styles.button}>
            Give your photo a date <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
          <p>Just a photo, a date, and a little nostalgia.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
