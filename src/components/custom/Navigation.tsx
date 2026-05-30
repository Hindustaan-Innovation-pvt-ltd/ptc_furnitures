"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export default function Navigation() {
    const [open, setOpen] = React.useState(false);

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
        const location = usePathname();
        return location === path;
    }

    return (
        <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#08090d]/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-[#08090d]/70 transition-colors duration-300">
            <nav className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div aria-label='logo' className="flex items-center gap-6 sm:gap-8 lg:gap-12">
                    <Link href="/">
                        <Image src="/logo-ldark.png" alt="PTC Furniture Logo" width={128} height={40} className="block w-24 sm:w-28 dark:hidden" style={{ height: "auto" }} priority />
                        <Image src="/logo-light.png" alt="PTC Furniture Logo" width={128} height={40} className="hidden w-24 sm:w-28 dark:block" style={{ height: "auto" }} priority />
                    </Link>
                    <ul className="hidden sm:flex flex-wrap gap-x-4 gap-y-2 text-sm overflow-x-auto">
                        <li><Link href="/collections" className={isActive("/collections") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Collections</Link></li>
                        <li>
                            <Link href="/contact" className={isActive("/contact") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Contacts</Link>
                        </li>
                        <li><Link href="/about" className={isActive("/about") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>About</Link></li>
                    </ul>
                </div>
                <div className="flex items-center gap-2">
                    <div aria-label='icons' className="flex items-center gap-2">
                        <div className="relative hidden sm:block w-11 overflow-hidden rounded-full p-3 transition-[width,background-color,border-color,box-shadow] duration-300 ease-out hover:w-56 focus-within:w-56 hover:border-slate-300 hover:border focus-within:border-slate-300 focus-within:shadow-lg focus-within:shadow-black/10 dark:border-stone-700/90 dark:hover:border-stone-500 dark:focus-within:border-stone-500 motion-reduce:transition-none xl:w-12 xl:hover:w-60 xl:focus-within:w-60">
                            <svg width="24" height="24" className="size-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M19.5304 17.4698C19.2375 17.1769 18.7626 17.1769 18.4697 17.4698C18.1768 17.7626 18.1768 18.2375 18.4697 18.5304L19.0001 18.0001L19.5304 17.4698ZM22.4696 22.5304C22.7625 22.8233 23.2374 22.8233 23.5303 22.5304C23.8232 22.2375 23.8232 21.7626 23.5303 21.4697L23 22L22.4696 22.5304ZM9.33512 4.80232C9.74423 4.73752 10.0234 4.35334 9.95856 3.94423C9.89376 3.53511 9.50958 3.25599 9.10047 3.32079L9.21779 4.06155L9.33512 4.80232ZM4.32076 8.1005C4.25596 8.50961 4.53508 8.89379 4.9442 8.95859C5.35331 9.02339 5.73749 8.74426 5.80229 8.33515L5.06152 8.21782L4.32076 8.1005ZM19.0001 18.0001L18.4697 18.5304L22.4696 22.5304L23 22L23.5303 21.4697L19.5304 17.4698L19.0001 18.0001ZM11 19V18.25C6.44365 18.25 2.75 14.5563 2.75 10H2H1.25C1.25 15.3848 5.61522 19.75 11 19.75V19ZM20 10H19.25C19.25 14.5563 15.5563 18.25 11 18.25V19V19.75C16.3848 19.75 20.75 15.3848 20.75 10H20ZM11 1V1.75C15.5563 1.75 19.25 5.44365 19.25 10H20H20.75C20.75 4.61522 16.3848 0.25 11 0.25V1ZM11 1V0.25C5.61522 0.25 1.25 4.61522 1.25 10H2H2.75C2.75 5.44365 6.44365 1.75 11 1.75V1ZM9.21779 4.06155L9.10047 3.32079C6.64008 3.71047 4.71044 5.64012 4.32076 8.1005L5.06152 8.21782L5.80229 8.33515C6.09032 6.51661 7.51658 5.09035 9.33512 4.80232L9.21779 4.06155Z" fill="currentColor" />
                            </svg>
                            <input type="text" className="absolute inset-0 w-full border-none bg-transparent pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100" placeholder="Search" />
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full hidden sm:block">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.7887 6.70105C8.1759 6.55391 8.3705 6.12074 8.22336 5.73354C8.07622 5.34635 7.64306 5.15174 7.25586 5.29888C6.68511 5.51577 6.1333 5.8684 5.61708 6.38021C4.96274 7.02896 4.5268 7.76564 4.28318 8.55569C4.16112 8.95151 4.38305 9.37133 4.77887 9.49339C5.17469 9.61545 5.59451 9.39352 5.71657 8.9977C5.88653 8.44654 6.19143 7.92304 6.67318 7.44541C7.05146 7.07036 7.428 6.83812 7.7887 6.70105Z" fill="#2D264B" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M20.8468 3.93557C19.5193 2.58173 18.0414 2.16291 16.6535 2.26451C15.3031 2.36337 14.087 2.94914 13.1988 3.51257C12.4984 3.95689 11.5014 3.95689 10.8009 3.51257C9.9127 2.94915 8.6966 2.36338 7.34624 2.26453C5.95834 2.16293 4.48046 2.58175 3.1529 3.93557C1.58562 5.53386 1.0939 7.50689 1.29136 9.50265C1.48653 11.4754 2.35186 13.4808 3.50598 15.2578C4.66317 17.0396 6.14136 18.6392 7.62433 19.8008C9.07467 20.9368 10.6527 21.75 11.9999 21.75C13.3471 21.75 14.9251 20.9368 16.3754 19.8008C17.8584 18.6392 19.3366 17.0396 20.4938 15.2578C21.6479 13.4808 22.5132 11.4754 22.7084 9.50265C22.9058 7.50688 22.4141 5.53386 20.8468 3.93557ZM14.0023 4.77922C14.7877 4.28097 15.7599 3.83394 16.763 3.76051C17.7285 3.68983 18.7692 3.95923 19.7758 4.98579C20.9791 6.21282 21.3774 7.71987 21.2157 9.35497C21.0516 11.0131 20.3084 12.7893 19.2358 14.4408C18.1663 16.0876 16.7996 17.5632 15.4505 18.6199C14.0688 19.7021 12.8278 20.25 11.9999 20.25C11.172 20.25 9.93093 19.7021 8.54926 18.6199C7.20021 17.5632 5.83348 16.0876 4.76394 14.4408C3.69132 12.7893 2.94812 11.0131 2.78407 9.35497C2.6223 7.71987 3.02067 6.21283 4.2239 4.98579C5.23053 3.95925 6.27119 3.68984 7.23672 3.76052C8.23978 3.83395 9.21197 4.28098 9.99742 4.77922C11.1883 5.53467 12.8114 5.53467 14.0023 4.77922Z" fill="currentColor" />
                            </svg>
                        </Button>
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
                    <ul className="flex flex-col space-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        <li><Link href="/collections" onClick={() => setOpen(false)} className={isActive("/collections") ? "text-red-500 underline underline-offset-4 font-medium" : "text-stone-500 font-medium dark:text-slate-200"}>Collections</Link></li>
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
