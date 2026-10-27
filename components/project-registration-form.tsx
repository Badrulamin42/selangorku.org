"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectSourceContent } from "@/lib/project-content";

type RegistrationForm = NonNullable<ProjectSourceContent["form"]>;

export function ProjectRegistrationForm({ slug, schema }: { slug: string; schema: RegistrationForm }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);
    form.set("slug", slug);
    const missingCheckbox = schema.fields.find((field) => field.type === "checkbox" && field.required && !form.getAll(field.name).length);
    if (missingCheckbox) {
      setState("error");
      setMessage(`Sila pilih sekurang-kurangnya satu pilihan untuk ${missingCheckbox.label}.`);
      return;
    }
    try {
      const response = await fetch("/api/project-form", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Pendaftaran tidak dapat dihantar.");
      setState("success");
      setMessage(data.message || "Pendaftaran anda telah dihantar.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Ralat sambungan. Sila cuba lagi.");
    }
  }

  return (
    <form className="project-registration-form" onSubmit={submit}>
      <div className="project-registration-heading"><span>01 / Pendaftaran projek</span><h3>Daftar minat anda</h3><p>Borang ini mengikut medan pendaftaran projek pada laman asal.</p></div>
      <fieldset disabled={state === "sending" || state === "success"}>
        {schema.fields.map((field) => {
          if (field.name === "Jumlah_Rumah" && answers.Pemilikan_Rumah !== "Ya") return null;
          if (field.name === "Tarikh_appointment" && answers.Minat_ke_gallery !== "Ya") return null;
          const required = field.required && field.name !== "Daftar_LHDN";
          if (field.type === "radio" || field.type === "checkbox") {
            return <div className="project-registration-field" key={field.name}>
              <span className="project-registration-label">{field.label}{required && <em aria-hidden="true"> *</em>}</span>
              <div className="project-registration-options">
                {field.options.map((option) => <label className="project-registration-option" key={option}>
                  <input
                    type={field.type}
                    name={field.name}
                    value={option}
                    required={required && field.type === "radio"}
                    onChange={field.type === "radio" ? () => setAnswers((current) => ({ ...current, [field.name]: option })) : undefined}
                  />
                  <span>{option}</span>
                </label>)}
              </div>
            </div>;
          }
          return <Label className="project-registration-field" key={field.name}>
            <span className="project-registration-label">{field.label}{required && <em aria-hidden="true"> *</em>}</span>
            <Input
              name={field.name}
              type={field.name === "Tarikh_appointment" ? "date" : field.type}
              inputMode={field.type === "tel" ? "tel" : field.type === "number" ? "decimal" : undefined}
              min={field.type === "number" ? "0" : undefined}
              step={field.type === "number" ? "any" : undefined}
              required={required}
            />
          </Label>;
        })}
      </fieldset>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <Button type="submit" size="lg" disabled={state === "sending" || state === "success"}>
        {state === "sending" ? "Sedang menghantar…" : state === "success" ? "Pendaftaran dihantar" : "Hantar pendaftaran"}
        {state === "success" ? <Check size={18} /> : <ArrowRight size={18} />}
      </Button>
      {message && <p className={`form-message ${state}`} role="status" aria-live="polite">{message}</p>}
      <p className="form-note">Maklumat dihantar melalui borang dan API projek asal Selangorku.</p>
    </form>
  );
}
