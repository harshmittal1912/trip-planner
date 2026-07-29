import { BudgetEstimate } from "@/lib/api";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function BudgetCard({ budget }: { budget: BudgetEstimate }) {
  const rows: [string, number][] = [
    ["Flights", budget.flights],
    ["Accommodation", budget.accommodation],
    ["Food", budget.food],
    ["Activities", budget.activities],
  ];

  return (
    <div className="card p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-ink">Estimated budget</h3>
      <dl className="mt-4 space-y-2 font-mono text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-ink">{formatCurrency(value, budget.currency)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-dashed border-line pt-2 font-semibold">
          <dt className="text-ink">Total</dt>
          <dd className="text-brass-dark">{formatCurrency(budget.total, budget.currency)}</dd>
        </div>
      </dl>
    </div>
  );
}
