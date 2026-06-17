"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const company = [
  "About PTC",
  "Brochures & Catalogs",
  "Authorized Dealers",
  "Contact Us",
  "Payment Details",
];
const legal = [
  "Privacy Policy",
  "Terms of Use",
];

export default function Footer() {
  const [bankNames, setBankNames] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await fetch("/api/banking");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.entries)) {
            const activeBanks = data.entries
              .filter((e: any) => e.isActive !== false && e.bankName)
              .map((e: any) => e.bankName.trim());
            const uniqueBanks = Array.from(new Set(activeBanks)) as string[];
            if (uniqueBanks.length > 0) {
              setBankNames(uniqueBanks);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load footer bank names:", err);
      }
    }
    async function fetchBrands() {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.brands)) {
            setCollections(data.brands);
          }
        }
      } catch (err) {
        console.error("Failed to load footer brands:", err);
      }
    }
    fetchBanks();
    fetchBrands();
  }, []);

  return (
    <footer className="border-t border-white/10 bg-[#08090d] text-slate-200 transition-colors duration-300">
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/logo-white.svg"
              alt="PTC Furniture"
              width={160}
              height={56}
              className="h-12 w-auto object-contain sm:h-14"
              style={{ width: "auto" }}
              priority
            />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone-400">
              Curated furniture for considered living. Crafted with intention,
              built to endure.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {[
                {
                  icon: (
                    <svg
                      width="48"
                      height="48"
                      className="size-5 stroke-white"
                      viewBox="0 0 48 48"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                  link: "https://www.instagram.com/ptc_furnitures/",
                },
                {
                  icon: (
                    <svg
                      width="512"
                      height="512"
                      viewBox="0 0 512 512"
                      className="size-5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M141.825 430.814L149.53 435.381C181.902 454.591 219.016 464.751 256.863 464.772H256.945C373.175 464.772 467.774 370.195 467.823 253.956C467.84 197.623 445.93 144.654 406.114 104.809C366.295 64.9651 313.354 43.0085 257.024 42.9854C140.703 42.9854 46.1062 137.549 46.06 253.784C46.0442 293.616 57.1886 332.408 78.2997 365.975L83.319 373.949L62.0096 451.741L141.825 430.814ZM1.09326 512L37.0883 380.571C14.8872 342.106 3.20632 298.47 3.22335 253.767C3.27931 113.921 117.092 0.14505 256.945 0.14505C324.813 0.174246 388.514 26.5894 436.419 74.528C484.318 122.47 510.687 186.197 510.664 253.973C510.604 393.812 396.776 507.608 256.945 507.608C256.936 507.608 256.951 507.608 256.945 507.608H256.836C214.376 507.591 172.652 496.942 135.594 476.732L1.09326 512Z"
                        fill="white"
                      />
                      <path
                        d="M11.8015 253.566C11.8015 297.05 23.1667 339.052 44.9086 376.112L9.825 503.105L139.783 469.009C175.36 488.775 215.879 498.657 256.893 498.657C391.792 498.657 501.984 388.959 501.984 254.06C501.984 188.34 476.289 127.067 430.334 80.6187C383.886 34.6641 322.613 8.96912 256.893 8.96912C121.994 8.96912 11.8015 118.667 11.8015 253.566Z"
                        fill="url(#paint0_linear_613_187)"
                      />
                      <path
                        d="M3.04794 253.368C3.04794 298.411 14.8206 341.919 37.3422 380.308L1.00052 511.855L135.618 476.537C172.472 497.011 214.444 507.248 256.928 507.248C396.664 507.248 510.808 393.617 510.808 253.88C510.808 185.803 484.192 122.333 436.589 74.219C388.475 26.6164 325.005 0 256.928 0C117.192 0 3.04794 113.632 3.04794 253.368ZM83.4092 373.654L78.2906 365.976C57.3046 332.194 46.0438 293.293 46.0438 253.88C46.0438 137.177 140.737 42.9958 256.928 42.9958C313.232 42.9958 366.465 65.0056 405.878 104.418C445.803 144.343 467.812 197.576 467.812 253.88C467.812 370.071 373.119 464.764 256.928 464.764C219.051 464.764 181.685 454.527 149.438 435.077L141.761 430.47L61.9113 451.456L83.4092 373.654Z"
                        fill="url(#paint1_linear_613_187)"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M193.533 147.829C188.784 137.273 183.785 137.061 179.267 136.876C175.572 136.718 171.341 136.728 167.118 136.728C162.892 136.728 156.022 138.315 150.214 144.659C144.402 151.003 128.023 166.339 128.023 197.528C128.023 228.722 150.742 258.861 153.909 263.094C157.079 267.322 197.766 333.373 262.203 358.784C315.756 379.901 326.653 375.701 338.277 374.645C349.901 373.588 375.784 359.312 381.067 344.509C386.351 329.707 386.351 317.02 384.766 314.369C383.18 311.726 378.954 310.141 372.614 306.971C366.274 303.801 335.107 288.462 329.294 286.349C323.483 284.236 319.256 283.179 315.03 289.525C310.802 295.866 298.66 310.141 294.961 314.369C291.263 318.606 287.565 319.134 281.224 315.963C274.884 312.783 254.466 306.096 230.244 284.5C211.398 267.697 198.675 246.946 194.976 240.6C191.277 234.259 194.58 230.825 197.76 227.665C200.607 224.824 204.101 220.265 207.271 216.563C210.434 212.861 211.491 210.219 213.604 205.992C215.717 201.758 214.661 198.056 213.076 194.886C211.491 191.716 199.17 160.364 193.533 147.829Z"
                        fill="white"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_613_187"
                          x1="255.877"
                          y1="503.105"
                          x2="255.877"
                          y2="8.96912"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#20B038" />
                          <stop offset="1" stopColor="#60D66A" />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_613_187"
                          x1="255.882"
                          y1="511.855"
                          x2="255.882"
                          y2="0"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#F9F9F9" />
                          <stop offset="1" stopColor="white" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                  link: "https://wa.me/+917880002245",
                },
              ].map((item, i) => (
                <Link
                  href={item.link}
                  target="_blank"
                  key={i}
                  className="border-2 p-2 rounded-full"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          <FooterColumn title="Collections" links={collections} />
          <FooterColumn title="Company" links={company} />
          <FooterColumn title="Legal" links={legal} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs tracking-wide sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-slate-300">
              &copy;2026 PTC Furniture. All rights reserved.
            </p>
            <p className="text-slate-500 mt-1 text-[11px]">
              Made with 🤍 by <span className="font-semibold text-[#ffffff]">Hindustaan Innovations Pvt. Ltd.</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {(bankNames.length > 0 ? bankNames : []).map((card) => (
              <Link
                key={card}
                href={`/payment?bank=${encodeURIComponent(card.trim().toLowerCase().replace(/\s+/g, "-"))}`}
                className="inline-block border border-white/20 px-2.5 py-1 text-xs text-stone-400 hover:text-stone-200 hover:border-white/40 rounded-sm transition-all duration-300 hover:bg-white/5 cursor-pointer active:scale-95"
              >
                {card}
              </Link>
            ))}
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
  const getHref = (link: string) => {
    if (link === "Brochures & Catalogs") return "/catalogs";
    if (link === "About PTC" || link === "Our Story") return "/about";
    if (link === "Authorized Dealers") return "/dealers";
    if (link === "Contact Us") return "/contact";
    if (link === "Payment Details") return "/payment";
    if (link === "Privacy Policy") return "/privacy-policy";
    if (link === "Terms of Use") return "/terms-of-use";

    if (company.includes(link) || legal.includes(link)) {
      return "#";
    }

    return `/collections?q=${encodeURIComponent(link)}`;
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => {
          const href = getHref(link);
          const isExternal = href === "#";
          return (
            <li key={link}>
              {isExternal ? (
                <a
                  href={href}
                  className="text-base text-stone-300 transition hover:text-stone-100"
                >
                  {link}
                </a>
              ) : (
                <Link
                  href={href}
                  className="text-base text-stone-300 transition hover:text-stone-100"
                >
                  {link}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
