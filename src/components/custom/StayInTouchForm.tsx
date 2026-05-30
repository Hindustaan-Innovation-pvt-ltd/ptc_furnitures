"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function StayInTouchForm() {
    const [email, setEmail] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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

            <Button variant="destructive" size="lg" type="submit" className="w-full rounded-full px-8 sm:w-auto">
                Subscribe
            </Button>
        </form>
    );
}