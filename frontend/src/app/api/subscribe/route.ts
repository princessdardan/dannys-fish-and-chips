import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const SUBSCRIBE_SUCCESS_MESSAGE = "Thanks — you’re subscribed.";
const SUBSCRIBE_VALIDATION_MESSAGE = "Please enter a valid email address.";
const SUBSCRIBE_FAILURE_MESSAGE =
  "We could not subscribe you right now. Please try again later.";
const RATE_LIMIT_MESSAGE = "Too many attempts. Please try again later.";

const subscribeSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().optional(),
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

const SUBSCRIBE_RATE_LIMIT = 10;
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

  if (current.count >= SUBSCRIBE_RATE_LIMIT) {
    return true;
  }

  current.count += 1;
  return false;
}

function splitName(name: string | undefined): {
  firstName?: string;
  lastName?: string;
} {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function isMissingProductionConfig(): boolean {
  return !process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID;
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

function isDuplicateContactError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";
  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : undefined;
  const mentionsExistingContact =
    (message.includes("contact") ||
      message.includes("email") ||
      message.includes("subscriber")) &&
    (message.includes("already") ||
      message.includes("duplicate") ||
      message.includes("exists"));

  return statusCode === 409 || mentionsExistingContact;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, message: SUBSCRIBE_VALIDATION_MESSAGE },
      400
    );
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        message: SUBSCRIBE_VALIDATION_MESSAGE,
        errors: z.flattenError(parsed.error).fieldErrors,
      },
      400
    );
  }

  if (parsed.data.website) {
    return jsonResponse({ ok: true, message: SUBSCRIBE_SUCCESS_MESSAGE }, 200);
  }

  if (isRateLimited(getClientIp(request))) {
    return jsonResponse({ ok: false, message: RATE_LIMIT_MESSAGE }, 429);
  }

  if (isMissingProductionConfig()) {
    if (isActualProductionDeployment()) {
      console.error("Subscribe form Resend configuration is missing.");
      return jsonResponse({ ok: false, message: SUBSCRIBE_FAILURE_MESSAGE }, 500);
    }

    console.info("Subscribe form Resend dry-run: missing local configuration.");
    return jsonResponse({ ok: true, message: SUBSCRIBE_SUCCESS_MESSAGE }, 200);
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendAudienceId = process.env.RESEND_AUDIENCE_ID;

    if (!resendApiKey || !resendAudienceId) {
      return jsonResponse({ ok: false, message: SUBSCRIBE_FAILURE_MESSAGE }, 500);
    }

    const resend = new Resend(resendApiKey);
    const { firstName, lastName } = splitName(parsed.data.name);
    const { error } = await resend.contacts.create({
      email: parsed.data.email,
      firstName,
      lastName,
      audienceId: resendAudienceId,
      unsubscribed: false,
    });

    if (error && !isDuplicateContactError(error)) {
      console.error("Subscribe form Resend contact create failed.", error);
      return jsonResponse({ ok: false, message: SUBSCRIBE_FAILURE_MESSAGE }, 500);
    }

    return jsonResponse({ ok: true, message: SUBSCRIBE_SUCCESS_MESSAGE }, 200);
  } catch (error) {
    if (isDuplicateContactError(error)) {
      return jsonResponse({ ok: true, message: SUBSCRIBE_SUCCESS_MESSAGE }, 200);
    }

    console.error("Subscribe form unexpected contact create failure.", error);
    return jsonResponse({ ok: false, message: SUBSCRIBE_FAILURE_MESSAGE }, 500);
  }
}
