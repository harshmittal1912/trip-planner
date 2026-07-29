"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import TripForm, { TripFormValues } from "@/components/TripForm";
import api from "@/lib/api";

function NewTripContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: TripFormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.post("/trips", values);
      router.push(`/trip/${res.data.trip._id}`);
    } catch (err) {
      setError(
        isAxiosError(err)
          ? err.response?.data?.message || "Could not generate the itinerary"
          : "Could not generate the itinerary"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl py-4">
      <h1 className="font-display text-2xl font-semibold text-ink">Plan a new trip</h1>
      <p className="mt-1 font-body text-sm text-ink-soft">
        The AI agent will draft your itinerary, budget, and hotel picks in one go.
      </p>
      {error && <p className="mt-4 font-body text-sm text-rust">{error}</p>}
      <div className="mt-6">
        <TripForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </section>
  );
}

export default function NewTripPage() {
  return (
    <ProtectedRoute>
      <NewTripContent />
    </ProtectedRoute>
  );
}
