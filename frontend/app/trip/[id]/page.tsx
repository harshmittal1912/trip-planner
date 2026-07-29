"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ItineraryDay from "@/components/ItineraryDay";
import BudgetCard from "@/components/BudgetCard";
import HotelList from "@/components/HotelList";
import PackingList from "@/components/PackingList";
import api, { Trip } from "@/lib/api";

function TripDetailContent({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [notFound, setNotFoundState] = useState(false);

  useEffect(() => {
    api
      .get(`/trips/${tripId}`)
      .then((res) => setTrip(res.data.trip))
      .catch(() => setNotFoundState(true))
      .finally(() => setIsLoading(false));
  }, [tripId]);

  async function handleAddActivity(dayNumber: number, title: string) {
    const res = await api.post(`/trips/${tripId}/activities`, { dayNumber, title });
    setTrip(res.data.trip);
  }

  async function handleRemoveActivity(dayNumber: number, activityId: string) {
    const res = await api.delete(
      `/trips/${tripId}/days/${dayNumber}/activities/${activityId}`
    );
    setTrip(res.data.trip);
  }

  async function handleRegenerateDay(dayNumber: number, instruction: string) {
    setRegeneratingDay(dayNumber);
    try {
      const res = await api.post(`/trips/${tripId}/days/${dayNumber}/regenerate`, {
        instruction,
      });
      setTrip(res.data.trip);
    } finally {
      setRegeneratingDay(null);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this trip? This can't be undone.")) return;
    await api.delete(`/trips/${tripId}`);
    router.push("/dashboard");
  }

  if (isLoading) return <p className="py-16 text-center font-body text-ink-soft">Loading trip…</p>;
  if (notFound || !trip) {
    return (
      <p className="py-16 text-center font-body text-ink-soft">
        This trip doesn't exist, or isn't yours to see.
      </p>
    );
  }

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{trip.destination}</h1>
          <p className="mt-1 font-body text-sm text-ink-soft">
            {trip.numberOfDays} days · {trip.budgetType} budget
            {trip.interests.length > 0 && ` · ${trip.interests.join(", ")}`}
          </p>
        </div>
        <button onClick={handleDelete} className="btn-secondary text-xs">
          Delete trip
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {trip.itinerary.map((day) => (
            <ItineraryDay
              key={day.dayNumber}
              day={day}
              onAddActivity={handleAddActivity}
              onRemoveActivity={handleRemoveActivity}
              onRegenerateDay={handleRegenerateDay}
              isRegenerating={regeneratingDay === day.dayNumber}
            />
          ))}
        </ul>

        <div className="space-y-6">
          {trip.budgetEstimate && <BudgetCard budget={trip.budgetEstimate} />}
          {trip.hotelSuggestions.length > 0 && <HotelList hotels={trip.hotelSuggestions} />}
          <PackingList items={trip.packingList} />
        </div>
      </div>
    </section>
  );
}

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <TripDetailContent tripId={params.id} />
    </ProtectedRoute>
  );
}
