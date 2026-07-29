"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import api, { Trip } from "@/lib/api";

function DashboardContent() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trips")
      .then((res) => setTrips(res.data.trips))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Your trips</h1>
        <Link href="/trip/new" className="btn-primary">
          Plan a trip
        </Link>
      </div>

      {isLoading && <p className="mt-8 font-body text-ink-soft">Loading your trips…</p>}

      {!isLoading && trips.length === 0 && (
        <div className="card mt-8 p-8 text-center">
          <p className="font-body text-ink-soft">
            You haven't planned a trip yet. Start with a destination and a few days.
          </p>
          <Link href="/trip/new" className="btn-primary mt-4 inline-flex">
            Plan your first trip
          </Link>
        </div>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {trips.map((trip) => (
          <li key={trip._id}>
            <Link href={`/trip/${trip._id}`} className="card block p-5 hover:border-brass">
              <h2 className="font-display text-lg font-semibold text-ink">{trip.destination}</h2>
              <p className="mt-1 font-body text-sm text-ink-soft">
                {trip.numberOfDays} days · {trip.budgetType} budget
              </p>
              {trip.budgetEstimate && (
                <p className="mt-2 font-mono text-sm text-brass-dark">
                  ~{trip.budgetEstimate.total} {trip.budgetEstimate.currency}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
