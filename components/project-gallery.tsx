"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

export type ProjectGallerySlide = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const GalleryContext = createContext<((src: string) => void) | null>(null);

export function ProjectGallery({ slides, children }: { slides: ProjectGallerySlide[]; children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function openImage(src: string) {
    const index = slides.findIndex((slide) => slide.src === src);
    if (index >= 0) setActiveIndex(index);
  }

  return <GalleryContext.Provider value={openImage}>
    {children}
    <Lightbox
      className="project-lightbox"
      open={activeIndex !== null}
      close={() => setActiveIndex(null)}
      index={activeIndex ?? 0}
      on={{ view: ({ index }) => setActiveIndex(index) }}
      slides={slides}
      plugins={[Zoom, Fullscreen, Counter]}
      zoom={{ scrollToZoom: true, maxZoomPixelRatio: 4 }}
      carousel={{ imageFit: "contain" }}
      labels={{
        Previous: "Gambar sebelumnya",
        Next: "Gambar seterusnya",
        Close: "Tutup galeri",
        Lightbox: "Galeri gambar projek",
        "Zoom in": "Zum masuk",
        "Zoom out": "Zum keluar",
        "Enter Fullscreen": "Skrin penuh",
        "Exit Fullscreen": "Keluar skrin penuh",
      }}
    />
  </GalleryContext.Provider>;
}

export function ProjectGalleryTrigger({
  src, alt, className, children,
}: {
  src: string;
  alt: string;
  className: string;
  children: ReactNode;
}) {
  const openImage = useContext(GalleryContext);

  return <button
    type="button"
    className={`${className} project-gallery-trigger`}
    aria-label={`Lihat gambar skrin penuh: ${alt}`}
    onClick={() => openImage?.(src)}
  >
    {children}
    <span className="project-gallery-badge" aria-hidden="true"><Maximize2 size={17} /></span>
  </button>;
}
