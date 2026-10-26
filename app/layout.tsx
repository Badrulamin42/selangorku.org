import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rumah Selangorku 2026 | Projek, Syarat & Cara Mohon",
  description:
    "Semak projek Rumah Selangorku terkini, syarat kelayakan, panduan permohonan dan anggaran DSR dengan mudah.",
  metadataBase: new URL("https://selangorku.org"),
  openGraph: {
    title: "Rumah Selangorku 2026",
    description: "Cari rumah mampu milik pilihan anda di seluruh Selangor.",
    type: "website",
    locale: "ms_MY",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  );
}
