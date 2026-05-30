"use client";

import Image from "next/image";

const collections = ["Chairs", "Tables", "Lighting", "Storage"];
const company = ["About PTC", "Our Story", "Careers", "Press", "Sustainability"];
const legal = ["Privacy Policy", "Terms of Use", "Cookie Settings", "Accessibility"];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#08090d] text-slate-200 transition-colors duration-300">
            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
                    <div>
                        <Image src="/logo-light.png" alt="PTC Furniture" width={160} height={56} className="h-12 w-auto object-contain sm:h-14" style={{ width: "auto" }} priority />
                        <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone-400">
                            Curated furniture for considered living. Crafted with intention, built to endure.
                        </p>

                        <div className="mt-7 flex items-center gap-3">
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition hover:border-slate-300 hover:text-white"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
                                    <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.7" />
                                    <circle cx="17.2" cy="6.9" r="1" fill="currentColor" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                aria-label="Twitter"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition hover:border-slate-300 hover:text-white"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M19.4 7.2c-.5.2-1 .4-1.6.4.6-.4 1-.9 1.2-1.6-.5.3-1.1.6-1.8.7a2.9 2.9 0 0 0-5 2c0 .2 0 .4.1.6-2.4-.1-4.6-1.3-6-3.1a3 3 0 0 0 .9 3.9c-.4 0-.8-.1-1.2-.3v.1c0 1.4 1 2.6 2.4 2.9-.2.1-.5.1-.8.1h-.5c.3 1.1 1.3 1.9 2.6 1.9A5.9 5.9 0 0 1 5 16.9a8.4 8.4 0 0 0 4.6 1.3c5.5 0 8.5-4.6 8.5-8.5v-.4c.6-.4 1-.9 1.4-1.5Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </a>
                            <a
                                href="#"
                                aria-label="YouTube"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition hover:border-slate-300 hover:text-white"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <rect x="2.8" y="6.2" width="18.4" height="11.6" rx="3.2" stroke="currentColor" strokeWidth="1.7" />
                                    <path d="M10 9.5 15 12l-5 2.5V9.5Z" fill="currentColor" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <FooterColumn title="Collections" links={collections} />
                    <FooterColumn title="Company" links={company} />
                    <FooterColumn title="Legal" links={legal} />
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs tracking-wide sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-slate-300">© 2025 PTC Furniture. All rights reserved.</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        {
                            ["Visa", "Mastercard", "American Express", "PayPal"].map((card) => (
                                <span key={card} className="inline-block border border-white/20 px-2 py-1 text-xs text-stone-400 rounded-sm">
                                    {card}
                                </span>
                            ))
                        }
                    </div>
                </div>
            </div>
        </footer>
    );
}

type FooterColumnProps = {
    title: string;
    links: string[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{title}</h3>
            <ul className="mt-5 space-y-3">
                {links.map((link) => (
                    <li key={link}>
                        <a href="#" className="text-base text-stone-300 transition hover:text-stone-100">
                            {link}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
