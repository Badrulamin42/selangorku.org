"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Calculator, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CalculatorForm({ initialLocation = "", initialPrice = "250000" }: { initialLocation?: string; initialPrice?: string }) {
  const [income, setIncome] = useState("");
  const [commitments, setCommitments] = useState("");
  const [price, setPrice] = useState(initialPrice);
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
        <Label>Lokasi pilihan<Input name="input_text" placeholder="Contoh: Shah Alam" defaultValue={initialLocation} required /></Label>
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
