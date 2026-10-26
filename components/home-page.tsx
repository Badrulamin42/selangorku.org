"use client";

import Image from "next/image";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Handshake,
  Home,
  KeyRound,
  Landmark,
  MapPin,
  Menu,
  Ruler,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { projects, type Project } from "@/lib/projects";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Senarai Projek", href: "#SENARAI" },
  { label: "Syarat Kelayakan", href: "#SYARAT" },
  { label: "Cara Mohon", href: "#MOHON" },
  { label: "Semak Status", href: "#SEMAK" },
];

const benefits = [
  { icon: CircleDollarSign, title: "Harga bersubsidi", text: "Rumah berkualiti dengan harga yang lebih mampu dimiliki." },
  { icon: MapPin, title: "Lokasi strategik", text: "Projek berhampiran akses utama dan kemudahan harian." },
  { icon: BadgeCheck, title: "Kualiti terjamin", text: "Dibangunkan oleh pemaju bertauliah mengikut standard ditetapkan." },
  { icon: ShieldCheck, title: "Perlindungan HDA", text: "Projek perumahan berada di bawah perlindungan undang-undang HDA." },
];

const steps = [
  [Search, "Semak kelayakan", "Pastikan syarat asas dan kelayakan pinjaman perumahan dipenuhi."],
  [FileText, "Daftar nama & dokumen", "Daftar dengan pemaju dan lengkapkan maklumat penting projek."],
  [ClipboardCheck, "Isi borang permohonan", "Lengkapkan borang manual dan permohonan dalam talian LPHS."],
  [Building2, "Lawat galeri pemaju", "Buat temu janji untuk penerangan projek dan pilihan unit."],
  [Landmark, "Mohon pembiayaan", "Permohonan pinjaman diuruskan melalui panel bank pemaju."],
  [Home, "Pilih unit kediaman", "Pilih unit yang dipersetujui apabila pembiayaan diluluskan."],
  [Handshake, "Surat tawaran & S&P", "Terima surat tawaran LPHS dan tandatangani perjanjian jual beli."],
  [KeyRound, "Serah kunci", "Terima kunci rumah idaman selepas projek siap dibina."],
];

const faqs = [
  ["Adakah bujang boleh mohon?", "Ya, pemohon bujang berumur 18 tahun dan ke atas layak memohon."],
  ["Bagaimana ingin semak permohonan?", "Jika permohonan dibuat kurang dua tahun, semakan boleh dibuat melalui portal rasmi pendaftaran LPHS. Akaun yang tidak aktif lebih dua tahun mungkin perlu didaftarkan semula."],
  ["Saya bukan orang Selangor. Masih layak mohon?", "Ya. Permohonan Rumah Selangorku terbuka kepada rakyat Malaysia tertakluk kepada syarat projek."],
  ["Saya tinggal atau bekerja di Selangor kurang dua tahun. Layakkah saya?", "Ya, anda masih boleh memohon. Hubungi pemaju projek untuk panduan dan syarat khusus."],
  ["Apa itu kuota pemaju?", "Kuota pemaju ialah permohonan yang didaftarkan terus bersama pemaju, merangkumi proses dalam talian dan fizikal."],
  ["Apakah dokumen yang diperlukan?", "Antaranya borang permohonan, kad pengenalan, slip gaji, dokumen perkahwinan atau surat sumpah, penyata KWSP serta laporan CCRIS pemohon dan pasangan."],
];

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "section-heading center" : "section-heading"}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function StatusBadge({ status }: Pick<Project, "status">) {
  const kind = status === "Habis Dijual" ? "sold" : status === "Unit Terhad" ? "limited" : "active";
  const variant = status === "Unit Terhad" ? "warning" : status === "Habis Dijual" ? "outline" : "secondary";
  return <Badge variant={variant} className={`status ${kind}`}>{status}</Badge>;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Reveal delay={(index % 4) * 0.035}>
      <Card className="project-card">
      <a href={project.href} aria-label={`Lihat projek ${project.name}`}>
        <div className="project-image">
          <Image src={project.image} alt={project.name} width={800} height={450} unoptimized loading={index === 0 ? "eager" : "lazy"} />
          <StatusBadge status={project.status} />
        </div>
        <CardContent className="project-body">
          <div className="project-labels">
            <div className="location"><MapPin size={15} /> <span>{project.location}</span></div>
            <span className="project-type">{project.type}</span>
          </div>
          <h3>{project.name}</h3>
          <div className="project-meta">
            <span><Ruler size={16} />{project.size}</span>
            <span><BedDouble size={16} />{project.rooms} bilik</span>
            <span><Bath size={16} />{project.baths} tandas</span>
          </div>
          <div className="project-footer">
            <div><small>Harga dari</small><strong>{project.price}</strong></div>
            <span className="circle-link"><ArrowRight size={18} /></span>
          </div>
        </CardContent>
      </a>
      </Card>
    </Reveal>
  );
}

function CalculatorForm() {
  const [income, setIncome] = useState("");
  const [commitments, setCommitments] = useState("");
  const [price, setPrice] = useState("250000");
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submittedDsr, setSubmittedDsr] = useState<number | null>(null);

  const dsr = useMemo(() => {
    const monthlyIncome = Number(income.replace(/,/g, ""));
    const monthlyCommitments = Number(commitments.replace(/,/g, ""));
    const propertyPrice = Number(price.replace(/,/g, ""));
    if (!monthlyIncome || monthlyIncome <= 0) return 0;
    return ((propertyPrice / 200 + monthlyCommitments) / monthlyIncome) * 100;
  }, [income, commitments, price]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    setSubmittedDsr(null);
    const form = new FormData(event.currentTarget);
    form.set("numeric_field_6", dsr.toFixed(2));
    try {
      const response = await fetch("/api/fluentform", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Permohonan tidak dapat dihantar.");
      setSubmittedDsr(dsr);
      setState("success");
      setMessage(data.message || "Maklumat anda berjaya dihantar. Pihak pemaju akan menghubungi anda.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Ralat sambungan. Sila cuba lagi.");
    }
  }

  const isEligible = submittedDsr !== null && submittedDsr > 0 && submittedDsr <= 70;

  return (
    <form
      className="calculator-form"
      onSubmit={submit}
      onChange={() => {
        if (state === "success" || state === "error") {
          setSubmittedDsr(null);
          setState("idle");
          setMessage("");
        }
      }}
    >
      <div className="form-heading">
        <span className="icon-tile"><Calculator size={23} /></span>
        <div><span>Semakan percuma</span><h3>Kalkulator kelayakan DSR</h3></div>
      </div>
      <fieldset className="form-grid" disabled={state === "sending"}>
        <Label className="full">Nama<Input name="Nama[first_name]" placeholder="Nama anda" required /></Label>
        <Label>No. telefon<Input name="phone" type="tel" inputMode="tel" placeholder="0123456789" required /></Label>
        <Label>Lokasi pilihan<Input name="input_text" placeholder="Contoh: Shah Alam" required /></Label>
        <Label>Jumlah pendapatan keluarga (RM)<Input name="numeric_field" inputMode="numeric" placeholder="Contoh: 6500" value={income} onChange={(event) => setIncome(event.target.value)} required /></Label>
        <Label>Komitmen bulanan (RM)<Input name="numeric_field_2" inputMode="numeric" placeholder="Contoh: 1200" value={commitments} onChange={(event) => setCommitments(event.target.value)} required /></Label>
        <Label className="full">Harga rumah bakal dibeli (RM)<Input name="numeric_field_5" inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} required /></Label>
      </fieldset>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <Button className="form-submit" size="lg" type="submit" disabled={state === "sending" || state === "success"}>
        {state === "sending" ? "Sedang menghantar…" : state === "success" ? "Maklumat dihantar" : "Semakan lebih terperinci"}
        {state === "success" ? <Check size={18} /> : <ArrowRight size={18} />}
      </Button>
      {state === "success" && submittedDsr !== null && (
        <div className={`dsr-result ${isEligible ? "eligible" : "not-eligible"}`} role="status" aria-live="polite">
          <div><span>Anggaran DSR anda</span><strong>{`${submittedDsr.toFixed(1)}%`}</strong></div>
          <p>{isEligible ? "Anggaran anda berada dalam julat layak (70% ke bawah)." : "Anggaran melebihi 70%. Semakan lanjut disyorkan."}</p>
        </div>
      )}
      {message && <p className={`form-message ${state}`}>{message}</p>}
      <p className="form-note">* Anggaran kasar sahaja. Penghantaran menggunakan borang dan API asal Selangorku.</p>
    </form>
  );
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("Semua");
  const [showAll, setShowAll] = useState(false);

  const filtered = projects.filter((project) => {
    if (filter === "Semua") return project.status !== "Habis Dijual";
    if (filter === "Habis Dijual") return project.status === "Habis Dijual";
    return project.status === filter;
  });
  const visibleProjects = showAll ? filtered : filtered.slice(0, 12);

  return (
    <main>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="Rumah Selangorku — laman utama">
            <span className="brand-mark"><Image src="/rumah-selangorku-logo.png" alt="" width={44} height={44} priority /></span>
            <span><strong>Rumah</strong> Selangorku<small>Panduan perumahan pilihan anda</small></span>
          </a>
          <nav className="desktop-nav" aria-label="Navigasi utama">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <a className={cn(buttonVariants({ size: "sm" }), "header-cta")} href="#KALKULATOR">Semak kelayakan <ArrowRight size={16} /></a>
          <button className="mobile-menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Buka menu" aria-expanded={menuOpen}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Navigasi mudah alih">
            {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            <a href="#KALKULATOR" onClick={() => setMenuOpen(false)}>Semak kelayakan</a>
          </nav>
        )}
      </header>

      <section className="hero" id="top">
        <div className="hero-pattern" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> Permohonan projek 2026 kini dibuka</div>
            <h1>Rumah idaman lebih dekat daripada yang anda sangka.</h1>
            <p>Temui projek Rumah Selangorku terkini, semak kelayakan dan fahami proses permohonan—semuanya di satu tempat.</p>
            <div className="hero-actions">
              <a className={buttonVariants({ size: "lg" })} href="#SENARAI">Terokai projek <ArrowRight size={18} /></a>
              <a className="text-link" href="#MOHON">Lihat cara memohon <span>↘</span></a>
            </div>
            <div className="hero-trust">
              <div className="avatar-stack"><span>RS</span><span>LP</span><span>+1k</span></div>
              <p><strong>Panduan lengkap pembeli</strong><br />Untuk keluarga di seluruh Selangor</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrap">
              <Image src="https://selangorku.org/wp-content/uploads/2026/04/residensi_akasia_facade-scaled.webp" alt="Projek Rumah Selangorku moden" width={1600} height={900} unoptimized priority />
            </div>
            <div className="hero-price-card"><span>Harga projek dari</span><strong>RM230k</strong><small>Lokasi seluruh Selangor</small></div>
            <div className="hero-available-card"><span className="pulse" /><div><strong>Projek tersedia</strong><small>Dikemas kini untuk 2026</small></div></div>
            <div className="hero-caption"><span>01</span><div><strong>Kediaman mampu milik</strong><small>Ruang selesa untuk keluarga anda</small></div></div>
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="container benefits-grid">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return <Reveal key={benefit.title} className="benefit-card" delay={index * 0.06}><span><Icon size={23} /></span><h3>{benefit.title}</h3><p>{benefit.text}</p></Reveal>;
          })}
        </div>
      </section>

      <section className="projects-section" id="SENARAI">
        <div className="container">
          <Reveal className="projects-intro">
            <SectionHeading eyebrow="Pilihan terkini" title="Cari rumah yang terasa tepat untuk anda" text="Bandingkan lokasi, keluasan dan harga projek pilihan di seluruh Selangor." />
            <div className="project-count"><strong>{filtered.length}</strong><span>projek<br />dipaparkan</span></div>
          </Reveal>
          <div className="filter-row" role="group" aria-label="Tapis status projek">
            {["Semua", "Dalam Jualan", "Unit Terhad", "Siap 2026", "Habis Dijual"].map((item) => (
              <Button key={item} size="sm" variant={filter === item ? "default" : "ghost"} onClick={() => { setFilter(item); setShowAll(false); }} className={filter === item ? "active" : ""}>{item}</Button>
            ))}
          </div>
          <div className="projects-grid">
            {visibleProjects.map((project, index) => <ProjectCard key={project.name} project={project} index={index} />)}
          </div>
          {filtered.length > 12 && <Button variant="outline" className="load-more" onClick={() => setShowAll((value) => !value)}>{showAll ? "Paparkan lebih sedikit" : `Lihat semua ${filtered.length} projek`}<ChevronDown className={showAll ? "rotate" : ""} size={18} /></Button>}
        </div>
      </section>

      <section className="eligibility-section" id="SYARAT">
        <div className="container eligibility-grid">
          <Reveal className="eligibility-copy">
            <SectionHeading eyebrow="Syarat kelayakan umum" title="Mungkin anda sudah layak—semak empat syarat asas" text="Kelayakan akhir tertakluk kepada jenis rumah dan penilaian projek yang dipilih." />
            <a className="text-link dark" href="https://selangorku.org/syarat-rumah-selangorku/">Lihat syarat kuota pemaju <ArrowRight size={17} /></a>
          </Reveal>
          <div className="eligibility-list">
            {[
              ["01", "Warganegara Malaysia", "Pemohon dan pasangan berumur 18 tahun ke atas. Pemohon bujang juga layak."],
              ["02", "Hubungan dengan Selangor", "Bekerja, menetap atau bermastautin di negeri Selangor tertakluk terma projek."],
              ["03", "Pendapatan isi rumah", "Jumlah pendapatan isi rumah tidak melebihi RM14,500 sebulan."],
              ["04", "Pemilikan kediaman", "Pemohon dan pasangan belum atau hanya memiliki sebuah rumah di Selangor."],
            ].map(([number, title, text], index) => <Reveal className="eligibility-item" key={number} delay={index * 0.06}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div><Check size={20} /></Reveal>)}
          </div>
        </div>
      </section>

      <section className="package-section">
        <div className="container package-grid">
          <Reveal className="package-image">
            <Image src="https://selangorku.org/wp-content/uploads/2025/08/5-2-e1755330381694.webp" alt="Pakej perabot untuk Rumah Selangorku" width={1200} height={675} unoptimized />
          </Reveal>
          <Reveal className="package-copy" delay={0.08}>
            <SectionHeading eyebrow="Pakej rumah terpilih" title="Pakej istimewa lengkap berperabot" text="Terdapat beberapa pemaju yang menawarkan perabot dalam pakej jualan mereka, terutama bagi Rumah Selangorku jenis E yang memenuhi syarat garis panduan." />
            <p className="package-intro">Antara kelengkapan yang ditawarkan adalah seperti berikut:</p>
            <div className="package-columns">
              <ul>{["Penyaman udara", "Pemanas air", "Set kabinet dapur", "Peti ais"].map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul>
              <ul>{["Mesin basuh", "Set rak televisyen", "Televisyen", "Almari pakaian pasang siap"].map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul>
            </div>
            <p className="fine-print">Kelengkapan sebenar tertakluk kepada pakej pemaju dan projek yang dipilih.</p>
          </Reveal>
        </div>
      </section>

      <section className="steps-section" id="MOHON">
        <div className="container">
          <Reveal><SectionHeading eyebrow="Cara memohon" title="Dari semakan hingga serah kunci" text="Lapan langkah mudah untuk membantu anda memahami keseluruhan perjalanan permohonan." center /></Reveal>
          <div className="steps-grid">
            {steps.map(([icon, title, text], index) => {
              const Icon = icon as typeof Search;
              return <Reveal key={title as string} className="step-card" delay={(index % 4) * 0.05}><div className="step-top"><span><Icon size={22} /></span><small>{String(index + 1).padStart(2, "0")}</small></div><h3>{title as string}</h3><p>{text as string}</p></Reveal>;
            })}
          </div>
          <div className="steps-cta"><a className="button primary" href="#KALKULATOR">Mulakan semakan kelayakan <ArrowRight size={18} /></a></div>
        </div>
      </section>

      <section className="status-section" id="SEMAK">
        <div className="container status-grid">
          <Reveal className="status-copy">
            <SectionHeading eyebrow="Semak permohonan" title="Fahami status permohonan anda" text="Selepas mendaftar di portal RSKU LPHS, semak status untuk mengetahui langkah seterusnya." />
            <ol>
              <li><span>1</span>Layari portal rasmi LPHS.</li>
              <li><span>2</span>Masukkan nombor MyKad dan butiran diminta.</li>
              <li><span>3</span>Pilih “Semak Permohonan” untuk status terkini.</li>
            </ol>
            <a className="button light" href="https://ehartanah.lphs.gov.my/public/login">Buka portal LPHS <ArrowRight size={18} /></a>
          </Reveal>
          <Reveal className="status-board" delay={0.1}>
            {[
              ["Draf", "Permohonan belum lengkap. Semak maklumat dan dokumen wajib."],
              ["Senarai menunggu", "Dalam proses pra-tawar, tertakluk kepada kriteria dan kekosongan."],
              ["Penawaran", "Hubungi pemaju untuk melampirkan dokumen permohonan fizikal."],
              ["Akaun dibekukan", "Permohonan semula boleh dibuat selepas tempoh sekatan berakhir."],
            ].map(([title, text], index) => <div className="status-row" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}
          </Reveal>
        </div>
      </section>

      <section className="calculator-section" id="KALKULATOR">
        <div className="container calculator-grid">
          <Reveal className="calculator-copy">
            <span className="eyebrow">Kira sebelum memohon</span>
            <h2>Adakah pinjaman rumah anda dalam julat yang sihat?</h2>
            <p>Debt Service Ratio (DSR) membandingkan komitmen bulanan dengan pendapatan isi rumah. Ia memberi gambaran awal tentang kemampuan pembiayaan.</p>
            <div className="dsr-guide">
              <div><strong>≤ 70%</strong><span>Anggaran layak</span></div>
              <div><strong>&gt; 70%</strong><span>Perlu semakan lanjut</span></div>
            </div>
            <div className="privacy-note"><ShieldCheck size={20} /><p><strong>Data dihantar dengan selamat</strong><br />Menggunakan saluran borang asal laman Selangorku.</p></div>
          </Reveal>
          <Reveal delay={0.1}><CalculatorForm /></Reveal>
        </div>
      </section>

      <section className="faq-section">
        <div className="container faq-grid">
          <Reveal className="faq-intro">
            <SectionHeading eyebrow="Soalan lazim" title="Jawapan ringkas, langkah lebih jelas" text="Masih ada pertanyaan? Rujuk jawapan kepada persoalan paling kerap ditanya." />
            <a className="text-link dark" href="https://selangorku.org/soalan-lazim-rumah-selangorku/">Lihat lebih banyak soalan <ArrowRight size={17} /></a>
          </Reveal>
          <Reveal className="faq-list">
            <Accordion type="single" collapsible>
              {faqs.map(([question, answer], index) => (
                <AccordionItem key={question} value={`item-${index}`}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent>{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="container footer-top">
          <div className="footer-brand"><div className="brand light-brand"><span className="brand-mark"><Image src="/rumah-selangorku-logo.png" alt="" width={44} height={44} /></span><span><strong>Rumah</strong> Selangorku<small>Panduan perumahan pilihan anda</small></span></div><p>Memudahkan pencarian rumah mampu milik untuk rakyat Malaysia.</p></div>
          <div><h3>Pautan pantas</h3>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
          <div><h3>Portal rasmi</h3><a href="https://lphs.gov.my/">Laman LPHS</a><a href="https://ehartanah.lphs.gov.my/public/login">Log masuk eHartanah</a><a href="https://ms.wikipedia.org/wiki/Selangor">Mengenai Selangor</a></div>
          <div className="footer-cta"><h3>Belum pasti kelayakan?</h3><p>Gunakan kalkulator percuma untuk anggaran awal.</p><a className="button light" href="#KALKULATOR">Kira DSR anda <ArrowRight size={17} /></a></div>
        </div>
        <div className="container footer-bottom"><p>Agensi Marketing Projek Rumah Selangorku by RSKU Property Solution © 2026 Hakcipta Terpelihara.</p><p>Bukan Portal Rasmi LPSH</p></div>
      </footer>
    </main>
  );
}
