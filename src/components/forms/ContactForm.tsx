"use client";

import { useState, type FormEvent } from "react";
import { formatApiError } from "@/lib/format-api-error";

export type ContactServiceOption = {
  slug: string;
  title: string;
};

interface Props {
  defaultServiceSlug?: string;
  className?: string;
  services?: ContactServiceOption[];
  compact?: boolean;
}

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({
  defaultServiceSlug,
  className,
  services = [],
  compact = false,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedSlug = services.some((service) => service.slug === defaultServiceSlug)
    ? defaultServiceSlug
    : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const serviceSelect = form.elements.namedItem("serviceSlug");
    if (serviceSelect instanceof HTMLSelectElement && serviceSelect.value) {
      data.subject = serviceSelect.selectedOptions[0]?.textContent?.trim() ?? "";
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();

      if (!res.ok) {
        setErrorMessage(formatApiError(body));
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="alert alert-success" role="status">
        Thank you — your enquiry has been received. Our team will get back to you shortly.
      </div>
    );
  }

  return (
    <form className={className} onSubmit={handleSubmit} noValidate>
      {errorMessage && (
        <div className="alert alert-error" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Honeypot field — hidden from real users, bots often fill it in.
          Field name is deliberately unlike common autofill categories
          (not "website"/"url"/"company") so browser autofill won't target
          it; combined with off-screen positioning + tabIndex/aria-hidden. */}
      <div
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
        aria-hidden="true"
      >
        <label htmlFor="hp_confirm_no_fill">Leave this field empty</label>
        <input
          id="hp_confirm_no_fill"
          name="hp_confirm_no_fill"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="form-field">
        <label htmlFor="name">{compact ? "Name" : "Full name"}</label>
        <input id="name" name="name" type="text" required minLength={2} maxLength={120} />
      </div>

      <div className="form-field">
        <label htmlFor="email">{compact ? "Email" : "Email address"}</label>
        <input id="email" name="email" type="email" required />
      </div>

      <div className="form-field">
        <label htmlFor="phone">{compact ? "Phone" : "Phone (optional)"}</label>
        <input id="phone" name="phone" type="tel" />
      </div>

      <div className="form-field">
        <label htmlFor="serviceSlug">Service</label>
        <select id="serviceSlug" name="serviceSlug" defaultValue={selectedSlug}>
          <option value="">{compact ? "Select" : "Select a service"}</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="message">{compact ? "Message" : "How can we help?"}</label>
        <textarea id="message" name="message" required minLength={10} maxLength={5000} />
      </div>

      <button type="submit" className="btn" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send enquiry"}
      </button>
    </form>
  );
}
