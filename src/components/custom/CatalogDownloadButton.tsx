"use client";
import { sendGAEvent } from "@next/third-parties/google";
import React from "react";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";

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
    }).catch(() => { });

    // Track the action via Google Analytics
    sendGAEvent("event", isPrint ? "catalog_print" : "catalog_download", {
      catalog_url: href,
      lead_name: lead.name,
    });

    if (isPrint) {
      window.print();
    } else {
      try {
        let downloadUrl = href;
        if (href.startsWith("/api/images") || href.includes("/api/images?")) {
          const url = new URL(href, window.location.origin);
          url.searchParams.set("download", "1");
          downloadUrl = url.toString();
        }

        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error("Failed to fetch PDF catalog");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        let filename = "catalog.pdf";
        const contentDisposition = response.headers.get("Content-Disposition");
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        } else {
          const urlParts = href.split(/[?#]/)[0].split("/");
          const lastPart = urlParts[urlParts.length - 1];
          if (lastPart && lastPart.toLowerCase().endsWith(".pdf")) {
            filename = lastPart;
          }
        }

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (error) {
        console.error("Direct download failed, falling back to standard link:", error);
        const a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
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
