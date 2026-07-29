export default function PackingList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-ink">Smart packing list</h3>
      <p className="mt-1 font-body text-xs text-ink-soft">
        Tailored to the destination, trip length, and your interests.
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 font-body text-sm text-ink">
            <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
