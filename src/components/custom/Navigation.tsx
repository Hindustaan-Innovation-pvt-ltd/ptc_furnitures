"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Search, Download, Loader2, Check, Menu, X } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";

function NavigationContent() {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [downloadState, setDownloadState] = React.useState<"idle" | "loading" | "downloading" | "success" | "error">("idle");
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        setSearchValue(searchParams.get("q") ?? "")
    }, [searchParams])

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
        setOpen(false)
    }

    function clearSearch() {
        setSearchValue("");
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete("q");
        const queryString = nextParams.toString();
        router.push(`/collections${queryString ? `?${queryString}` : ""}`);
        setOpen(false);
    }

    React.useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false)
        }

        if (open) {
            window.addEventListener("keydown", onKey)
        }

        return () => window.removeEventListener("keydown", onKey)
    }, [open])

    function isActive(path: string) {
        return pathname === path;
    }

    async function handleDownloadCatalog() {
        if (downloadState !== "idle") return;
        setDownloadState("loading");
        try {
            const res = await fetch("/api/catalogs");
            if (!res.ok) throw new Error("Failed to fetch catalogs");
            const data = await res.json();

            const pdfCatalogs = (data.catalogs || []).filter((c: any) => c.type === "pdf" && c.pdfUrl);
            let downloadUrl = "/uploads/catalogs/ptc-furniture-brochure-2026.pdf";
            let fileName = "ptc-furniture-brochure-2026.pdf";

            if (pdfCatalogs.length > 0) {
                const latestPdf = pdfCatalogs[0];
                downloadUrl = latestPdf.pdfUrl;
                fileName = latestPdf.pdfUrl.split("/").pop() || "ptc-furniture-brochure.pdf";
            }

            setDownloadState("downloading");

            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Catalog brochure file is not available");
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
                    0% { transform: scale(0.92); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-subtle {
                    animation: bounceSubtle 2s infinite ease-in-out;
                }
                .animate-scale-up {
                    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-[#08090d]/80 transition-all duration-300 shadow-xs">
                <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                    {/* Logo & Navigation Links */}
                    <div className="flex items-center gap-6 lg:gap-10">
                        <Link href="/" className="transition-transform duration-200 active:scale-95">
                            <Image src="/logo-dark.svg" alt="PTC Furniture Logo" width={120} height={38} className="block w-24 sm:w-26 dark:hidden" style={{ height: "auto" }} priority />
                            <Image src="/logo-white.svg" alt="PTC Furniture Logo" width={120} height={38} className="hidden w-24 sm:w-26 dark:block" style={{ height: "auto" }} priority />
                        </Link>

                        <ul className="hidden sm:flex items-center gap-1 text-sm">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`relative px-3.5 py-1.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all duration-300 ${active
                                                ? "bg-slate-900/5 dark:bg-white/5 border border-slate-200/30 dark:border-white/5 text-red-600 dark:text-red-400 shadow-xs"
                                                : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Desktop Search, Download & Theme Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-3">
                            {/* Search Form */}
                            <form className="relative flex items-center group" onSubmit={submitSearch}>
                                <Search className="absolute left-3 size-3.5 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors group-focus-within:text-red-500" />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    className={`pl-9 py-1.5 text-xs font-semibold bg-slate-100/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 rounded-full focus:outline-none focus:border-red-500 dark:focus:border-red-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-red-500/10 text-slate-800 dark:text-slate-200 transition-all duration-300 placeholder:text-slate-400/90 placeholder:font-normal ${
                                        searchValue ? "w-52 pr-8" : "w-32 pr-4 focus:w-52 focus:pr-8"
                                    }`}
                                    placeholder="Search products..."
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

                            {/* Dedicated Download Catalog CTA */}
                            <Button
                                onClick={handleDownloadCatalog}
                                disabled={downloadState === "downloading" || downloadState === "loading"}
                                className={`relative flex items-center gap-2 rounded-full px-4.5 py-1.5 text-xs font-bold border transition-all duration-300 cursor-pointer overflow-hidden ${downloadState === "success"
                                    ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/25"
                                    : downloadState === "error"
                                        ? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/25"
                                        : "bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-transparent shadow-xs hover:shadow-md hover:shadow-red-500/20 dark:from-red-700 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-500"
                                    }`}
                            >
                                {downloadState === "idle" && (
                                    <>
                                        <Download className="size-3.5 animate-bounce-subtle" />
                                        <span className="hidden md:inline">Download Catalog</span>
                                        <span className="inline md:hidden">Catalog</span>
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
                                    <>
                                        <span className="text-xs">Retry Download</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Theme Toggler */}
                        <div className="flex items-center">
                            <AnimatedThemeToggler />
                        </div>

                        {/* Mobile Menu Trigger */}
                        <button
                            aria-expanded={open}
                            className="sm:hidden rounded-full p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10 active:scale-95"
                            aria-label={open ? "Close menu" : "Open menu"}
                            onClick={() => setOpen((v) => !v)}
                        >
                            {open ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Slide-down Drawer */}
                {open && (
                    <div className="sm:hidden absolute left-0 right-0 top-full border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0c0d11]/95 backdrop-blur-md shadow-xl p-5 z-50 animate-scale-up">
                        {/* Mobile Search */}
                        <form className="relative mb-5 flex items-center" onSubmit={submitSearch}>
                            <Search className="absolute left-3.5 size-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                className="w-full pl-10 pr-10 py-2 text-xs font-semibold bg-slate-100/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-full focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
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

                        {/* Mobile Navigation Links */}
                        <ul className="flex flex-col space-y-2 mb-6">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={`block px-4 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 ${active
                                                ? "bg-slate-900/5 dark:bg-white/5 text-red-600 dark:text-red-400 border border-slate-200/20 dark:border-white/5 shadow-xs"
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
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                            <Button
                                onClick={handleDownloadCatalog}
                                disabled={downloadState === "downloading" || downloadState === "loading"}
                                className={`w-full relative flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold border transition-all duration-300 cursor-pointer overflow-hidden ${downloadState === "success"
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
                                    <>
                                        <span>Error downloading - Retry</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </header>
        </>
    )
}

export default function Navigation() {
    return (
        <React.Suspense fallback={<div className="h-16.25 w-full border-b border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-[#08090d]/80" />}>
            <NavigationContent />
        </React.Suspense>
    );
}
