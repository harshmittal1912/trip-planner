import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // still send the cookie when same-site (e.g. local dev)
  headers: { "Content-Type": "application/json" },
});

// The backend also accepts a Bearer token, which is what we rely on in
// production: the frontend (vercel.app) and backend (onrender.com) are on
// different domains, and some browsers (notably Safari) block cross-site
// cookies outright regardless of SameSite/Secure settings. Storing the token
// and attaching it as a header sidesteps that entirely.
const TOKEN_KEY = "wayfarer_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export interface Activity {
  _id?: string;
  title: string;
  description?: string;
}

export interface Day {
  dayNumber: number;
  activities: Activity[];
}

export interface BudgetEstimate {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
  currency: string;
}

export interface HotelSuggestion {
  name: string;
  tier: "Budget Friendly" | "Mid Range" | "Luxury";
  notes?: string;
}

export interface Trip {
  _id: string;
  destination: string;
  numberOfDays: number;
  budgetType: "Low" | "Medium" | "High";
  interests: string[];
  itinerary: Day[];
  budgetEstimate?: BudgetEstimate;
  hotelSuggestions: HotelSuggestion[];
  packingList: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
