import { NextRequest, NextResponse } from "next/server";

const SOURCE_PAGE = "https://selangorku.org/";
const SUBMIT_ENDPOINT = "https://selangorku.org/wp-admin/admin-ajax.php";
const FORM_ID = "4";
const POST_ID = "1087";
const UPSTREAM_TIMEOUT_MS = 12_000;

type FluentResponse = {
  success?: boolean;
  message?: string;
  data?: {
    message?: string;
    result?: string | { message?: string };
  };
};

class ProxyError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details?: string,
  ) {
    super(message);
    this.name = "ProxyError";
  }
}

const windows = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const current = windows.get(ip);
  if (!current || now > current.resetAt) {
    windows.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

function required(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeAttribute(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function hiddenValue(html: string, name: string) {
  const escapedName = escapeRegExp(name);
  const match = html.match(
    new RegExp(`name=["']${escapedName}["'][^>]*value=["']([^"']*)["']`, "i"),
  );
  return match ? decodeAttribute(match[1]) : "";
}

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function fluentMessage(result: FluentResponse) {
  const nested = result.data?.result;
  const nestedMessage = typeof nested === "string" ? nested : nested?.message;
  return cleanMessage(nestedMessage || result.data?.message || result.message);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ success: false, message: "Terlalu banyak percubaan. Sila cuba lagi sebentar." }, { status: 429 });
  }

  try {
    const incoming = await request.formData();
    if (required(incoming, "website")) {
      return NextResponse.json({ success: true, message: "Maklumat diterima." });
    }

    const name = required(incoming, "Nama[first_name]");
    const phone = required(incoming, "phone");
    const location = required(incoming, "input_text");
    const income = required(incoming, "numeric_field").replace(/,/g, "");
    const commitments = required(incoming, "numeric_field_2").replace(/,/g, "");
    const price = required(incoming, "numeric_field_5").replace(/,/g, "");
    const dsr = required(incoming, "numeric_field_6");

    if (!name || !phone || !location || !income || !commitments || !price) {
      return NextResponse.json({ success: false, message: "Sila lengkapkan semua maklumat wajib." }, { status: 400 });
    }
    if (!/^\+?[0-9\s-]{8,16}$/.test(phone)) {
      return NextResponse.json({ success: false, message: "Sila masukkan nombor telefon yang sah." }, { status: 400 });
    }
    if ([income, commitments, price].some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) {
      return NextResponse.json({ success: false, message: "Nilai kewangan yang dimasukkan tidak sah." }, { status: 400 });
    }

    const sourceResponse = await fetch(SOURCE_PAGE, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; SelangorkuUI/1.0)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!sourceResponse.ok) {
      throw new ProxyError(
        "Borang asal tidak dapat dicapai. Sila cuba lagi sebentar.",
        502,
        "SOURCE_PAGE_UNAVAILABLE",
        `HTTP ${sourceResponse.status}`,
      );
    }
    const html = await sourceResponse.text();
    const nonce = hiddenValue(html, `_fluentform_${FORM_ID}_fluentformnonce`);
    const embeddedPostId = hiddenValue(html, "__fluent_form_embded_post_id") || POST_ID;
    const referer = hiddenValue(html, "_wp_http_referer") || "/";
    if (!nonce) {
      throw new ProxyError(
        "Borang asal telah berubah dan token keselamatan tidak dapat dibaca.",
        503,
        "NONCE_NOT_FOUND",
      );
    }

    // Fluent Forms expects the form fields as a serialized string inside `data`.
    const serializedForm = new URLSearchParams({
      __fluent_form_embded_post_id: embeddedPostId,
      [`_fluentform_${FORM_ID}_fluentformnonce`]: nonce,
      _wp_http_referer: referer,
      "Nama[first_name]": name,
      phone,
      input_text: location,
      numeric_field: income,
      numeric_field_2: commitments,
      numeric_field_5: price,
      numeric_field_6: dsr,
    });

    const body = new URLSearchParams({
      action: "fluentform_submit",
      form_id: FORM_ID,
      data: serializedForm.toString(),
    });

    const upstream = await fetch(`${SUBMIT_ENDPOINT}?t=${Date.now()}`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: "https://selangorku.org",
        Referer: SOURCE_PAGE,
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (compatible; SelangorkuUI/1.0)",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const raw = await upstream.text();
    let result: FluentResponse;
    try {
      result = JSON.parse(raw) as FluentResponse;
    } catch {
      throw new ProxyError(
        "Borang asal memberikan respons yang tidak sah. Sila cuba lagi.",
        502,
        "INVALID_UPSTREAM_RESPONSE",
        `HTTP ${upstream.status}; content-type ${upstream.headers.get("content-type") || "unknown"}`,
      );
    }

    if (!upstream.ok || result.success !== true || !result.data?.result) {
      throw new ProxyError(
        fluentMessage(result) || "Borang asal menolak permohonan. Sila semak maklumat dan cuba lagi.",
        upstream.ok ? 422 : 502,
        upstream.ok ? "FORM_REJECTED" : "UPSTREAM_HTTP_ERROR",
        `HTTP ${upstream.status}`,
      );
    }

    return NextResponse.json({
      success: true,
      message: fluentMessage(result) || "Maklumat anda berjaya dihantar.",
    });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    const proxyError = error instanceof ProxyError
      ? error
      : new ProxyError(
          isTimeout ? "Sambungan ke borang asal mengambil masa terlalu lama. Sila cuba lagi." : "Ralat sambungan ke borang asal. Sila cuba lagi.",
          isTimeout ? 504 : 502,
          isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_CONNECTION_ERROR",
          error instanceof Error ? error.message : undefined,
        );

    console.error(`[fluentform-proxy] ${proxyError.code}`, proxyError.details || "");
    return NextResponse.json(
      { success: false, message: proxyError.message, code: proxyError.code },
      { status: proxyError.status },
    );
  }
}
