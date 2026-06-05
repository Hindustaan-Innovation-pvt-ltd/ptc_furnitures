import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PTC Furniture",
  description: "Learn how PTC Furniture collects, uses, and protects your personal information and trade data.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: <Eye className="size-5 text-red-600 dark:text-red-400" />,
      title: "1. Information We Collect",
      content: (
        <div className="space-y-3">
          <p>
            We collect personal information that you voluntarily provide to us when you interact with our platform. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Dealer Applications:</strong> Full name, business details, phone number, city, and optional email address.
            </li>
            <li>
              <strong>Catalog Downloads:</strong> Name and mobile number collected to authorize access to our premium trade catalogs.
            </li>
            <li>
              <strong>Inquiries & Contact Forms:</strong> Name, phone number, subject, and the text of your message.
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: <Shield className="size-5 text-red-600 dark:text-red-400" />,
      title: "2. How We Use Your Information",
      content: (
        <div className="space-y-3">
          <p>
            The information we collect is used solely to facilitate our trade services and dealer program, specifically:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To review, process, and approve dealer applications.</li>
            <li>To track download statistics and measure catalog interest.</li>
            <li>To reply to customer support, inquiries, and custom requests.</li>
            <li>To send automated confirmation alerts via WhatsApp or SMS regarding your submitted requests.</li>
          </ul>
        </div>
      ),
    },
    {
      icon: <Lock className="size-5 text-red-600 dark:text-red-400" />,
      title: "3. Communications & Integration Partner Policy",
      content: (
        <div className="space-y-3">
          <p>
            Our site integrates with external systems to provide instant updates:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Google Analytics:</strong> We track anonymous usage statistics, search terms, and submission conversions to improve our user experience.
            </li>
            <li>
              <strong>SMS & WhatsApp Notifications:</strong> When you submit an inquiry, we route confirmation alerts via Twilio and WhatsApp to ensure timely updates. We do not sell or lease your phone number or trade profile to third-party brokers.
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: <FileText className="size-5 text-red-600 dark:text-red-400" />,
      title: "4. Payments & Offline Transactions",
      content: (
        <p>
          PTC Furniture displays bank transfer and UPI details directly on our Payment page. We do not collect, process, or store credit card numbers, CVVs, or online banking passwords. All payments are executed offline directly through your banking institution or UPI app.
        </p>
      ),
    },
    {
      icon: <Shield className="size-5 text-red-600 dark:text-red-400" />,
      title: "5. Data Retention & Security",
      content: (
        <p>
          We employ industry-standard administrative and technical security measures to safeguard your personal data. We retain lead submissions and catalog request records in our secure database for as long as necessary to fulfill the business objectives outlined in this policy, or to satisfy legal compliance requirements.
        </p>
      ),
    },
    {
      icon: <Eye className="size-5 text-red-600 dark:text-red-400" />,
      title: "6. Your Rights & Options",
      content: (
        <p>
          Depending on your location, you have the right to request access to, correction of, or deletion of the personal information we hold. If you have submitted a dealer application or contact form and wish to have your details removed from our active databases, please contact our privacy administrator.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navigation />

      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-40" />

      <header className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold tracking-wider uppercase mb-5">
          <Shield className="size-3.5" />
          Security & Trust
        </div>
        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight">
          Privacy <span className="text-red-700 dark:text-red-500">Policy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg leading-relaxed">
          Last updated: June 5, 2026. This policy outlines how we manage and safeguard your information at PTC Furniture.
        </p>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 pb-32 sm:px-6">
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/50 dark:border-white/5 dark:bg-[#0f1116]/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-100 dark:shadow-none space-y-10">
          
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                  {section.title}
                </h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-13">
                {section.content}
              </div>
              {idx < sections.length - 1 && (
                <hr className="border-slate-200/60 dark:border-white/5 pt-4" />
              )}
            </div>
          ))}

          {/* Contact box */}
          <div className="mt-12 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-[#111318]/30">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Mail className="size-4 text-red-600 dark:text-red-400" />
              Contact Privacy Admin
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-slate-400" />
                <span>privacy@ptcfurniture.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-slate-400" />
                <span>+91 92945 12259</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-slate-400" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
