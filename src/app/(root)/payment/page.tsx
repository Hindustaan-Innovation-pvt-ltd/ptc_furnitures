import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Script from "next/script";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import QrCodeDownloader from "@/components/custom/QrCodeDownloader";
import ScrollToBank from "@/components/custom/ScrollToBank";
import StayInTouch from "@/components/custom/StayInTouch";
import { BankingDetailsModel } from "@/lib/db-models";
import { connectToDatabase } from "@/lib/mongodb";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export const metadata: Metadata = {
  title: "Payment & Banking Details | PTC Furnitures",
  description:
    "View PTC Furnitures banking details and UPI QR code for secure payments via NEFT, RTGS, IMPS or UPI.",
};

type BankEntry = {
  _id: string;
  label: string;
  isActive: boolean;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  branchName?: string;
  upiId?: string;
  upiName?: string;
  qrImage?: string;
  notes?: string;
};

async function getActiveEntries(): Promise<BankEntry[]> {
  await connection();
  try {
    await connectToDatabase();

    const entries = await BankingDetailsModel.find({ isActive: { $ne: false } })
      .sort({ createdAt: 1 })
      .lean();

    return entries.map((e: any) => ({
      _id: e._id.toString(),
      label: e.label || "",
      isActive: e.isActive !== false,
      accountHolderName: e.accountHolderName || "",
      bankName: e.bankName || "",
      accountNumber: e.accountNumber || "",
      ifscCode: e.ifscCode || "",
      accountType: e.accountType || "Current",
      branchName: e.branchName || "",
      upiId: e.upiId || "",
      upiName: e.upiName || "",
      qrImage: e.qrImage || "",
      notes: e.notes || "",
    })) as BankEntry[];
  } catch (error) {
    console.error("Error fetching banking details directly:", error);
    return [];
  }
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams?: Promise<{ bank?: string | string[] }>;
}) {
  return (
    <section className="min-h-screen bg-[#fcfcfd] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <div className="flex-1">
        <Navigation />

        <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 dark:text-red-400">
              Secure Payment
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-slate-100">
              Banking &amp;{" "}
              <span className="text-red-700 dark:text-red-500">
                Payment Details
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Use any of the payment methods below. Please mention your order or
              inquiry reference when transferring.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-20 text-slate-500">
                Loading payment details...
              </div>
            }
          >
            <PaymentEntriesLoader searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      {/* Client-side copy script */}
      <Script
        id="payment-copy-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          document.addEventListener('click', function(e) {
            var btn = e.target.closest('.copy-btn');
            if (!btn) return;
            var text = btn.getAttribute('data-copy');
            if (!text) return;

            function showSuccess() {
              var orig = btn.innerHTML;
              btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
              btn.style.color = '#16a34a';
              setTimeout(function() { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(showSuccess).catch(function(err) {
                console.error("Clipboard copy failed: ", err);
              });
            } else {
              var textArea = document.createElement("textarea");
              textArea.value = text;
              textArea.style.position = "fixed";
              textArea.style.left = "-999999px";
              textArea.style.top = "-999999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              try {
                document.execCommand('copy');
                showSuccess();
              } catch (err) {
                console.error("Fallback copy failed: ", err);
              }
              document.body.removeChild(textArea);
            }
          });

          function handleHashScroll() {
            var hash = window.location.hash;
            if (!hash) return;
            var id = decodeURIComponent(hash.substring(1));
            var el = document.getElementById(id);
            if (el) {
              setTimeout(function() {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }
          }
          window.addEventListener('load', handleHashScroll);
          window.addEventListener('hashchange', handleHashScroll);
          if (document.readyState === 'complete') {
            handleHashScroll();
          } else {
            document.addEventListener('DOMContentLoaded', handleHashScroll);
          }
        `,
        }}
      />

      <StayInTouch />
      <Footer />
    </section>
  );
}

async function PaymentEntriesLoader({
  searchParams,
}: {
  searchParams?: Promise<{ bank?: string | string[] }>;
}) {
  const params = await searchParams;
  const selectedBank = Array.isArray(params?.bank) ? params.bank[0] : params?.bank;

  const entries = await getActiveEntries();

  if (entries.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#111318] border border-slate-200/60 dark:border-white/5 rounded-3xl max-w-md mx-auto">
        <svg
          className="mx-auto mb-4 text-slate-300 dark:text-slate-700"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
        <h3 className="text-base font-bold">
          Payment details not configured yet
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Please contact us directly to arrange payment.
        </p>
      </div>
    );
  }

  // Find the single active QR image if any exists
  const qrEntry = entries.find((e) => e.qrImage);
  const mainQrImage = qrEntry?.qrImage;
  const mainUpiId = qrEntry?.upiId;
  const mainUpiName = qrEntry?.upiName || qrEntry?.accountHolderName;
  const mainQrLabel = qrEntry?.label || "Payment QR Code";

  return (
    <div className={`grid grid-cols-1 ${mainQrImage ? "lg:grid-cols-3" : ""} gap-8 items-start`}>
      {/* Left Column: List of bank accounts */}
      <div className={`space-y-8 ${mainQrImage ? "lg:col-span-2" : "max-w-2xl mx-auto w-full"}`}>
        {entries.map((b, idx) => {
          const hasBank = b.accountNumber || b.bankName;
          const hasUpi = b.upiId;

          return (
            <div
              key={b._id}
              id={b.bankName ? b.bankName.trim().toLowerCase().replace(/\s+/g, "-") : undefined}
              className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] shadow-xs overflow-hidden scroll-mt-24"
            >
              {/* Account header strip */}
              <div className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-red-700 to-red-600 dark:from-red-800 dark:to-red-700">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-black">
                  {idx + 1}
                </div>
                <h2 className="text-sm font-extrabold text-white tracking-wide">
                  {b.label || `Payment Account ${idx + 1}`}
                </h2>
              </div>

              <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-5">
                {/* Bank Transfer */}
                {hasBank && (
                  <div className="rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 dark:bg-white/2 border-b border-slate-100 dark:border-white/5">
                      <svg
                        className="size-4 text-red-600 dark:text-red-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                      </svg>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Bank Transfer — NEFT / RTGS / IMPS
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {[
                        {
                          label: "Account Holder",
                          value: b.accountHolderName,
                          id: `holder-${b._id}`,
                        },
                        {
                          label: "Bank Name",
                          value: b.bankName,
                          id: `bank-${b._id}`,
                        },
                        {
                          label: "Account Number",
                          value: b.accountNumber,
                          id: `accno-${b._id}`,
                          mono: true,
                        },
                        {
                          label: "IFSC Code",
                          value: b.ifscCode,
                          id: `ifsc-${b._id}`,
                          mono: true,
                        },
                        {
                          label: "Account Type",
                          value: b.accountType,
                          id: `type-${b._id}`,
                        },
                        {
                          label: "Branch",
                          value: b.branchName,
                          id: `branch-${b._id}`,
                        },
                      ]
                        .filter((r) => r.value)
                        .map((row) => (
                          <div
                            key={row.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 gap-1.5 sm:gap-4"
                          >
                            <span className="text-xs font-semibold text-slate-400 shrink-0 sm:w-32">
                              {row.label}
                            </span>
                            <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
                              <span
                                className={`text-sm font-bold text-slate-800 dark:text-slate-100 truncate ${row.mono ? "font-mono tracking-wider" : ""}`}
                              >
                                {row.value}
                              </span>
                              <button
                                type="button"
                                data-copy={row.value}
                                className="shrink-0 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition copy-btn"
                                aria-label={`Copy ${row.label}`}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                  />
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* UPI */}
                {hasUpi && (
                  <div className="rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 py-3 bg-purple-50 dark:bg-purple-950/10 border-b border-purple-100 dark:border-purple-900/20">
                      <svg
                        className="size-4 text-purple-600 dark:text-purple-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        UPI — PhonePe · GPay · Paytm
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {[
                        {
                          label: "UPI ID",
                          value: b.upiId,
                          id: `upiid-${b._id}`,
                          mono: true,
                        },
                        {
                          label: "Registered Name",
                          value: b.upiName,
                          id: `upiname-${b._id}`,
                        },
                      ]
                        .filter((r) => r.value)
                        .map((row) => (
                          <div
                            key={row.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 gap-1.5 sm:gap-4"
                          >
                            <span className="text-xs font-semibold text-slate-400 shrink-0 sm:w-32">
                              {row.label}
                            </span>
                            <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto justify-between sm:justify-start">
                              <span
                                className={`text-sm font-bold text-slate-800 dark:text-slate-100 truncate ${row.mono ? "font-mono tracking-wider" : ""}`}
                              >
                                {row.value}
                              </span>
                              <button
                                type="button"
                                data-copy={row.value}
                                className="shrink-0 p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition copy-btn"
                                aria-label={`Copy ${row.label}`}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                  />
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                  </div>
                )}

                {/* Notes */}
                {b.notes && (
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/20 p-4 flex gap-3">
                    <svg
                      className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                      {b.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Single Main QR Code */}
      {mainQrImage && (
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] shadow-xs overflow-hidden lg:sticky lg:top-24">
          <div className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-purple-700 to-purple-600 dark:from-purple-800 dark:to-purple-700">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">
              Scan to Pay (UPI QR)
            </h2>
          </div>
          <div className="p-6 flex flex-col items-center">
            <QrCodeDownloader
              qrImage={mainQrImage}
              label={mainQrLabel}
              upiId={mainUpiId}
            />
            {mainUpiId && (
              <div className="w-full mt-5 border-t border-slate-100 dark:border-white/5 pt-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">UPI ID</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                    <span>{mainUpiId}</span>
                    <button
                      type="button"
                      data-copy={mainUpiId}
                      className="shrink-0 p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition copy-btn"
                      aria-label="Copy UPI ID"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    </button>
                  </div>
                </div>
                {mainUpiName && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Registered Name</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{mainUpiName}</span>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
      <ScrollToBank bankSlug={selectedBank} />
    </div>
  );
}
