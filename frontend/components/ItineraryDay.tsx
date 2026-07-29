"use client";

import { useState } from "react";
import { Day } from "@/lib/api";

export default function ItineraryDay({
  day,
  onAddActivity,
  onRemoveActivity,
  onRegenerateDay,
  isRegenerating,
}: {
  day: Day;
  onAddActivity: (dayNumber: number, title: string) => void;
  onRemoveActivity: (dayNumber: number, activityId: string) => void;
  onRegenerateDay: (dayNumber: number, instruction: string) => void;
  isRegenerating: boolean;
}) {
  const [newActivity, setNewActivity] = useState("");
  const [instruction, setInstruction] = useState("");
  const [showRegenerate, setShowRegenerate] = useState(false);

  return (
    <li className="card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="stamp">{day.dayNumber}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">Day {day.dayNumber}</h3>
            <button
              onClick={() => setShowRegenerate((s) => !s)}
              className="text-xs font-semibold uppercase tracking-wide text-brass-dark hover:underline"
            >
              Regenerate day
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {day.activities.map((activity) => (
              <li
                key={activity._id || activity.title}
                className="flex items-start justify-between gap-3 border-b border-line/70 pb-2 last:border-none"
              >
                <div>
                  <p className="font-body text-sm font-medium text-ink">{activity.title}</p>
                  {activity.description && (
                    <p className="font-body text-sm text-ink-soft">{activity.description}</p>
                  )}
                </div>
                {activity._id && (
                  <button
                    onClick={() => onRemoveActivity(day.dayNumber, activity._id!)}
                    aria-label={`Remove ${activity.title}`}
                    className="shrink-0 text-xs font-semibold text-rust hover:underline"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
            {day.activities.length === 0 && (
              <li className="font-body text-sm text-ink-soft">No activities yet for this day.</li>
            )}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newActivity.trim()) return;
              onAddActivity(day.dayNumber, newActivity.trim());
              setNewActivity("");
            }}
            className="mt-4 flex gap-2"
          >
            <input
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Add an activity…"
              className="field-input flex-1 py-2 text-sm"
            />
            <button type="submit" className="btn-secondary py-2 text-xs">
              Add
            </button>
          </form>

          {showRegenerate && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!instruction.trim()) return;
                onRegenerateDay(day.dayNumber, instruction.trim());
              }}
              className="mt-3 flex gap-2 rounded-sm border border-dashed border-brass/60 bg-brass/5 p-3"
            >
              <input
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder='e.g. "more outdoor activities"'
                className="field-input flex-1 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={isRegenerating}
                className="btn-primary py-2 text-xs"
              >
                {isRegenerating ? "Working…" : "Regenerate"}
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
}
