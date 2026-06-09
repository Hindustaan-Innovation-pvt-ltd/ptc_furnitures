"use client";

import {
  Building2,
  Check,
  Percent,
  ShieldCheck,
  Sparkles,
  Truck,
  Globe,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Language = "en" | "hi";

const TRANSLATIONS = {
  en: {
    programTag: "Partner Showroom Program",
    titleStart: "Become an Authorized ",
    titleEnd: "Dealer",
    subtitle: "Unlock wholesale catalog pricing, custom showroom credits, priority fabrication, and co-marketing benefits. Partner with PTC Furnitures to inspire considered spaces.",
    benefitsHeading: "Exclusive Partnership Benefits",
    benefitsDesc: "Join a distinguished network of trade professionals and showrooms curated for exceptional hospitality and residential interior designs.",
    benefit1Title: "Trade Pricing & Multi-Tier Discounts",
    benefit1Desc: "Access tier-1 trade pricing with volume scales up to 45% off retail lists, with tax exemption workflows.",
    benefit2Title: "White-Glove Priority Freight",
    benefit2Desc: "Expedited fabrication processing with consolidated shipping routes and local logistics support.",
    benefit3Title: "Dedicated Project Consultations",
    benefit3Desc: "Custom upholstery specifications, CAD layouts, material swatches, and 3D modeling support.",
    showroomTitle: "Showroom Sample Program",
    showroomDesc: "Qualify for up to 50% discount on showroom demonstration furniture collections to assist local retail presentation.",
    formHeading: "Partnership Inquiry Form",
    formDesc: "Submit details below to initiate dealer approval. A partnership advisor will contact you within 24 hours.",
    labelName: "Full Name *",
    labelPhone: "Phone Number *",
    labelCity: "City *",
    labelEmail: "Email Address (Optional)",
    placeholderName: "e.g. Rahul Kumar",
    placeholderPhone: "e.g. +91 99999 99999",
    placeholderCity: "e.g. Mumbai",
    placeholderEmail: "e.g. someone@example.com",
    btnSubmit: "Submit Partnership Application",
    btnSubmitting: "Submitting Inquiry...",
    successTitle: "Application Logged!",
    successRef: "Reference ID: ",
    successDesc: "Thank you for applying to the PTC Furniture authorized dealer program. A regional distribution consultant has been assigned to your reference and will review your credentials soon.",
    successEmailNotify: "A notification email has been dispatched to our sales team.",
    successReset: "Send Another Inquiry"
  },
  hi: {
    programTag: "पार्टनर शोरूम कार्यक्रम",
    titleStart: "अधिकृत ",
    titleEnd: "डीलर बनें",
    subtitle: "थोक सूची मूल्य निर्धारण, विशेष शोरूम क्रेडिट, निर्माण में प्राथमिकता और सह-विपणन लाभों को अनलॉक करें। सुरुचिपूर्ण और आधुनिक स्थानों के लिए पीटीसी फर्नीचर्स के साथ साझेदारी करें।",
    benefitsHeading: "अनन्य साझेदारी लाभ",
    benefitsDesc: "असाधारण आतिथ्य और आवासीय इंटीरियर डिजाइन के लिए तैयार किए गए इंटीरियर पेशेवरों और शोरूम के एक प्रतिष्ठित नेटवर्क में शामिल हों।",
    benefit1Title: "ट्रेड मूल्य निर्धारण और बहु-स्तरीय छूट",
    benefit1Desc: "कर छूट वर्कफ़्लो के साथ, खुदरा मूल्य सूची पर 45% तक की छूट के साथ टियर-1 व्यापार मूल्य निर्धारण का लाभ उठाएं।",
    benefit2Title: "व्हाइट-ग्लव प्राथमिकता शिपिंग",
    benefit2Desc: "समेकित शिपिंग मार्गों और स्थानीय लॉजिस्टिक्स सहायता के साथ निर्माण और वितरण प्रक्रिया में प्राथमिकता।",
    benefit3Title: "समर्पित परियोजना परामर्श",
    benefit3Desc: "कस्टम अपहोल्स्ट्री विनिर्देश, सीएडी (CAD) लेआउट, सामग्री नमूने और 3डी मॉडलिंग सहायता प्राप्त करें।",
    showroomTitle: "शोरूम नमूना कार्यक्रम",
    showroomDesc: "स्थानीय खुदरा प्रदर्शन में सहायता के लिए शोरूम प्रदर्शन फर्नीचर संग्रह पर 50% तक की छूट के पात्र बनें।",
    formHeading: "साझेदारी पूछताछ फॉर्म",
    formDesc: "डीलर बनने की प्रक्रिया शुरू करने के लिए नीचे विवरण भरें। एक साझेदारी सलाहकार 24 घंटे के भीतर आपसे संपर्क करेगा।",
    labelName: "पूरा नाम *",
    labelPhone: "फ़ोन नंबर *",
    labelCity: "शहर *",
    labelEmail: "ईमेल पता (वैकल्पिक)",
    placeholderName: "जैसे: राहुल कुमार",
    placeholderPhone: "जैसे: +91 99999 99999",
    placeholderCity: "जैसे: दिल्ली / मुंबई",
    placeholderEmail: "जैसे: rahul@example.com",
    btnSubmit: "साझेदारी आवेदन जमा करें",
    btnSubmitting: "आवेदन भेजा जा रहा है...",
    successTitle: "आवेदन सफलतापूर्वक दर्ज हुआ!",
    successRef: "संदर्भ संख्या: ",
    successDesc: "पीटीसी फर्नीचर अधिकृत डीलर कार्यक्रम के लिए आवेदन करने के लिए धन्यवाद। एक क्षेत्रीय वितरण सलाहकार को आपका संदर्भ सौंपा गया है और वह जल्द ही आपके विवरण की समीक्षा करेंगे।",
    successEmailNotify: "हमारी टीम को एक ईमेल सूचना भेज दी गई है।",
    successReset: "दूसरा आवेदन भेजें"
  }
};

export default function DealersPage() {
  const [lang, setLang] = useState<Language>("en");
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
    dealerPhone?: string;
    dealerName?: string;
    error?: string;
  } | null>(null);

  const t = TRANSLATIONS[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmitResult(null);

    const submittedPhone = formData.phone;
    const submittedName = formData.name;

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
        const leadId = data.lead.id;
        const city = formData.city;

        // Track dealer lead submission via Google Analytics
        sendGAEvent("event", "dealer_lead_submit", {
          lead_id: leadId,
          dealer_city: city,
          dealer_name: submittedName,
        });

        setSubmitResult({
          success: true,
          leadId,
          dealerPhone: submittedPhone,
          dealerName: submittedName,
        });
        setFormData({
          name: "",
          phone: "",
          city: "",
          email: "",
        });
      } else {
        setSubmitResult({
          success: false,
          error: data.error || "Failed to submit partnership request.",
        });
      }
    } catch (_err) {
      setSubmitResult({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navigation />

      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-40" />

      <header className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        {/* Premium Language Selector - Pill design */}
        <div className="flex justify-center items-center gap-1 bg-slate-200/50 dark:bg-white/5 p-1 rounded-full w-fit mx-auto mb-8 border border-slate-200/30 dark:border-white/5 shadow-xs">
          <div className="pl-3 pr-1 text-slate-400 dark:text-slate-500">
            <Globe className="size-3.5" />
          </div>
          {[
            { code: "en", label: "English" },
            { code: "hi", label: "हिंदी" },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code as Language)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${lang === l.code
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold tracking-wider uppercase mb-5">
          <Sparkles className="size-3.5" />
          {t.programTag}
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight">
          {t.titleStart}
          <span className="text-red-700 dark:text-red-500">{t.titleEnd}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-500 dark:text-slate-400 sm:text-lg leading-relaxed">
          {t.subtitle}
        </p>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse gap-12 lg:grid lg:grid-cols-12 lg:items-start">
          {/* Left Column: Benefits Cards */}
          <section className="lg:col-span-5 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              {t.benefitsHeading}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.benefitsDesc}
            </p>

            <div className="grid gap-4.5">
              {/* Benefit 1 */}
              <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#111318]/70 shadow-xs hover:border-red-500/20 dark:hover:border-red-500/25 transition duration-300">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <Percent className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.benefit1Title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t.benefit1Desc}
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#111318]/70 shadow-xs hover:border-red-500/20 dark:hover:border-red-500/25 transition duration-300">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.benefit2Title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t.benefit2Desc}
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4 p-5 rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-[#111318]/70 shadow-xs hover:border-red-500/20 dark:hover:border-red-500/25 transition duration-300">
                <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.benefit3Title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {t.benefit3Desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-[#111318]/30">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Building2 className="size-4 text-red-600 dark:text-red-400" />
                {t.showroomTitle}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {t.showroomDesc}
              </p>
            </div>
          </section>

          {/* Right Column: Simplified Form */}
          <section className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg shadow-slate-100 dark:border-white/5 dark:bg-[#0f1116] dark:shadow-none relative overflow-hidden">
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-red-600 to-red-500" />

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {t.formHeading}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t.formDesc}
              </p>

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {t.labelName}
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder={t.placeholderName}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {t.labelPhone}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder={t.placeholderPhone}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="city"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {t.labelCity}
                    </Label>
                    <Input
                      id="city"
                      required
                      placeholder={t.placeholderCity}
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="rounded-xl border-slate-200/80 bg-slate-50/50 dark:border-white/10 dark:bg-[#08090d]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {t.labelEmail}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.placeholderEmail}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
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
                  {loading ? t.btnSubmitting : t.btnSubmit}
                </Button>
              </form>

              {/* High-Fidelity Success Overlay */}
              {submitResult?.success && (
                <div className="absolute inset-0 bg-white/95 dark:bg-[#0f1116]/98 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-scale-up z-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                    <Check className="size-8 stroke-3" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                    {t.successTitle}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-300 mt-3 select-all">
                    {t.successRef}
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {submitResult.leadId}
                    </span>
                  </div>
                  <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mt-6 leading-relaxed">
                    {t.successDesc}
                  </p>

                  {/* Email notification alert */}
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t.successEmailNotify}
                  </p>

                  <Button
                    onClick={() => setSubmitResult(null)}
                    variant="outline"
                    className="mt-4 rounded-xl px-6 cursor-pointer font-bold text-xs tracking-wider uppercase"
                  >
                    {t.successReset}
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
