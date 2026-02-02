"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/data/data-api";
import { getStrapiURL } from "@/lib/utils";
import type {
  TContactSubmission,
  TContactSubmissionPayload,
  TContactFormState,
} from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IContactFormProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  source?: string;
  className?: string;
}

/**
 * Contact form with validation and Strapi submission.
 *
 * Data flow: collects name, email, subject, message, posts to `/api/contact-submissions`,
 * and renders success/error states.
 * Side effects: network POST to Strapi and local component state updates.
 */
export function ContactForm({
  heading = "Get in Touch",
  description = "Have a question or comment? We'd love to hear from you. Fill out the form below and we'll get back to you within 24-48 hours.",
  buttonText = "Send Message",
  successMessage = "Thank you for contacting us! We'll get back to you within 24-48 hours.",
  source = "contact-page",
  className,
}: IContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<TContactFormState>({
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

  function validateForm(): { valid: boolean; message: string } {
    if (!name.trim()) {
      return { valid: false, message: "Please enter your name." };
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return emailValidation;
    }

    if (!message.trim()) {
      return { valid: false, message: "Please enter a message." };
    }

    if (message.trim().length < 10) {
      return {
        valid: false,
        message: "Message must be at least 10 characters long.",
      };
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

    if (error.details?.email) {
      return "Please enter a valid email address.";
    }

    if (error.details?.name) {
      return "Please enter your name.";
    }

    if (error.details?.message) {
      return "Please enter a message.";
    }

    return error.message || "An error occurred. Please try again.";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      setFormState({ status: "error", message: validation.message });
      return;
    }

    setFormState({ status: "loading", message: "" });

    try {
      const url = getStrapiURL("/api/contact-submissions");
      const payload: TContactSubmissionPayload = {
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim() || undefined,
          message: message.trim(),
          submittedAt: new Date().toISOString(),
          source,
        },
      };

      const response = await api.post<
        TContactSubmission,
        TContactSubmissionPayload
      >(url, payload);

      if (response.success) {
        setFormState({ status: "success", message: successMessage });
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
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
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {heading && (
        <h2 className="text-3xl font-bold text-brand-red mb-3 font-serif">
          {heading}
        </h2>
      )}
      {description && (
        <p className="text-secondary-text mb-6">{description}</p>
      )}

      {isSuccess ? (
        <div className="p-6 bg-green-600 border border-green-500 rounded-md">
          <p className="text-white font-medium">{formState.message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-heading-text mb-1.5"
              >
                Name <span className="text-red-600">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="form-input w-full"
                disabled={isLoading}
                aria-describedby={isError ? "form-error" : undefined}
                aria-invalid={isError}
                required
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-heading-text mb-1.5"
              >
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="form-input w-full"
                disabled={isLoading}
                aria-describedby={isError ? "form-error" : undefined}
                aria-invalid={isError}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-subject"
              className="block text-sm font-medium text-heading-text mb-1.5"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="How can we help you?"
              className="form-input w-full"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-heading-text mb-1.5"
            >
              Message <span className="text-red-600">*</span>
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help..."
              rows={6}
              className="form-textarea w-full"
              disabled={isLoading}
              aria-describedby={isError ? "form-error" : undefined}
              aria-invalid={isError}
              required
            />
          </div>

          {isError && (
            <p id="form-error" className="text-red-600 text-sm" role="alert">
              {formState.message}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-red text-white hover:bg-brand-red/90 px-6 py-2"
            >
              {isLoading ? "Sending..." : buttonText}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
