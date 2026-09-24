"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "code";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();

      if (!res.ok) {
        // Explicit warning for emails that are not pre-seeded / whitelisted.
        setError(body.error || "Unable to send login code.");
        setLoading(false);
        return;
      }

      setInfo(body.message);
      if (body.devCode) {
        setCode(body.devCode);
        setInfo(`${body.message} (dev mode — code pre-filled: ${body.devCode})`);
      }
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error || "Invalid code.");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={handleVerifyOtp} noValidate>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {info && <div className="alert alert-success" role="status">{info}</div>}
        <div className="form-field">
          <label htmlFor="code">Enter the 6-digit code sent to {email}</label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Verifying..." : "Verify & sign in"}
        </button>{" "}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setStep("email");
            setError(null);
            setInfo(null);
          }}
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} noValidate>
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}
      <div className="form-field">
        <label htmlFor="email">Admin email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="form-note">
          Only pre-approved admin email addresses can sign in. A one-time code will be emailed to
          you.
        </p>
      </div>
      <button type="submit" className="btn" disabled={loading}>
        {loading ? "Sending code..." : "Send login code"}
      </button>
    </form>
  );
}
