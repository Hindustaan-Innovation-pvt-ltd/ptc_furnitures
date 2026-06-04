import StayInTouchForm from "./StayInTouchForm";

export default function StayInTouch() {
  return (
    <section className="border-t border-slate-200 px-4 py-20 transition-colors duration-300 dark:border-white/10 dark:bg-zinc-950 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl text-center">
        <div className="text-red-500 tracking-widest text-xs font-semibold mb-4">
          STAY IN TOUCH
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight dark:text-white sm:text-4xl lg:text-5xl">
          New Arrivals, First.
        </h1>
        <p className="mx-auto mb-7 max-w-sm text-sm text-gray-400 sm:text-base">
          Join 12,000+ design enthusiasts. Get new collections, exclusive
          offers, and inspiration delivered weekly.
        </p>

        <StayInTouchForm />

        <div className="mt-3.5 text-xs text-gray-600">
          No spam. Unsubscribe anytime.
        </div>
      </div>
    </section>
  );
}
