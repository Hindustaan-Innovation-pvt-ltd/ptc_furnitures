import Footer from '@/components/custom/Footer'
import Navigation from '@/components/custom/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
    return (
        <div className="min-h-screen dark:bg-[#08090d]">
            <Navigation />

            <header className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
                <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">Contact Us.</h1>
                <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 sm:text-base">Questions about an order, partnership inquiries, or press — we’d love to hear from you.</p>
            </header>

            <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#0f1116]">
                        <h2 className="text-2xl font-semibold">Get in touch</h2>
                        <p className="mt-2 text-sm text-slate-500">Fill out the form below and we’ll respond within 1–2 business days.</p>

                        <form className="mt-6 grid gap-4" action="/api/contact" method="POST">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" placeholder="Your full name" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="your phone number" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="Order question, partnership, press..." />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message">Message</Label>
                                <textarea id="message" name="message" rows={8} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0b0b0b] dark:text-slate-100" placeholder="Write your message here..."></textarea>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" className="rounded-full px-6">Send message</Button>
                                <p className="text-sm text-slate-500">We respect your privacy — your message will not be shared.</p>
                            </div>
                        </form>
                    </section>

                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-stone-900">
                        <h3 className="text-lg font-semibold">Contact details</h3>
                        <p className="mt-3 text-sm text-slate-500">Prefer email? Reach us at <a className="font-medium text-red-600" href="mailto:pankajtradingco.14@gmail.com">pankajtradingco.14@gmail.com</a></p>

                        <div className="mt-6 space-y-4 text-sm text-slate-500">
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">Address</div>
                                <div>Pankaj Traders M.G. Road Raipur (C.G).</div>
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900 dark:text-slate-100">Customer care</div>
                                <div>Mon–Sat, 10am–8pm IST</div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    )
}
