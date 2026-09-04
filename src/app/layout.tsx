import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import ScrollToTop from "@/components/custom/ScrollToTop";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ptcfurnitures.in"),
  title: {
    default: "PTC Furnitures | Modern Commercial & Home Furniture",
    template: "%s | PTC Furnitures",
  },
  description:
    "Explore premium furniture collections, ergonomic seating solutions, digital portfolios, and catalogs by PTC Furnitures.",
  keywords: [
    "PTC Furnitures",
    "commercial furniture",
    "office chairs",
    "ergonomic chairs",
    "furniture collections",
    "furniture manufacturer",
    "interior design furniture",
  ],
  authors: [{ name: "PTC Furnitures" }],
  creator: "PTC Furnitures",
  publisher: "PTC Furnitures",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ptcfurnitures.in",
    siteName: "PTC Furnitures",
    title: "PTC Furnitures | Modern Commercial & Home Furniture",
    description:
      "Explore premium furniture collections, ergonomic seating solutions, digital portfolios, and catalogs by PTC Furnitures.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PTC Furnitures Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PTC Furnitures | Modern Commercial & Home Furniture",
    description:
      "Explore premium furniture collections, ergonomic seating solutions, digital portfolios, and catalogs by PTC Furnitures.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo-white.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FurnitureStore",
      "@id": "https://ptcfurnitures.in/#organization",
      name: "PTC Furnitures",
      alternateName: "Pankaj Trading Company",
      url: "https://ptcfurnitures.in",
      logo: {
        "@type": "ImageObject",
        url: "https://ptcfurnitures.in/logo-white.svg",
      },
      image: "https://ptcfurnitures.in/og-image.png",
      description:
        "Leading manufacturer and supplier of ergonomic chairs, commercial workspaces, and modern furniture collections.",
      email: "pankajtradingco.14@gmail.com",
      telephone: "+919294512259",
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, Bank Transfer, UPI, NEFT, RTGS",
      areaServed: [
        {
          "@type": "State",
          name: "Chhattisgarh",
        },
        {
          "@type": "State",
          name: "Odisha",
        },
        {
          "@type": "Country",
          name: "India",
        },
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://ptcfurnitures.in/#website",
      url: "https://ptcfurnitures.in",
      name: "PTC Furnitures",
      publisher: {
        "@id": "https://ptcfurnitures.in/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://ptcfurnitures.in/collections?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""}
      />
      <body className="min-h-screen overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Suspense fallback={null}>
              <ScrollToTop />
            </Suspense>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
