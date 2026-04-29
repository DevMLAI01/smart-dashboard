"use client";

import { useState, FormEvent } from "react";
import { Mail, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@vercel/analytics";
import { getOrCreateUid } from "@/lib/uid";

interface EmailGateProps {
  queuedFile: File;
  onSuccess: (dashboardId: string) => void;
  onClose: () => void;
}

type GateStatus = "idle" | "submitting" | "uploading" | "error";

export function EmailGate({ queuedFile, onSuccess, onClose }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<GateStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");

    const userId = getOrCreateUid();

    const regRes = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email: email.trim() }),
    });

    if (!regRes.ok) {
      const data = await regRes.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Registration failed. Please try again.");
      setStatus("error");
      return;
    }

    track("email_registered");

    setStatus("uploading");

    const form = new FormData();
    form.append("file", queuedFile);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      headers: { "X-Smart-UID": userId },
      body: form,
    });

    if (!uploadRes.ok) {
      const data = await uploadRes.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Upload failed. Please try again.");
      setStatus("error");
      return;
    }

    const { id } = await uploadRes.json() as { id: string };
    track("upload_after_unlock");
    onSuccess(id);
  }

  const isDisabled = status === "submitting" || status === "uploading";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            You&apos;ve used your 3 free uploads
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Enter your email to unlock unlimited uploads — no credit card, no payment ever.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-gate-input" className="sr-only">
              Email address
            </label>
            <Input
              id="email-gate-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isDisabled}
              className="h-11 text-base"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full h-11 gap-2" disabled={isDisabled}>
            <Mail className="w-4 h-4" />
            {status === "submitting"
              ? "Unlocking..."
              : status === "uploading"
              ? "Uploading your file..."
              : "Unlock Unlimited Uploads"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          No spam. We&apos;ll only send dashboard tips and product updates. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
