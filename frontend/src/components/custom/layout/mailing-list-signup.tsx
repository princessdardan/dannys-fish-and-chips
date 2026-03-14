"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/data/data-api";
import { getStrapiURL } from "@/lib/utils";
import type {
  TEmailSubscriber,
  TEmailSubscriberPayload,
  TMailingListFormState,
} from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IMailingListSignupProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  source?: string;
  className?: string;
}

/**
 * Mailing list signup form with basic validation and Strapi submission.
 *
 * Data flow: collects email, posts to `/api/email-subscribers`,
 * and renders success/error states.
 * Side effects: network POST to Strapi and local component state updates.
 */
export function MailingListSignup({
  heading = "Join Our Mailing List",
  description = "Subscribe to receive updates about specials, events, and news.",
  buttonText = "Subscribe",
  successMessage = "Thank you for subscribing!",
  source = "website",
  className,
}: IMailingListSignupProps) {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<TMailingListFormState>({
    status: "idle",
    message: "",
  });

  function validateEmail(emailValue: string): {
    valid: boolean;
    message: string;
  } {
    if (!emailValue.trim()) {
      return { valid: false, message: "Please enter your email address." };
    }
    if (!EMAIL_REGEX.test(emailValue)) {
      return { valid: false, message: "Please enter a valid email address." };
    }
    return { valid: true, message: "" };
  }

  function handleStrapiError(
    error:
      | {
          status: number;
          name: string;
          message: string;
          details?: Record<string, string[]>;
        }
      | undefined
  ): string {
    if (!error) return "An unexpected error occurred.";

    if (error.status === 400 && error.message?.includes("unique")) {
      return "This email is already subscribed to our mailing list.";
    }

    if (error.details?.email) {
      return "Please enter a valid email address.";
    }

    return error.message || "An error occurred. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validation = validateEmail(email);
    if (!validation.valid) {
      setFormState({ status: "error", message: validation.message });
      return;
    }

    setFormState({ status: "loading", message: "" });

    try {
      const url = getStrapiURL("/api/email-subscribers");
      const payload: TEmailSubscriberPayload = {
        data: {
          email: email.trim().toLowerCase(),
          subscribedAt: new Date().toISOString(),
          source,
        },
      };

      const response = await api.post<TEmailSubscriber, TEmailSubscriberPayload>(
        url,
        payload
      );

      if (response.success) {
        setFormState({ status: "success", message: successMessage });
        setEmail("");
      } else {
        const errorMessage = handleStrapiError(response.error);
        setFormState({ status: "error", message: errorMessage });
      }
    } catch {
      setFormState({
        status: "error",
        message: "Something went wrong. Please try again later.",
      });
    }
  }

  const isLoading = formState.status === "loading";
  const isSuccess = formState.status === "success";
  const isError = formState.status === "error";

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {heading && (
        <h3 className="text-xl font-bold text-brand-red mb-2 font-serif">
          {heading}
        </h3>
      )}
      {description && (
        <p className="text-secondary-text mb-4 text-sm">{description}</p>
      )}

      {isSuccess ? (
        <div className="p-4 bg-green-600 border border-green-500 rounded-md">
          <p className="text-white text-sm font-medium">
            {formState.message}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="mailing-list-email" className="sr-only">
              Email address
            </label>
            <input
              id="mailing-list-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input flex-1 w-full"
              disabled={isLoading}
              aria-describedby={isError ? "email-error" : undefined}
              aria-invalid={isError}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-alt-background text-heading-text hover:bg-alt-background/80 px-3 py-2 text-sm w-full sm:w-auto h-11 md:h-9"
            >
              {isLoading ? "..." : buttonText}
            </Button>
          </div>

          {isError && (
            <p id="email-error" className="text-red-600 text-sm" role="alert">
              {formState.message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
