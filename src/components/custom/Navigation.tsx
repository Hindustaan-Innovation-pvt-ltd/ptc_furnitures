"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { Check, Download, Loader2, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";

function NavigationContent() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);
  const [downloadState, setDownloadState] = React.useState<
    "idle" | "loading" | "downloading" | "success" | "error"
  >("idle");
  const [leadModalOpen, setLeadModalOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = searchValue.trim();
    const nextParams = new URLSearchParams(searchParams.toString());

    if (value) {
      nextParams.set("q", value);
      sendGAEvent("event", "search", { search_term: value });
    } else {
      nextParams.delete("q");
    }

    const queryString = nextParams.toString();
    router.push(`/collections${queryString ? `?${queryString}` : ""}`);
    setOpen(false);
    setShowMobileSearch(false);
  }

  function clearSearch() {
    setSearchValue("");
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("q");
    const queryString = nextParams.toString();
    router.push(`/collections${queryString ? `?${queryString}` : ""}`);
    setOpen(false);
    setShowMobileSearch(false);
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setShowMobileSearch(false);
      }
    }

    if (open || showMobileSearch) {
      window.addEventListener("keydown", onKey);
    }

    return () => window.removeEventListener("keydown", onKey);
  }, [open, showMobileSearch]);

  function isActive(path: string) {
    return pathname === path;
  }

  function handleOpenLeadModal() {
    if (downloadState !== "idle") return;
    setLeadModalOpen(true);
  }

  async function handleConfirmDownload(lead: { name: string; mobile: string }) {
    if (downloadState !== "idle") return;
    setDownloadState("loading");
    try {
      const res = await fetch("/api/catalogs");
      if (!res.ok) throw new Error("Failed to fetch catalogs");
      const data = await res.json();

      const pdfCatalogs = (data.catalogs || []).filter(
        (c: any) => c.type === "pdf" && c.pdfUrl,
      );
      let downloadUrl = "/uploads/catalogs/ptc-furniture-brochure-2026.pdf";
      let fileName = "ptc-furniture-brochure-2026.pdf";

      if (pdfCatalogs.length > 0) {
        const latestPdf = pdfCatalogs[0];
        downloadUrl = latestPdf.pdfUrl;
        fileName =
          latestPdf.pdfUrl.split("/").pop() || "ptc-furniture-brochure.pdf";
      }

      // Save lead to database
      await fetch("/api/download-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          mobile: lead.mobile,
          action: "catalog_download",
          catalogUrl: downloadUrl,
        }),
      }).catch((err) => {
        console.error("Failed to save download lead:", err);
      });

      setDownloadState("downloading");

      const response = await fetch(downloadUrl);
      if (!response.ok)
        throw new Error("Catalog brochure file is not available");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setDownloadState("success");
      sendGAEvent("event", "catalog_download", {
        file_name: fileName,
        source: "navigation",
      });
      setTimeout(() => setDownloadState("idle"), 2500);
    } catch (err) {
      console.error("Error downloading catalog:", err);
      setDownloadState("error");
      setTimeout(() => setDownloadState("idle"), 3000);
    }
  }

  const navItems = [
    { label: "Collections", href: "/collections" },
    { label: "Catalogs", href: "/catalogs" },
    { label: "Dealers", href: "/dealers" },
    { label: "Payment", href: "/payment" },
    { label: "Contacts", href: "/contact" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      <style>{`
                @keyframes bounceSubtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                @keyframes scaleUp {
                    0% { transform: scale(0.95); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-subtle {
                    animation: bounceSubtle 2s infinite ease-in-out;
                }
                .animate-scale-up {
                    animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

      <LeadCaptureModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        actionLabel="Download Catalog"
        onConfirm={handleConfirmDownload}
      />

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-[#08090d]/80 transition-all duration-300 shadow-xs relative">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link
              href="/"
              className="transition-transform duration-200 active:scale-95 animate-scale-up"
            >
              <Image
                src="/logo-dark.svg"
                alt="PTC Furniture Logo"
                width={120}
                height={38}
                className="block w-24 sm:w-26 dark:hidden"
                style={{ height: "auto" }}
                priority
              />
              <Image
                src="/logo-white.svg"
                alt="PTC Furniture Logo"
                width={120}
                height={38}
                className="hidden w-24 sm:w-26 dark:block"
                style={{ height: "auto" }}
                priority
              />
            </Link>

            <ul className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative px-2.5 py-1 xl:px-3.5 xl:py-1.5 rounded-full font-bold text-[10px] xl:text-xs tracking-tight xl:tracking-wider uppercase transition-all duration-300 active:scale-95 ${
                        active
                          ? "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Search, Download & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Form (Large Desktop Only) */}
            <form
              className="hidden xl:flex relative items-center group"
              onSubmit={submitSearch}
            >
              <Search className="absolute left-3 size-3.5 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors group-focus-within:text-red-500" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className={`pl-9 py-1.5 text-xs font-semibold bg-slate-100/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-full focus:outline-none focus:border-red-500 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-red-500/10 text-slate-800 dark:text-slate-200 transition-all duration-300 placeholder:text-slate-400/90 placeholder:font-normal ${
                  searchValue ? "w-52 pr-8" : "w-32 pr-4 focus:w-52 focus:pr-8"
                }`}
                placeholder="Search..."
                aria-label="Search products"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              )}
            </form>

            {/* Mobile/Tablet Search Button Trigger */}
            <Button
              variant="ghost"
              onClick={() => setShowMobileSearch(true)}
              className="xl:hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
              aria-label="Search products"
            >
              <Search className="size-5" />
            </Button>

            {/* Desktop Download Catalog button */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              <Button
                onClick={handleOpenLeadModal}
                disabled={
                  downloadState === "downloading" || downloadState === "loading"
                }
                className={`relative flex items-center gap-1.5 xl:gap-2 rounded-full px-3 py-1 xl:px-4.5 xl:py-1.5 text-[10px] xl:text-xs font-bold border transition-all duration-300 cursor-pointer overflow-hidden ${
                  downloadState === "success"
                    ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : downloadState === "error"
                      ? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/25"
                      : "bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-transparent shadow-xs hover:shadow-md hover:shadow-red-500/20 dark:from-red-700 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-500"
                }`}
              >
                {downloadState === "idle" && (
                  <>
                    <Download className="size-3.5 animate-bounce-subtle" />
                    <span className="hidden lg:inline">Download Catalog</span>
                    <span className="inline lg:hidden">Catalog</span>
                  </>
                )}
                {downloadState === "loading" && (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Preparing...</span>
                  </>
                )}
                {downloadState === "downloading" && (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                )}
                {downloadState === "success" && (
                  <>
                    <Check className="size-3.5 animate-scale-up" />
                    <span>Saved Brochure!</span>
                  </>
                )}
                {downloadState === "error" && (
                  <span className="text-xs">Retry Download</span>
                )}
              </Button>
            </div>

            {/* Theme Toggler */}
            <div className="flex items-center">
              <AnimatedThemeToggler />
            </div>

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              aria-expanded={open}
              className="lg:hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>

        {/* Full-width Search Overlay (Mobile/Tablet) */}
        {showMobileSearch && (
          <div className="absolute inset-0 bg-white dark:bg-[#08090d] flex items-center px-4 sm:px-6 gap-3 z-50 animate-scale-up">
            <form
              className="relative flex-1 flex items-center"
              onSubmit={submitSearch}
            >
              <Search className="absolute left-3.5 size-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold bg-slate-100/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-full focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
                placeholder="Search products..."
                aria-label="Search products"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </form>
            <Button
              variant="ghost"
              onClick={() => setShowMobileSearch(false)}
              className="rounded-full text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Mobile Slide-down Drawer */}
        {open && (
          <div className="lg:hidden absolute left-0 right-0 top-full border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0c0d11]/95 backdrop-blur-md shadow-xl p-5 z-50 animate-scale-up">
            {/* Mobile Navigation Links */}
            <ul className="flex flex-col space-y-2 mb-6">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 ${
                        active
                          ? "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 border border-slate-200/20 dark:border-white/5 shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Full-width Download CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
              <Button
                onClick={handleOpenLeadModal}
                disabled={
                  downloadState === "downloading" || downloadState === "loading"
                }
                className={`w-full relative flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold border transition-all duration-300 cursor-pointer overflow-hidden ${
                  downloadState === "success"
                    ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : downloadState === "error"
                      ? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/25"
                      : "bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-transparent shadow-xs"
                }`}
              >
                {downloadState === "idle" && (
                  <>
                    <Download className="size-3.5 animate-bounce-subtle" />
                    <span>Download Official Catalog</span>
                  </>
                )}
                {downloadState === "loading" && (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Checking Catalogs...</span>
                  </>
                )}
                {downloadState === "downloading" && (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Downloading PDF Brochure...</span>
                  </>
                )}
                {downloadState === "success" && (
                  <>
                    <Check className="size-3.5 animate-scale-up" />
                    <span>Saved to Device!</span>
                  </>
                )}
                {downloadState === "error" && (
                  <span>Error downloading - Retry</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default function Navigation() {
  return (
    <React.Suspense
      fallback={
        <div className="h-16.25 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-[#08090d]/80" />
      }
    >
      <NavigationContent />
    </React.Suspense>
  );
}
