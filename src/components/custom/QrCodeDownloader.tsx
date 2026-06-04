"use client";
import { Download } from "lucide-react";
import React from "react";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";
import { Button } from "@/components/ui/button";

type QrCodeDownloaderProps = {
  qrImage: string;
  label: string;
  upiId?: string;
};

export default function QrCodeDownloader({
  qrImage,
  label,
  upiId,
}: QrCodeDownloaderProps) {
  const [leadModalOpen, setLeadModalOpen] = React.useState(false);

  async function handleConfirmDownload(lead: { name: string; mobile: string }) {
    // Save lead details to backend
    try {
      await fetch("/api/download-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          mobile: lead.mobile,
          action: "qr_download",
          catalogUrl: qrImage,
          productName: `${label} QR Code`,
        }),
      });
    } catch (err) {
      console.error("Failed to save QR download lead:", err);
    }

    // Trigger browser download of QR Image using Blob to avoid base64 data URL restrictions
    try {
      const res = await fetch(qrImage);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${label.toLowerCase().replace(/\s+/g, "-")}-upi-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download QR code via Blob, falling back:", err);
      const a = document.createElement("a");
      a.href = qrImage;
      a.download = `${label.toLowerCase().replace(/\s+/g, "-")}-upi-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 shrink-0 w-full max-w-[384px] mx-auto lg:mx-0">
      <LeadCaptureModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        actionLabel="Download QR Code"
        onConfirm={handleConfirmDownload}
      />

      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-center">
        Scan &amp; Pay
      </p>
      <div className="relative w-full aspect-square sm:size-96 rounded-2xl overflow-hidden border-4 border-red-600/10 dark:border-red-400/10 shadow-lg bg-white flex items-center justify-center p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImage}
          alt={`${label} UPI QR Code`}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-red-600 rounded-tl-sm" />
        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-red-600 rounded-tr-sm" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-red-600 rounded-bl-sm" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-red-600 rounded-br-sm" />
      </div>

      <Button
        type="button"
        onClick={() => setLeadModalOpen(true)}
        className="w-full rounded-xl bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 py-2.5 shadow-xs cursor-pointer"
      >
        <Download className="size-3.5" />
        Download QR Code
      </Button>

      <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-[180px] mt-1">
        Open any UPI app, tap{" "}
        <strong className="text-slate-600 dark:text-slate-300">Scan QR</strong>,
        and point your camera here.
      </p>

      {upiId && (
        <div className="w-full bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2 text-center mt-1">
          <p className="text-[9px] text-slate-400 font-medium mb-0.5">UPI ID</p>
          <p className="text-sm font-black font-mono text-slate-800 dark:text-slate-100 tracking-wide break-all">
            {upiId}
          </p>
        </div>
      )}
    </div>
  );
}
