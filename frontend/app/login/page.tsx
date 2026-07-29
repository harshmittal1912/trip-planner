"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isAxiosError } from "axios";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        isAxiosError(err) ? err.response?.data?.message || "Login failed" : "Login failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-6">
        {error && <p className="font-body text-sm text-rust">{error}</p>}
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 font-body text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/register" className="font-semibold text-brass-dark hover:underline">
          Register
        </Link>
      </p>
    </section>
  );
}
