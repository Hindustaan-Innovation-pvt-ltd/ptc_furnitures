"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function FloatingActionButton() {
  const router = useRouter();
  return (
    <div className="fixed bottom-8 right-6 z-50">
      <Button
        size="icon"
        variant="ghost"
        className="text-white rounded-full shadow-lg"
        onClick={() => {
          sendGAEvent("event", "whatsapp_click", {
            phone_number: "+91 7880002245",
          });
          if (typeof window !== "undefined") {
            window.open(
              "https://wa.me/+917880002245",
              "_blank",
              "noopener,noreferrer",
            );
          }
        }}
      >
        <Image
          src="/whatsapp.png"
          alt="Whatsapp"
          width={48}
          height={48}
        />
      </Button>
    </div>
  );
}
