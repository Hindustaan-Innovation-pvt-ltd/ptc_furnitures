"use client";
import React from "react";
import { Download, Loader2, Phone, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Catalog = {
  id: string;
  title: string;
  type: "pdf" | "custom";
  pdfUrl?: string;
  brand?: string;
  isDefault?: boolean;
};

type CatalogDownloadSelectionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lead: { name: string; mobile: string; catalogUrl: string; catalogTitle: string }) => void | Promise<void>;
};

export default function CatalogDownloadSelectionModal({
  open,
  onOpenChange,
  onConfirm,
}: CatalogDownloadSelectionModalProps) {
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [selectedCatalogId, setSelectedCatalogId] = React.useState<string>("");
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<{
    name?: string;
    mobile?: string;
    catalog?: string;
  }>({});

  // Fetch PDF catalogs on modal open
  React.useEffect(() => {
    if (open) {
      setIsLoadingCatalogs(true);
      fetch("/api/catalogs", { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load catalogs");
          return res.json();
        })
        .then((data) => {
          const pdfList = (data.catalogs || []).filter(
            (c: Catalog) => c.type === "pdf" && c.pdfUrl
          );
          setCatalogs(pdfList);
          
          // Auto-select first catalog if available
          if (pdfList.length > 0) {
            setSelectedCatalogId(pdfList[0].id);
          }
        })
        .catch((err) => {
          console.error("Error fetching catalogs for dropdown:", err);
        })
        .finally(() => {
          setIsLoadingCatalogs(false);
        });
    }
  }, [open]);

  function validate() {
    const e: { name?: string; mobile?: string; catalog?: string } = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!mobile.trim()) e.mobile = "Please enter your mobile number.";
    else if (!/^\+?[0-9\s\-()]{7,15}$/.test(mobile.trim()))
      e.mobile = "Enter a valid mobile number.";
    
    if (!selectedCatalogId) {
      e.catalog = "Please select a catalog to download.";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    const chosenCatalog = catalogs.find((c) => c.id === selectedCatalogId);
    if (!chosenCatalog || !chosenCatalog.pdfUrl) {
      setErrors({ catalog: "Selected catalog does not have a download URL." });
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onConfirm({
        name: name.trim(),
        mobile: mobile.trim(),
        catalogUrl: chosenCatalog.pdfUrl,
        catalogTitle: chosenCatalog.title,
      });
      // Reset form after successful download start
      setName("");
      setMobile("");
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm callback failed:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!submitting) onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md rounded-3xl p-8 bg-white border border-slate-200 shadow-2xl dark:bg-white dark:border-slate-200 dark:text-slate-900">
        <DialogTitle className="sr-only">
          Select and Download Catalog
        </DialogTitle>
        <DialogDescription className="sr-only">
          Provide your details and select a catalog to download.
        </DialogDescription>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4 shadow-sm">
            <Download className="size-6 text-red-600 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Download Catalog Brochure
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Please fill in your details and select which catalog you would like to download.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name Field */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="cs-name"
              className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500"
            >
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              <input
                id="cs-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-9 pr-3 py-2.5 text-sm font-semibold bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 text-slate-800 transition ${errors.name ? "border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-red-500 focus:ring-red-500/20"}`}
              />
            </div>
            {errors.name && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.name}
              </span>
            )}
          </div>

          {/* Mobile Field */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="cs-mobile"
              className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500"
            >
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              <input
                id="cs-mobile"
                type="tel"
                autoComplete="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setErrors((prev) => ({ ...prev, mobile: undefined }));
                }}
                placeholder="e.g. +91 98765 43210"
                className={`w-full pl-9 pr-3 py-2.5 text-sm font-semibold bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 text-slate-800 transition ${errors.mobile ? "border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-red-500 focus:ring-red-500/20"}`}
              />
            </div>
            {errors.mobile && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.mobile}
              </span>
            )}
          </div>

          {/* Catalog Selector */}
          <div className="flex flex-col gap-1">
            <label
              className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500"
            >
              Choose Catalog
            </label>
            <div className="relative">
              {isLoadingCatalogs ? (
                <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-slate-400 text-xs font-semibold">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Loading available catalogs...</span>
                </div>
              ) : catalogs.length === 0 ? (
                <div className="flex items-center gap-2 px-3 py-2.5 border border-red-200 bg-red-50 rounded-xl text-red-500 text-xs font-semibold">
                  <span>No catalogs available for download.</span>
                </div>
              ) : (
                <Select
                  value={selectedCatalogId}
                  onValueChange={(val) => {
                    setSelectedCatalogId(val);
                    setErrors((prev) => ({ ...prev, catalog: undefined }));
                  }}
                >
                  <SelectTrigger className="w-full text-slate-800 border-slate-200 bg-slate-50 rounded-xl h-[42px] focus:ring-red-500/20 focus:border-red-500">
                    <SelectValue placeholder="Select a catalog brochure" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl max-h-56">
                    {catalogs.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="text-slate-850 hover:bg-slate-50 focus:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg"
                      >
                        <span className="font-semibold">{c.title}</span>
                        {c.brand && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-105">
                            {c.brand}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {errors.catalog && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                {errors.catalog}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1 rounded-xl border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || catalogs.length === 0}
              className="flex-1 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Download PDF"
              )}
            </Button>
          </div>

          <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-1.5">
            Your details are secure and will only be used to send updates and premium deals.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
