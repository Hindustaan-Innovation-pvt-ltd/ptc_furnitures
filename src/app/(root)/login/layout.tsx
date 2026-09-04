import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
