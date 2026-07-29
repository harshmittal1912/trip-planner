import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="flex flex-col items-start gap-6 py-12 sm:py-20">
      <span className="rounded-full border border-dashed border-brass px-3 py-1 font-mono text-xs uppercase tracking-widest text-brass-dark">
        Your itinerary, drafted by an AI agent
      </span>
      <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
        Tell it where you're going. Get a trip already planned.
      </h1>
      <p className="max-w-xl font-body text-base text-ink-soft sm:text-lg">
        Wayfarer turns a destination, a few days, and your interests into a full
        day-by-day itinerary, a realistic budget, and hotel picks to match —
        all editable, all yours.
      </p>
      <Link href="/register" className="btn-primary">
        Plan your first trip
      </Link>
    </section>
  );
}
