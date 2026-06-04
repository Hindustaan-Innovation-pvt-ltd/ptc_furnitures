"use client";
import React from "react";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";
import { sendGAEvent } from "@next/third-parties/google";

type CatalogDownloadButtonProps = {
  /** The URL to download (PDF) */
  href: string;
  /** Button label */
  label?: string;
  className?: string;
  children?: React.ReactNode;
  /** If true, triggers window.print() instead of file download */
  isPrint?: boolean;
  title?: string;
};

export default function CatalogDownloadButton({
  href,
  label = "Download PDF",
  className = "",
  children,
  isPrint = false,
  title,
}: CatalogDownloadButtonProps) {
  const [modalOpen, setModalOpen] = React.useState(false);

  async function handleConfirm(lead: { name: string; mobile: string }) {
    // Silently log lead (best-effort)
    fetch("/api/download-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        mobile: lead.mobile,
        action: isPrint ? "catalog_print" : "catalog_download",
        catalogUrl: href,
      }),
    }).catch(() => {});

    // Track the action via Google Analytics
    sendGAEvent("event", isPrint ? "catalog_print" : "catalog_download", {
      catalog_url: href,
      lead_name: lead.name,
    });

    if (isPrint) {
      window.print();
    } else {
      // Trigger the download programmatically
      const a = document.createElement("a");
      a.href = href;
      a.download = "";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  return (
    <>
      <LeadCaptureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        actionLabel={isPrint ? "Print / Save PDF" : "Download Catalog"}
        onConfirm={handleConfirm}
      />
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={className}
        title={title}
      >
        {children ?? label}
      </button>
    </>
  );
}
