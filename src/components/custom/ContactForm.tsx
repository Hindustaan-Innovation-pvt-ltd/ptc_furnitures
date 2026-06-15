"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    subject?: string;
    message?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (!formData.name.trim()) e.name = "Name is required.";
    if (!formData.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\+?[0-9\s\-()]{7,15}$/.test(formData.phone.trim())) {
      e.phone = "Enter a valid phone number.";
    }
    if (!formData.subject.trim()) e.subject = "Subject is required.";
    if (!formData.message.trim()) e.message = "Message is required.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ success: true });
        // Send Google Analytics event
        sendGAEvent("event", "contact_form_submit", {
          contact_name: formData.name.trim(),
          contact_subject: formData.subject.trim(),
        });
        setFormData({
          name: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus({
          success: false,
          error: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (_err) {
      setStatus({
        success: false,
        error: "An unexpected error occurred. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      {status?.success ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-up">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-md shadow-emerald-500/5">
            <CheckCircle2 className="size-8" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Thank you!
          </h3>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Your message has been successfully sent. Our team will review your
            inquiry and get back to you within 1-2 business days.
          </p>
          <Button
            onClick={() => setStatus(null)}
            variant="outline"
            className="mt-8 rounded-full px-6 font-bold text-xs tracking-wider uppercase cursor-pointer"
          >
            Send Another Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Your full name"
              className={`rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d] ${
                errors.name ? "border-red-400 focus:ring-red-400/20" : ""
              }`}
            />
            {errors.name && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.name}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="phone"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="Your phone number"
              className={`rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d] ${
                errors.phone ? "border-red-400 focus:ring-red-400/20" : ""
              }`}
            />
            {errors.phone && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="subject"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Subject
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => {
                setFormData({ ...formData, subject: e.target.value });
                setErrors((prev) => ({ ...prev, subject: undefined }));
              }}
              placeholder="Order question, partnership, press..."
              className={`rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d] ${
                errors.subject ? "border-red-400 focus:ring-red-400/20" : ""
              }`}
            />
            {errors.subject && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.subject}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="message"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Message
            </Label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                setErrors((prev) => ({ ...prev, message: undefined }));
              }}
              className={`w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#08090d] dark:text-slate-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition ${
                errors.message ? "border-red-400 focus:border-red-400" : ""
              }`}
              placeholder="Write your message here..."
            />
            {errors.message && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.message}
              </span>
            )}
          </div>

          {status && !status.success && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-xs font-semibold text-red-700 dark:text-red-400 animate-shake">
              <AlertCircle className="size-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 py-5 bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send message"
              )}
            </Button>
            <p className="text-xs text-slate-500 leading-normal text-center sm:text-left">
              We respect your privacy — your message will not be shared.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
