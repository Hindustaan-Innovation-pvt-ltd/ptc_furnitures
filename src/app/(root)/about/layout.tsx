import type { Metadata } from "next";
import type React from "react";
import BreadcrumbJsonLd from "@/components/custom/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "About Us | Our Story",
  description:
    "Learn about PTC Furnitures — 40+ years of craftsmanship, delivering ergonomic seating and innovative furniture solutions.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about" },
        ]}
      />
      {children}
    </>
  );
}
