"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

type AdminDashboardShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function AdminDashboardShell({
  children,
  title = "Dashboard",
  subtitle = "Hindustaan Innovations Admin Suite",
}: AdminDashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Overview Hub",
      href: "/admin",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.75 6A2.25 2.25 0 016 3.75h3A2.25 2.25 0 0111.25 6v3a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 9V6zM3.75 15a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-3zM12.75 6a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25V6zM12.75 15a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-3a2.25 2.25 0 01-2.25-2.25v-3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Products Catalog",
      href: "/admin/products",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.25 7.5L12 12L3.75 7.5M20.25 7.5V16.5L12 21L3.75 16.5V7.5M20.25 7.5L12 3L3.75 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Brand & Watermarks",
      href: "/admin/settings",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.59 4.59A2 2 0 1111 8H2.414a2 2 0 01-.586-1.414V2.414A2 2 0 013.243.586L9.59 4.59zM10.5 6a3.75 3.75 0 11-7.5 0A3.75 3.75 0 0110.5 6zm10.233 6.33A5.25 5.25 0 0010.5 10v6.75M12 18h8.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Dealer Leads",
      href: "/admin/leads",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Customer Reviews",
      href: "/admin/reviews",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.12 2.99 2.73 3.19l.71.09a1.5 1.5 0 011.08.62L10.5 21l3.73-4.34a1.5 1.5 0 011.08-.62h1.44c3.48 0 6.25-2.77 6.25-6.25S20.23 3.5 16.75 3.5H7.25c-3.48 0-6.25 2.77-6.25 6.25v1.01z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Brochures & Catalogs",
      href: "/admin/catalogs",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Download Leads",
      href: "/admin/download-leads",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Banking Details",
      href: "/admin/banking",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      name: "Subscribers",
      href: "/admin/subscribers",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#07080a] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Navigation - Sticky Desktop */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-slate-200/60 dark:border-white/5 bg-[#ffffff] dark:bg-[#0b0c10] p-6 gap-6 sticky top-0 h-screen select-none">
        {/* Branding Logo */}
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-white/5 pb-5">
          <p className="text-[16px] font-bold uppercase tracking-[0.25em] text-red-700 dark:text-red-400">
            PTC Furnitures
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Admin Page
          </h1>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-red-700 dark:text-red-400"
                      : "text-slate-400 dark:text-slate-500"
                  }
                >
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Exit link */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/5 bg-[#ffffff] dark:bg-[#0b0c10] sticky top-0 z-50">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
            Hindustaan Innovations
          </p>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Furniture Studio
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300">
          <nav className="flex flex-col w-72 bg-[#ffffff] dark:bg-[#0b0c10] h-full p-6 gap-6 shadow-2xl relative animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
                  HI Studio
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Admin Panel
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={
                        isActive
                          ? "text-red-700 dark:text-red-400"
                          : "text-slate-400 dark:text-slate-500"
                      }
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Exit Dashboard
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main Panel Content Wrap */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Pages Stage */}
        <main className="flex-1 px-6 md:px-10 py-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
