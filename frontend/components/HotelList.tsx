import { HotelSuggestion } from "@/lib/api";

const TIER_STYLES: Record<HotelSuggestion["tier"], string> = {
  "Budget Friendly": "border-moss text-moss",
  "Mid Range": "border-brass text-brass-dark",
  Luxury: "border-ink text-ink",
};

export default function HotelList({ hotels }: { hotels: HotelSuggestion[] }) {
  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-ink">Recommended hotels</h3>
      <ul className="mt-4 space-y-3">
        {hotels.map((hotel) => (
          <li key={hotel.name} className="flex items-start justify-between gap-3">
            <div>
              <p className="font-body text-sm font-medium text-ink">{hotel.name}</p>
              {hotel.notes && <p className="font-body text-xs text-ink-soft">{hotel.notes}</p>}
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TIER_STYLES[hotel.tier]}`}
            >
              {hotel.tier}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
