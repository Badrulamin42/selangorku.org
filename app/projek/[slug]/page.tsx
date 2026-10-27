import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Bath, BedDouble, Check, ChevronRight, MapPin, Ruler } from "lucide-react";
import { CalculatorForm } from "@/components/calculator-form";
import { findProject, projectPath, projectSlug, projects, type Project } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: projectSlug(project) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = findProject((await params).slug);
  if (!project) return { title: "Projek tidak ditemui" };
  const description = `${project.name} di ${project.location}. ${project.type}, ${project.size}, ${project.rooms} bilik, ${project.baths} tandas. Harga ${project.price}.`;
  return {
    title: `${project.name} | Rumah Selangorku`,
    description,
    alternates: { canonical: projectPath(project) },
    openGraph: { title: project.name, description, images: [{ url: project.image, alt: project.name }] },
  };
}

function DetailStatus({ status }: { status: Project["status"] }) {
  const sold = status === "Habis Dijual";
  return <span className={`detail-status ${sold ? "is-sold" : ""}`}><span />{status}</span>;
}

export default async function ProjectPage({ params }: Props) {
  const project = findProject((await params).slug);
  if (!project) notFound();

  const isSold = project.status === "Habis Dijual";
  const initialPrice = project.price.replace(/[^\d]/g, "") || "250000";
  const related = projects
    .filter((item) => item !== project && item.status !== "Habis Dijual")
    .sort((a, b) => Number(b.type === project.type) - Number(a.type === project.type))
    .slice(0, 3);

  const facts = [
    { label: "Jenis kediaman", value: project.type },
    { label: "Keluasan / saiz", value: project.size },
    { label: "Bilik tidur", value: project.rooms },
    { label: "Bilik air", value: project.baths },
    { label: "Lokasi", value: project.location },
    { label: "Status", value: project.status },
  ];

  return (
    <main className="detail-page">
      <header className="site-header detail-header">
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label="Rumah Selangorku — laman utama">
            <span className="brand-mark"><Image src="/rumah-selangorku-logo.png" alt="" width={44} height={44} priority /></span>
            <span><strong>Rumah</strong> Selangorku<small>Panduan perumahan pilihan anda</small></span>
          </Link>
          <nav className="detail-header-nav" aria-label="Navigasi utama">
            <Link href="/#SENARAI">Senarai projek</Link>
            <Link href="/#SYARAT">Syarat kelayakan</Link>
            <Link href="/#MOHON">Cara mohon</Link>
          </nav>
          <Link className="button primary detail-header-cta" href={isSold ? "/#SENARAI" : "#semak-kelayakan"}>
            {isSold ? "Lihat projek lain" : "Semak kelayakan"}<ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <div className="container detail-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Laman utama</Link><ChevronRight size={15} /><Link href="/#SENARAI">Senarai projek</Link><ChevronRight size={15} /><span aria-current="page">{project.name}</span>
      </div>

      <section className="detail-hero container" aria-labelledby="project-title">
        <div className="detail-hero-copy">
          <div className="detail-overline"><DetailStatus status={project.status} /><span>{project.type}</span></div>
          <h1 id="project-title">{project.name}</h1>
          <p className="detail-location"><MapPin size={19} />{project.location}</p>
          <p className="detail-intro">Lihat maklumat utama projek ini dalam satu paparan. Bandingkan harga, keluasan dan susun atur sebelum membuat semakan kelayakan.</p>
          <div className="detail-price"><span>Harga yang dipaparkan</span><strong>{project.price}</strong></div>
          <div className="detail-hero-actions">
            <Link className="button primary" href={isSold ? "/#SENARAI" : "#semak-kelayakan"}>{isSold ? "Terokai projek tersedia" : "Semak kelayakan"}<ArrowRight size={17} /></Link>
            <Link className="detail-back-link" href="/#SENARAI"><ArrowLeft size={16} /> Kembali ke senarai</Link>
          </div>
        </div>
        <div className="detail-hero-image">
          <Image src={project.image} alt={`Gambar projek ${project.name}`} fill sizes="(max-width: 860px) 100vw, 56vw" unoptimized priority />
          <span className="detail-image-caption">{project.name} · {project.location}</span>
        </div>
      </section>

      <section className="detail-summary container" aria-label="Ringkasan unit">
        <div><Ruler size={20} /><span>Keluasan / saiz</span><strong>{project.size}</strong></div>
        <div><BedDouble size={20} /><span>Bilik tidur</span><strong>{project.rooms}</strong></div>
        <div><Bath size={20} /><span>Bilik air</span><strong>{project.baths}</strong></div>
        <div><MapPin size={20} /><span>Jenis kediaman</span><strong>{project.type}</strong></div>
      </section>

      <section className="detail-main container" aria-labelledby="detail-heading">
        <div className="detail-main-content">
          <span className="eyebrow">Maklumat projek</span>
          <h2 id="detail-heading">Butiran yang perlu diketahui</h2>
          <p className="detail-section-copy">Maklumat di bawah merangkumkan butiran projek yang tersedia dalam senarai kami. Harga, status unit dan syarat khusus boleh berubah; semak semula sebelum meneruskan permohonan.</p>
          <dl className="detail-facts">
            {facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>
          <div className="detail-process">
            <h3>Langkah seterusnya</h3>
            <ol>
              <li><span>01</span><div><strong>Semak kesesuaian projek</strong><p>Pastikan lokasi, jenis kediaman, keluasan dan anggaran harga sesuai dengan keperluan anda.</p></div></li>
              <li><span>02</span><div><strong>Semak kelayakan kewangan</strong><p>Gunakan kalkulator DSR untuk gambaran awal kemampuan pembiayaan.</p></div></li>
              <li><span>03</span><div><strong>Sediakan dokumen permohonan</strong><p>Rujuk panduan permohonan dan syarat kelayakan sebelum menghubungi pihak yang mengurus projek.</p></div></li>
            </ol>
            <Link href="/#MOHON">Lihat panduan permohonan <ArrowRight size={16} /></Link>
          </div>
        </div>
        <aside className="detail-aside" aria-label="Ringkasan harga dan tindakan">
          <span className="detail-aside-label">Ringkasan projek</span>
          <h3>{project.name}</h3>
          <p><MapPin size={16} />{project.location}</p>
          <div className="detail-aside-price"><span>Harga yang dipaparkan</span><strong>{project.price}</strong></div>
          <ul>
            <li><Check size={16} />{project.type}</li>
            <li><Check size={16} />{project.size}</li>
            <li><Check size={16} />{project.rooms} bilik · {project.baths} bilik air</li>
          </ul>
          <Link className="button primary" href={isSold ? "/#SENARAI" : "#semak-kelayakan"}>{isSold ? "Lihat projek tersedia" : "Semak kelayakan"}<ArrowRight size={17} /></Link>
          <small>{isSold ? "Projek ini disenaraikan sebagai habis dijual." : "Semakan DSR ialah anggaran awal, bukan keputusan pembiayaan."}</small>
        </aside>
      </section>

      {!isSold && <section className="detail-eligibility" id="semak-kelayakan">
        <div className="container detail-eligibility-grid">
          <div>
            <span className="eyebrow">Sebelum memohon</span>
            <h2>Semak anggaran kemampuan anda</h2>
            <p>Harga dan lokasi projek telah diisi untuk memudahkan semakan. Anggaran DSR akan dipaparkan selepas borang berjaya dihantar.</p>
            <Link href="/#SYARAT">Baca syarat kelayakan umum <ArrowRight size={16} /></Link>
          </div>
          <CalculatorForm initialLocation={`${project.name}, ${project.location}`} initialPrice={initialPrice} />
        </div>
      </section>}

      <section className="detail-related container" aria-labelledby="related-heading">
        <div className="detail-related-title"><div><span className="eyebrow">Teruskan pencarian</span><h2 id="related-heading">Projek lain untuk diterokai</h2></div><Link href="/#SENARAI">Lihat semua projek <ArrowRight size={16} /></Link></div>
        <div className="detail-related-grid">
          {related.map((item) => <Link key={projectSlug(item)} href={projectPath(item)} className="detail-related-card">
            <div className="detail-related-image"><Image src={item.image} alt={item.name} fill sizes="(max-width: 650px) 100vw, 33vw" unoptimized /></div>
            <div><span>{item.location} · {item.type}</span><h3>{item.name}</h3><p><strong>{item.price}</strong><ArrowRight size={18} /></p></div>
          </Link>)}
        </div>
      </section>

      <footer className="detail-footer"><div className="container"><span>© {new Date().getFullYear()} Rumah Selangorku</span><Link href="/">Laman utama</Link><Link href="/#SENARAI">Senarai projek</Link></div></footer>
    </main>
  );
}
