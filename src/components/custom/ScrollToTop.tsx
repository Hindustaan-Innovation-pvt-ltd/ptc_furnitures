"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function ScrollToTop() {
  const pathname = usePathname();

  React.useEffect(() => {
    // Force the page to scroll to the top left on navigation
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
