"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export default function Navigation() {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
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
        } else {
            nextParams.delete("q");
        }

        const queryString = nextParams.toString();
        router.push(`/collections${queryString ? `?${queryString}` : ""}`);
        setOpen(false)
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

    return (
        <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#08090d]/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-[#08090d]/70 transition-colors duration-300">
            <nav className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div aria-label='logo' className="flex items-center gap-6 sm:gap-8 lg:gap-12">
                    <Link href="/">
                        <Image src="/logo-dark.svg" alt="PTC Furniture Logo" width={128} height={40} className="block w-24 sm:w-28 dark:hidden" style={{ height: "auto" }} priority />
                        <Image src="/logo-white.svg" alt="PTC Furniture Logo" width={128} height={40} className="hidden w-24 sm:w-28 dark:block" style={{ height: "auto" }} priority />
                    </Link>
                    <ul className="hidden sm:flex flex-wrap gap-x-4 gap-y-2 text-sm overflow-x-auto">
                        <li><Link href="/collections" className={isActive("/collections") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Collections</Link></li>
                        <li><Link href="/catalogs" className={isActive("/catalogs") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Catalogs</Link></li>
                        <li>
                            <Link href="/contact" className={isActive("/contact") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Contacts</Link>
                        </li>
                        <li><Link href="/about" className={isActive("/about") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>About</Link></li>
                    </ul>
                </div>
                <div className="flex items-center gap-2">
                    <div aria-label='icons' className="flex items-center gap-2">
                        <form className="hidden sm:flex items-center gap-2" onSubmit={submitSearch}>
                            <div className="relative w-8 overflow-hidden rounded-full p-3 transition-[width,background-color,border-color,box-shadow] duration-300 ease-out hover:w-56 focus-within:w-56 hover:border-slate-300 hover:border focus-within:border-slate-300 focus-within:shadow-lg focus-within:shadow-black/10 dark:border-stone-700/90 dark:hover:border-stone-500 dark:focus-within:border-stone-500 motion-reduce:transition-none xl:w-12 xl:hover:w-60 xl:focus-within:w-60">
                                <svg width="48" height="48" viewBox="0 0 48 48" className="size-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M42 42L33.3 33.3M38 22C38 30.8366 30.8366 38 22 38C13.1634 38 6 30.8366 6 22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    className="absolute inset-0 w-full border-none bg-transparent pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                                    placeholder="Search products"
                                    aria-label="Search products"
                                />
                            </div>
                            <Button type="submit" variant="ghost" size="icon" className="rounded-full" onClick={() => { }}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M28 20V25.3333C28 26.0406 27.719 26.7189 27.219 27.219C26.7189 27.719 26.0406 28 25.3333 28H6.66667C5.95942 28 5.28115 27.719 4.78105 27.219C4.28095 26.7189 4 26.0406 4 25.3333V20M22.6667 13.3333L16 20L9.33333 13.3333M16 20V4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Button>
                        </form>
                        <AnimatedThemeToggler />
                    </div>
                    <button aria-expanded={open} className="sm:hidden rounded-full p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>

                </div>
            </nav>
            {open && (
                <div className="sm:hidden absolute left-0 right-0 top-full border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0c0d11] shadow-lg p-4 z-50">
                    <form className="mb-4 flex items-center gap-2" onSubmit={submitSearch}>
                        <div className="relative flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
                                placeholder="Search products"
                                aria-label="Search products"
                            />
                        </div>
                        <Button type="submit" size="icon" variant="ghost" className="rounded-full">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M10.5 4.5C6.91015 4.5 4 7.41015 4 11C4 14.5899 6.91015 17.5 10.5 17.5C11.965 17.5 13.3167 17.0161 14.4062 16.2031L18.4395 20.2363C18.7324 20.5292 19.2072 20.5292 19.5001 20.2363C19.793 19.9434 19.793 19.4685 19.5001 19.1756L15.4668 15.1423C16.2798 14.0528 16.7637 12.7012 16.7637 11.2363C16.7637 7.64649 13.8536 4.73633 10.2637 4.73633C10.3438 4.73633 10.4219 4.73633 10.5 4.73633Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Button>
                    </form>
                    <ul className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        <li><Link href="/collections" onClick={() => setOpen(false)} className={isActive("/collections") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Collections</Link></li>
                        <li><Link href="/catalogs" onClick={() => setOpen(false)} className={isActive("/catalogs") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Catalogs</Link></li>
                        <li>
                            <Link href="/contact" onClick={() => setOpen(false)} className={isActive("/contact") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Contacts</Link>
                        </li>
                        <li><Link href="/about" onClick={() => setOpen(false)} className={isActive("/about") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>About</Link></li>
                    </ul>
                </div>
            )}
        </header >
    )
}
