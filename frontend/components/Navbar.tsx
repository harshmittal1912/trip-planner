"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="stamp">W</span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Wayfarer
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {!isLoading && user && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-ink-soft hover:text-ink">
                Dashboard
              </Link>
              <Link href="/trip/new" className="btn-primary">
                Plan a trip
              </Link>
              <button onClick={logout} className="text-sm font-medium text-ink-soft hover:text-ink">
                Log out
              </button>
            </>
          )}
          {!isLoading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
