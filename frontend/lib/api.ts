import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send the httpOnly auth cookie
  headers: { "Content-Type": "application/json" },
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
