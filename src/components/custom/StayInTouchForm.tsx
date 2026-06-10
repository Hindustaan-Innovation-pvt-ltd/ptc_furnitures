"use client";

import { type FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { sendGAEvent } from "@next/third-parties/google";

type FormState = "idle" | "loading" | "success" | "error" | "duplicate";

export default function StayInTouchForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setState("loading");
    setErrorMsg("");

    try {
      if (trimmed) {
        sendGAEvent("event", "newsletter_subscribe", {
          subscriber_email: trimmed,
        });
      }

      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setState("duplicate");
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }

      setState("success");
      setEmail("");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="mx-auto mt-2 flex w-full max-w-xl items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-emerald-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="text-sm font-semibold">
          You're subscribed! We'll keep you in the loop.
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-2 w-full max-w-xl space-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
      >
        <Input
          id="newsletter-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "idle") {
              setState("idle");
              setErrorMsg("");
            }
          }}
          required
          disabled={state === "loading"}
          className="w-full rounded-full border-stone-600 bg-white/5 px-4 py-4 dark:text-white placeholder:text-gray-500 disabled:opacity-60"
        />

        <Button
          id="newsletter-submit"
          size="lg"
          type="submit"
          disabled={state === "loading"}
          className="w-full rounded-full px-8 sm:w-auto bg-red-800 hover:bg-red-600 dark:bg-red-600/80 dark:hover:bg-red-500 text-white disabled:opacity-60"
        >
          {state === "loading" ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="size-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Subscribing…
            </span>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>

      {/* Inline feedback messages */}
      {state === "duplicate" && (
        <p className="text-center text-xs text-amber-400">
          This email is already subscribed. Thanks for your enthusiasm! 🎉
        </p>
      )}
      {state === "error" && (
        <p className="text-center text-xs text-rose-400">{errorMsg}</p>
      )}
    </div>
  );
}
