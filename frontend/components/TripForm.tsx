"use client";

import { useState, FormEvent } from "react";

export interface TripFormValues {
  destination: string;
  numberOfDays: number;
  budgetType: "Low" | "Medium" | "High";
  interests: string[];
}

const INTEREST_OPTIONS = ["Food", "Culture", "Adventure", "Shopping", "Nature", "Nightlife"];

export default function TripForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: TripFormValues) => void;
  isSubmitting: boolean;
}) {
  const [destination, setDestination] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [budgetType, setBudgetType] = useState<"Low" | "Medium" | "High">("Medium");
  const [interests, setInterests] = useState<string[]>([]);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ destination, numberOfDays, budgetType, interests });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6 p-6 sm:p-8">
      <div>
        <label htmlFor="destination" className="field-label">
          Destination
        </label>
        <input
          id="destination"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Tokyo, Japan"
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="days" className="field-label">
            Number of days
          </label>
          <input
            id="days"
            type="number"
            min={1}
            max={30}
            required
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(Number(e.target.value))}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="budget" className="field-label">
            Budget type
          </label>
          <select
            id="budget"
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value as "Low" | "Medium" | "High")}
            className="field-input"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="field-label">Interests</legend>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const active = interests.includes(interest);
            return (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-brass bg-brass/15 text-brass-dark"
                    : "border-line text-ink-soft hover:border-ink/30"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" disabled={isSubmitting || !destination} className="btn-primary w-full">
        {isSubmitting ? "Generating your itinerary…" : "Generate itinerary"}
      </button>
    </form>
  );
}
