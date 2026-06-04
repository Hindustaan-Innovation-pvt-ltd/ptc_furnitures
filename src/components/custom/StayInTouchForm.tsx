"use client";

import { type FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { sendGAEvent } from "@next/third-parties/google";

export default function StayInTouchForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) {
      sendGAEvent("event", "newsletter_subscribe", {
        subscriber_email: email.trim(),
      });
    }
    alert(`Subscribed: ${email}`);
    setEmail("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-2 flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
    >
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className="w-full rounded-full border-stone-600 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500"
      />

      <Button
        size="lg"
        type="submit"
        className="w-full rounded-full px-8 sm:w-auto bg-red-800 hover:bg-red-600 dark:bg-red-600/80 dark:hover:bg-red-500 text-white"
      >
        Subscribe
      </Button>
    </form>
  );
}
