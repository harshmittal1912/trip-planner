import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Wayfarer — AI Trip Planner",
  description: "Generate a complete day-by-day travel itinerary with an AI agent.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
