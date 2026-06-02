"use client";

import React, { useState } from "react";
import Navigation from "@/components/custom/Navigation";
import Footer from "@/components/custom/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ShieldCheck, Truck, Percent, Sparkles, Building2 } from "lucide-react";

export default function DealersPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    leadId?: string;
    error?: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitResult({ success: true, leadId: data.lead.id });
        setFormData({
          name: "",
          phone: "",
          city: "",
          email: "",
        });
      } else {
        setSubmitResult({ success: false, error: data.error || "Failed to submit partnership request." });
      }
    } catch (err) {
      setSubmitResult({ success: false, error: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navigation />

      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <header className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold tracking-wider uppercase mb-5">
          <Sparkles className="size-3.5" />
          Partner Showroom Program
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight">
          Become an Authorized <span className="text-red-700 dark:text-red-500">Dealer</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
          Unlock wholesale catalog pricing, custom showroom credits, priority fabrication, and co-marketing benefits. Partner with PTC Furnitures to inspire considered spaces.
        </p>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Column: Benefits Cards */}
          <section className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              Exclusive Partnership Benefits
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join a distinguished network of trade professionals and showrooms curated for exceptional hospitality and residential interior designs.
            </p>

            <div className="grid gap-4.5">
              {/* Benefit 1 */}
              <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#111318]/70 shadow-xs hover:border-red-500/20 dark:hover:border-red-500/25 transition duration-300">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <Percent className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Trade Pricing & Multi-Tier Discounts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Access tier-1 trade pricing with volume scales up to 45% off retail lists, with tax exemption workflows.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#111318]/70 shadow-xs hover:border-red-500/20 dark:hover:border-red-500/25 transition duration-300">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">White-Glove Priority Freight</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Expedited fabrication processing with consolidated shipping routes and local logistics support.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#111318]/70 shadow-xs hover:border-red-500/20 dark:hover:border-red-500/25 transition duration-300">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Dedicated Project Consultations</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Custom upholstery specifications, CAD layouts, material swatches, and 3D modeling support.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-[#111318]/30">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Building2 className="size-4 text-red-600 dark:text-red-400" />
                Showroom Sample Program
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Qualify for up to 50% discount on showroom demonstration furniture collections to assist local retail presentation.
              </p>
            </div>
          </section>

          {/* Right Column: Simplified Form */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg shadow-slate-100 dark:border-white/5 dark:bg-[#0f1116] dark:shadow-none relative overflow-hidden">
              
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-600 to-red-500" />

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Partnership Inquiry Form
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Submit details below to initiate dealer approval. A partnership advisor will contact you within 24 hours.
              </p>

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">City *</Label>
                    <Input
                      id="city"
                      required
                      placeholder="e.g. Seattle"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>
                </div>

                {submitResult && !submitResult.success && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 text-xs font-semibold text-red-700 dark:text-red-400">
                    {submitResult.error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-sm tracking-wide shadow-md shadow-red-500/10 dark:from-red-700 dark:to-red-600 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting Inquiry..." : "Submit Partnership Application"}
                </Button>
              </form>

              {/* High-Fidelity Success Overlay */}
              {submitResult?.success && (
                <div className="absolute inset-0 bg-white/95 dark:bg-[#0f1116]/98 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-scale-up z-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                    <Check className="size-8 stroke-[3]" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                    Application Logged!
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-300 mt-3 select-all">
                    Reference ID: <span className="font-bold text-red-600 dark:text-red-400">{submitResult.leadId}</span>
                  </div>
                  <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
                    Thank you for applying to the PTC Furniture authorized dealer program. A regional distribution consultant has been assigned to your reference and will review your credentials soon.
                  </p>
                  <Button
                    onClick={() => setSubmitResult(null)}
                    variant="outline"
                    className="mt-8 rounded-xl px-6 cursor-pointer font-bold text-xs tracking-wider uppercase"
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
