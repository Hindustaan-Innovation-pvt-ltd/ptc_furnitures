import type { Metadata } from "next";
import type React from "react";
import BreadcrumbJsonLd from "@/components/custom/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Authorized Dealers & Showroom Partners",
  description:
    "Join our partner showroom network. Unlock wholesale catalog pricing, custom showroom credits, and priority fabrication with PTC Furnitures.",
  alternates: {
    canonical: "/dealers",
  },
};

const dealerFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I become an authorized dealer for PTC Furnitures?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can submit your business details via our Authorized Dealer registration form. Our team reviews submissions within 1-2 business days to verify trade credentials and approve catalog access.",
      },
    },
    {
      "@type": "Question",
      name: "What trade discounts do authorized dealers receive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Authorized trade partners receive multi-tier wholesale pricing of up to 45% off retail lists along with tax exemption workflows and priority fabrication.",
      },
    },
    {
      "@type": "Question",
      name: "Which regions do you supply and ship to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We provide prioritized freight and logistics throughout Chhattisgarh, Odisha, and nationwide across India.",
      },
    },
  ],
};

export default function DealersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Dealers", url: "/dealers" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerFaqSchema) }}
      />
      {children}
    </>
  );
}
