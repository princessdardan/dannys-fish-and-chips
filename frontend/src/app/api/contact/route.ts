import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const CONTACT_SUCCESS_MESSAGE = "Thanks — your message has been sent.";
const CONTACT_VALIDATION_MESSAGE = "Please check the form and try again.";
const CONTACT_FAILURE_MESSAGE =
  "We could not send your message right now. Please try again later.";
const RATE_LIMIT_MESSAGE = "Too many attempts. Please try again later.";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  subject: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(10),
  source: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

type ApiResponse =
  | { ok: true; message: string }
  | { ok: false; message: string; errors?: unknown };

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const CONTACT_RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimitByIp = new Map<string, RateLimitEntry>();

function jsonResponse(body: ApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  return (
    forwardedFor?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitByIp.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= CONTACT_RATE_LIMIT) {
    return true;
  }

  current.count += 1;
  return false;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "'":
        return "&#39;";
      case '"':
        return "&quot;";
      default:
        return character;
    }
  });
}

function buildEmailHtml(values: z.infer<typeof contactSchema>): string {
  const rows = [
    ["Name", values.name],
    ["Email", values.email],
    ["Subject", values.subject],
    ["Phone", values.phone],
    ["Source", values.source],
  ].filter(([, value]) => value);

  return `
    <h2>New contact form submission</h2>
    <dl>
      ${rows
        .map(
          ([label, value]) =>
            `<dt><strong>${escapeHtml(label ?? "")}</strong></dt><dd>${escapeHtml(
              value ?? ""
            )}</dd>`
        )
        .join("")}
    </dl>
    <h3>Message</h3>
    <p>${escapeHtml(values.message).replace(/\n/g, "<br />")}</p>
  `;
}

function buildEmailText(values: z.infer<typeof contactSchema>): string {
  return [
    "New contact form submission",
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.subject ? `Subject: ${values.subject}` : undefined,
    values.phone ? `Phone: ${values.phone}` : undefined,
    values.source ? `Source: ${values.source}` : undefined,
    "",
    "Message:",
    values.message,
  ]
    .filter(Boolean)
    .join("\n");
}

function isMissingProductionConfig(): boolean {
  return (
    !process.env.RESEND_API_KEY ||
    !process.env.RESEND_CONTACT_TO_EMAIL ||
    !process.env.RESEND_FROM_EMAIL
  );
}

/**
 * Determine whether missing Resend config should be treated as fatal.
 * Fatal on actual Vercel production deployments only.
 * Preview (VERCEL_ENV=preview) and local dev dry-run silently.
 */
function isActualProductionDeployment(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production")
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, message: CONTACT_VALIDATION_MESSAGE },
      400
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        message: CONTACT_VALIDATION_MESSAGE,
        errors: z.flattenError(parsed.error).fieldErrors,
      },
      400
    );
  }

  if (parsed.data.website) {
    return jsonResponse({ ok: true, message: CONTACT_SUCCESS_MESSAGE }, 200);
  }

  if (isRateLimited(getClientIp(request))) {
    return jsonResponse({ ok: false, message: RATE_LIMIT_MESSAGE }, 429);
  }

  if (isMissingProductionConfig()) {
    if (isActualProductionDeployment()) {
      console.error("Contact form Resend configuration is missing.");
      return jsonResponse({ ok: false, message: CONTACT_FAILURE_MESSAGE }, 500);
    }

    console.info("Contact form Resend dry-run: missing local configuration.");
    return jsonResponse({ ok: true, message: CONTACT_SUCCESS_MESSAGE }, 200);
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;
    const resendContactToEmail = process.env.RESEND_CONTACT_TO_EMAIL;

    if (!resendApiKey || !resendFromEmail || !resendContactToEmail) {
      return jsonResponse({ ok: false, message: CONTACT_FAILURE_MESSAGE }, 500);
    }

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: resendFromEmail,
      to: resendContactToEmail,
      replyTo: parsed.data.email,
      subject: parsed.data.subject || "New contact form submission",
      html: buildEmailHtml(parsed.data),
      text: buildEmailText(parsed.data),
    });

    if (error) {
      console.error("Contact form Resend send failed.", error);
      return jsonResponse({ ok: false, message: CONTACT_FAILURE_MESSAGE }, 500);
    }

    return jsonResponse({ ok: true, message: CONTACT_SUCCESS_MESSAGE }, 200);
  } catch (error) {
    console.error("Contact form unexpected send failure.", error);
    return jsonResponse({ ok: false, message: CONTACT_FAILURE_MESSAGE }, 500);
  }
}
