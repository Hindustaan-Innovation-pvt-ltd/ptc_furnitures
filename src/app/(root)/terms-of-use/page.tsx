import {
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Handshake,
  HelpCircle,
  Scale,
} from "lucide-react";
import type { Metadata } from "next";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";

export const metadata: Metadata = {
  title: "Terms of Use | PTC Furniture",
  description:
    "Read the terms and conditions governing the use of PTC Furniture trade platforms, catalog requests, and dealer programs.",
};

export default function TermsOfUsePage() {
  const sections = [
    {
      icon: <Handshake className="size-5 text-red-600 dark:text-red-400" />,
      title: "1. Acceptance of Terms",
      content: (
        <p>
          By accessing the PTC Furniture website, requesting brochures,
          downloading catalogs, or applying to become an authorized dealer, you
          agree to comply with and be bound by these Terms of Use. If you do not
          agree to these terms, please do not use our services or submit
          registration details.
        </p>
      ),
    },
    {
      icon: (
        <FileSpreadsheet className="size-5 text-red-600 dark:text-red-400" />
      ),
      title: "2. Trade Catalogs & Wholesale Registration",
      content: (
        <div className="space-y-3">
          <p>
            Wholesale lists, trade pricing, and dealer catalog information are
            proprietary assets reserved exclusively for trade professionals and
            authorized dealers:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Information Accuracy:</strong> When downloading catalogs
              or submitting partnership inquiries, you must provide correct and
              valid details (name, phone number, and location).
            </li>
            <li>
              <strong>Pricing & Program Policies:</strong> Tiered discounts (up
              to 45% off retail lists) and showroom credits (up to 50% discount
              on showroom demonstration furniture collections) are subject to
              validation, regional distribution quotas, and business status
              verification.
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: <Scale className="size-5 text-red-600 dark:text-red-400" />,
      title: "3. Intellectual Property Rights",
      content: (
        <p>
          All content displayed on this website, including but not limited to
          furniture designs, watermarked product photographs, trade catalogs,
          logos, watermarks, CAD files, 3D modeling files, copy, and product
          collections (including brand collections like REX, ALTECH, ARIPLAST,
          HALLMARK, PANKAJ, and PTC GOLD) are the sole property of PTC Furniture
          or its registered licensors. Any unauthorized reproduction, scraping,
          or distribution of these assets is strictly prohibited.
        </p>
      ),
    },
    {
      icon: <FileText className="size-5 text-red-600 dark:text-red-400" />,
      title: "4. Payments & Direct Bank Transfers",
      content: (
        <div className="space-y-3">
          <p>
            Transactions with PTC Furniture are finalized using direct bank
            accounts or UPI credentials listed on our Payment page:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>No Online Payment Gateways:</strong> We do not offer
              processing via card networks or online payment gateways on this
              site.
            </li>
            <li>
              <strong>Verification:</strong> Transfer details must be shared
              with your assigned regional distribution consultant. Orders will
              only enter the priority fabrication cycle once funds are credited
              and verified by our finance department.
            </li>
            <li>
              <strong>Accuracy of Details:</strong> It is your responsibility to
              verify the account details on the Payment page prior to initiating
              transfers. PTC Furniture is not liable for transfers made to
              incorrect bank accounts or UPI IDs.
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />,
      title: "5. Automated Notifications Consent",
      content: (
        <p>
          By submitting a form on our platform (including catalog download
          authorizations, contact messages, and dealer applications), you
          explicitly consent to receive automated notifications, confirmation
          messages, and administrative updates via SMS alerts and WhatsApp text
          messages on the phone number provided.
        </p>
      ),
    },
    {
      icon: <HelpCircle className="size-5 text-red-600 dark:text-red-400" />,
      title: "6. Limitation of Liability",
      content: (
        <p>
          PTC Furniture provides this platform, catalogs, and product details
          "as is" and "as available". We do not guarantee uninterrupted site
          access or error-free display of product dimensions, fabrics, or wood
          finishes. To the maximum extent permitted by applicable law, PTC
          Furniture shall not be held liable for any indirect, incidental, or
          consequential damages resulting from your use of or inability to use
          this platform.
        </p>
      ),
    },
    {
      icon: <Scale className="size-5 text-red-600 dark:text-red-400" />,
      title: "7. Governing Law & Jurisdiction",
      content: (
        <p>
          These Terms of Use shall be governed by and construed in accordance
          with the laws of India. Any legal action or dispute arising under
          these terms shall be subject to the exclusive jurisdiction of the
          courts located in Mumbai, Maharashtra, India.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navigation />

      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-40" />

      <header className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold tracking-wider uppercase mb-5">
          <FileText className="size-3.5" />
          Terms of Use
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight">
          Terms of{" "}
          <span className="text-red-700 dark:text-red-500">Service</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg leading-relaxed">
          Last updated: June 5, 2026. Please read these terms carefully before
          using PTC Furniture services.
        </p>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 pb-32 sm:px-6">
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/50 dark:border-white/5 dark:bg-[#0f1116]/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100 dark:shadow-none space-y-10">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  {section.title}
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-13">
                {section.content}
              </div>
              {idx < sections.length - 1 && (
                <hr className="border-slate-200/60 dark:border-white/5 pt-4" />
              )}
            </div>
          ))}

          {/* Contact note */}
          <div className="mt-12 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-[#111318]/30 text-xs text-slate-500 dark:text-slate-400 text-center">
            For questions or requests regarding these Terms of Service, please
            write to us at{" "}
            <span className="font-bold text-red-600 dark:text-red-400 select-all">
              support@ptcfurniture.com
            </span>
            .
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
