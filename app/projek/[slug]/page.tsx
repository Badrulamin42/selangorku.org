import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Bath, BedDouble, Check, ChevronRight, MapPin, Ruler } from "lucide-react";
import { CalculatorForm } from "@/components/calculator-form";
import { ProjectGallery, ProjectGalleryTrigger, type ProjectGallerySlide } from "@/components/project-gallery";
import { ProjectRegistrationForm } from "@/components/project-registration-form";
import { getProjectSourceContent } from "@/lib/project-content";
import imageSizes from "@/lib/project-image-sizes.json";
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

  const source = getProjectSourceContent(projectSlug(project));
  const sourceSections = (source?.sections || []).filter((section) =>
    section.title !== "Ringkasan projek" || section.items.length > 0,
  );
  const categoryLabels = {
    overview: "Konsep",
    location: "Lokasi & akses",
    layout: "Pelan & susun atur",
    amenities: "Kemudahan",
    eligibility: "Kelayakan",
    package: "Pakej",
  };
  const categories = [...new Set(sourceSections.map((section) => section.category))];
  const seenCategories = new Set<string>();
  const sourceSectionsWithIds = sourceSections.map((section, index) => {
    const id = seenCategories.has(section.category) ? `detail-${section.category}-${index}` : `detail-${section.category}`;
    seenCategories.add(section.category);
    return { ...section, id };
  });
  const isSold = project.status === "Habis Dijual";
  const registrationForm = !isSold ? source?.form : null;
  const mainAction = isSold ? "/#SENARAI" : registrationForm ? "#daftar-minat" : "#semak-kelayakan";
  const mainActionLabel = isSold ? "Lihat projek tersedia" : registrationForm ? "Daftar minat" : "Semak kelayakan";
  const initialPrice = project.price.replace(/[^\d]/g, "") || "250000";
  const related = projects
    .filter((item) => item !== project && item.status !== "Habis Dijual")
    .sort((a, b) => Number(b.type === project.type) - Number(a.type === project.type))
    .slice(0, 3);
  const sourceImageSizes = imageSizes as Record<string, { width: number; height: number }>;
  const fullSizeHero = project.image.replace(/-300x\d+(?=\.[^.]+$)/, "");
  const mediumSizeHero = project.image.replace(/-300x\d+(?=\.[^.]+$)/, "-1024x576");
  const heroImage = [fullSizeHero, mediumSizeHero].find((image) => sourceImageSizes[image]) || project.image;
  const galleryImages = [...new Set([
    heroImage,
    ...sourceSectionsWithIds.flatMap((section) => section.images),
    ...(source?.gallery || []),
  ])];
  const gallerySlides: ProjectGallerySlide[] = galleryImages.map((src, index) => ({
    src,
    alt: `${project.name} — gambar ${index + 1}`,
    ...(sourceImageSizes[src] || { width: 1600, height: 900 }),
  }));

  return (
    <ProjectGallery slides={gallerySlides}>
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
          <Link className="button primary detail-header-cta" href={mainAction}>
            {mainActionLabel}<ArrowRight size={16} />
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
          <p className="detail-intro">{sourceSections.find((section) => section.category === "overview" && section.title !== "Ringkasan projek")?.title || `${project.type} di ${project.location} dengan ${project.rooms} bilik dan ${project.baths} bilik air.`}</p>
          <div className="detail-price"><span>Harga yang dipaparkan</span><strong>{project.price}</strong></div>
          <div className="detail-hero-actions">
            <Link className="button primary" href={mainAction}>{mainActionLabel}<ArrowRight size={17} /></Link>
            <Link className="detail-back-link" href="/#SENARAI"><ArrowLeft size={16} /> Kembali ke senarai</Link>
          </div>
        </div>
        <ProjectGalleryTrigger src={heroImage} alt={project.name} className="detail-hero-image">
          <Image src={heroImage} alt={`Gambar projek ${project.name}`} fill sizes="(max-width: 860px) 100vw, 56vw" unoptimized priority />
          <span className="detail-image-caption">{project.name} · {project.location}</span>
        </ProjectGalleryTrigger>
      </section>

      <section className="detail-summary container" aria-label="Ringkasan unit">
        <div><Ruler size={20} /><span>Keluasan / saiz</span><strong>{project.size}</strong></div>
        <div><BedDouble size={20} /><span>Bilik tidur</span><strong>{project.rooms}</strong></div>
        <div><Bath size={20} /><span>Bilik air</span><strong>{project.baths}</strong></div>
        <div><MapPin size={20} /><span>Jenis kediaman</span><strong>{project.type}</strong></div>
      </section>

      {categories.length > 0 && <nav className="detail-section-nav container" aria-label="Kandungan projek">
        <span>Dalam halaman ini</span>
        {categories.map((category) => <a key={category} href={`#detail-${category}`}>{categoryLabels[category]}</a>)}
        {registrationForm && <a href="#daftar-minat">Pendaftaran</a>}
      </nav>}

      <section className="detail-main container" aria-labelledby="detail-heading">
        <div className="detail-main-content">
          <span className="eyebrow">Maklumat daripada halaman projek asal</span>
          <h2 id="detail-heading">Kenali projek ini</h2>
          <p className="detail-section-copy">Butiran pembangunan, lokasi, pelan dan kemudahan di bawah diringkaskan daripada halaman projek asal. Harga, status unit dan syarat khusus boleh berubah.</p>
          {source && source.facts.length > 0 && <dl className="detail-facts">
            {source.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>}
          {sourceSectionsWithIds.length > 0 ? <div className="source-sections">
            {sourceSectionsWithIds.map((section) => <section className={`source-section source-${section.category}`} id={section.id} key={section.id}>
              <span className="eyebrow">{categoryLabels[section.category]}</span>
              <h3>{section.title}</h3>
              <div className={`source-section-body ${section.images.length ? "has-image" : ""} ${section.items.length ? "" : "image-only"}`}>
                {section.items.length > 0 && <ul>{section.items.map((item) => <li key={item}><Check size={16} /><span>{item}</span></li>)}</ul>}
                {section.images.length > 0 && <div className={`source-section-images ${section.category === "layout" ? "is-plan" : ""}`}>
                  {section.images.slice(0, section.category === "layout" ? 2 : 1).map((image, imageIndex) => <ProjectGalleryTrigger src={image} alt={`${section.title} — ${project.name}`} className="source-section-image" key={image}>
                    <Image src={image} alt={`${section.title} — ${project.name}, gambar ${imageIndex + 1}`} fill sizes="(max-width: 860px) 100vw, 40vw" unoptimized loading="lazy" />
                  </ProjectGalleryTrigger>)}
                </div>}
              </div>
            </section>)}
          </div> : <p className="detail-section-copy">Halaman asal projek ini memaparkan gambar dan ringkasan asas sahaja. Gunakan butiran harga, saiz dan lokasi di atas untuk perbandingan.</p>}
          <Link className="detail-guide-link" href="/#MOHON">Lihat panduan cara memohon <ArrowRight size={16} /></Link>
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
          <Link className="button primary" href={mainAction}>{mainActionLabel}<ArrowRight size={17} /></Link>
          <small>{isSold ? "Projek ini disenaraikan sebagai habis dijual." : "Semakan DSR ialah anggaran awal, bukan keputusan pembiayaan."}</small>
        </aside>
      </section>

      {registrationForm && <section className="detail-registration" id="daftar-minat">
        <div className="container detail-registration-grid">
          <div>
            <span className="eyebrow">Pendaftaran projek</span>
            <h2>Daftar untuk {project.name}</h2>
            <p>Lengkapkan borang pendaftaran projek yang sama seperti pada halaman asal. Maklumat anda dihantar terus ke sistem borang Selangorku.</p>
            <Link href="#semak-kelayakan">Semak anggaran DSR dahulu <ArrowRight size={16} /></Link>
          </div>
          <ProjectRegistrationForm slug={projectSlug(project)} schema={registrationForm} />
        </div>
      </section>}

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
    </ProjectGallery>
  );
}
