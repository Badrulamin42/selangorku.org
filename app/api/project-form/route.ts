import { NextRequest, NextResponse } from "next/server";
import { getProjectSourceContent } from "@/lib/project-content";
import { findProject } from "@/lib/projects";

const ENDPOINT = "https://selangorku.org/wp-admin/admin-ajax.php";
const TIMEOUT_MS = 12_000;
const windows = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  const current = windows.get(ip);
  if (!current || now > current.resetAt) {
    windows.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

function hiddenValue(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`name=["']${escaped}["'][^>]*value=["']([^"']*)["']`, "i"));
  return match?.[1]?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'") || "";
}

function responseMessage(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function error(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return error("Terlalu banyak percubaan. Sila cuba lagi sebentar.", 429);

  try {
    const incoming = await request.formData();
    if (incoming.get("website")) return NextResponse.json({ success: true, message: "Maklumat diterima." });

    const slug = incoming.get("slug");
    if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) return error("Projek tidak sah.", 400);
    const project = findProject(slug);
    const schema = getProjectSourceContent(slug)?.form;
    if (!project || !schema || project.status === "Habis Dijual") return error("Borang pendaftaran projek ini tidak tersedia.", 404);

    const fields = new URLSearchParams();
    for (const field of schema.fields) {
      const raw = incoming.getAll(field.name);
      const values = raw.filter((value): value is string => typeof value === "string").map((value) => value.trim());
      const conditional = (field.name === "Jumlah_Rumah" && incoming.get("Pemilikan_Rumah") !== "Ya")
        || (field.name === "Tarikh_appointment" && incoming.get("Minat_ke_gallery") !== "Ya");
      if (conditional) continue;
      if (field.required && !values.some(Boolean)) return error(`Sila lengkapkan medan ${field.label}.`, 400);
      if (values.some((value) => value.length > 200)) return error(`Medan ${field.label} terlalu panjang.`, 400);
      if ((field.type === "radio" || field.type === "checkbox") && values.some((value) => !field.options.includes(value))) {
        return error(`Pilihan ${field.label} tidak sah.`, 400);
      }
      if (field.type === "tel" && values[0] && !/^\+?[0-9\s-]{8,16}$/.test(values[0])) return error("Sila masukkan nombor telefon yang sah.", 400);
      if (field.type === "number" && values[0] && (!Number.isFinite(Number(values[0])) || Number(values[0]) < 0)) {
        return error(`Nilai ${field.label} tidak sah.`, 400);
      }
      for (let value of values.filter(Boolean)) {
        if (field.name === "Tarikh_appointment") {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return error("Tarikh lawatan tidak sah.", 400);
          const [year, month, day] = value.split("-");
          value = `${day}/${month}/${year}`;
        }
        fields.append(field.name, value);
      }
    }

    const source = await fetch(project.href, {
      cache: "no-store",
      headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "Mozilla/5.0 (compatible; SelangorkuUI/1.0)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!source.ok) return error("Borang projek asal tidak dapat dicapai. Sila cuba lagi sebentar.", 502);
    const html = await source.text();
    const formMarker = html.search(new RegExp(`id=["']fluentform_${schema.id}["']`, "i"));
    const formStart = formMarker >= 0 ? html.lastIndexOf("<form", formMarker) : -1;
    const formEnd = formMarker >= 0 ? html.indexOf("</form>", formMarker) : -1;
    const formHtml = formStart >= 0 && formEnd > formStart ? html.slice(formStart, formEnd + 7) : "";
    const nonce = hiddenValue(formHtml, `_fluentform_${schema.id}_fluentformnonce`);
    if (!nonce) return error("Borang projek asal telah berubah. Sila cuba lagi kemudian.", 503);

    const data = new URLSearchParams({
      __fluent_form_embded_post_id: hiddenValue(formHtml, "__fluent_form_embded_post_id"),
      [`_fluentform_${schema.id}_fluentformnonce`]: nonce,
      _wp_http_referer: hiddenValue(formHtml, "_wp_http_referer") || new URL(project.href).pathname,
    });
    for (const [key, value] of fields) data.append(key, value);
    const body = new URLSearchParams({ action: "fluentform_submit", form_id: schema.id, data: data.toString() });
    const upstream = await fetch(`${ENDPOINT}?t=${Date.now()}`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: "https://selangorku.org",
        Referer: project.href,
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (compatible; SelangorkuUI/1.0)",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const raw = await upstream.text();
    let result: { success?: boolean; data?: { result?: string | { message?: string }; message?: string }; message?: string };
    try {
      result = JSON.parse(raw);
    } catch {
      return error("Borang asal memberikan respons yang tidak sah. Sila cuba lagi.", 502);
    }
    const nested = result.data?.result;
    const message = responseMessage(typeof nested === "string" ? nested : nested?.message || result.data?.message || result.message);
    if (!upstream.ok || result.success !== true || !result.data?.result) return error(message || "Borang asal menolak pendaftaran. Sila semak maklumat anda.", upstream.ok ? 422 : 502);
    return NextResponse.json({ success: true, message: message || "Pendaftaran anda berjaya dihantar." });
  } catch (cause) {
    const timedOut = cause instanceof Error && (cause.name === "TimeoutError" || cause.name === "AbortError");
    console.error("[project-form-proxy]", cause);
    return error(timedOut ? "Sambungan ke borang asal mengambil masa terlalu lama." : "Ralat sambungan ke borang asal. Sila cuba lagi.", timedOut ? 504 : 502);
  }
}
