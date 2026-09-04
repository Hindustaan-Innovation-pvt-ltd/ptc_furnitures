import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/custom/BreadcrumbJsonLd";
import ContactForm from "@/components/custom/ContactForm";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with PTC Furnitures for orders, custom furniture quotes, dealer inquiries, and support.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen dark:bg-[#08090d]">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ]}
      />
      <Navigation />

      <header className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
          Contact Us.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 sm:text-base">
          Questions about an order, partnership inquiries, or press — we’d love
          to hear from you.
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#0f1116]">
            <h2 className="text-2xl font-semibold">Get in touch</h2>
            <p className="mt-2 text-sm text-slate-500 mb-6">
              Fill out the form below and we’ll respond within 1–2 business
              days.
            </p>

            <ContactForm />
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-stone-900">
            <h3 className="text-lg font-semibold">Contact details</h3>
            <p className="mt-3 text-sm text-slate-500">
              Prefer email? Reach us at{" "}
              <a
                className="font-medium text-red-600"
                href="mailto:pankajtradingco.14@gmail.com"
              >
                pankajtradingco.14@gmail.com
              </a>
            </p>

            <div className="mt-6 space-y-4 text-sm text-slate-500">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Address
                </div>
                <div>Rishab Complex, B-14, MG Rd, Moudhapara, Raipur, Chhattisgarh 492001</div>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Customer care
                </div>
                <div>Mon–Sat, 11:30am–7:00pm IST</div>
              </div>
            </div>
          </aside>
        </div>

        {/* Google Maps Location */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
            Our Store Location
          </h2>
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-[#0f1116] shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d464.82457516957976!2d81.63249849386575!3d21.247839319215196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dd245a0cfd7b%3A0xfbdf82e4eea44f8f!2sPankaj%20Trading%20Company!5e0!3m2!1sen!2sin!4v1780579823173!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full border-0 filter contrast-105 dark:contrast-85 dark:opacity-100 transition-all duration-300"
            ></iframe>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
