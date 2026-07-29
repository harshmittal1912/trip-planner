import mongoose, { Document, Schema, Types } from "mongoose";

export type BudgetType = "Low" | "Medium" | "High";

export interface IActivity {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
}

export interface IDay {
  dayNumber: number;
  activities: IActivity[];
}

export interface IBudgetEstimate {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
  currency: string;
}

export interface IHotelSuggestion {
  name: string;
  tier: "Budget Friendly" | "Mid Range" | "Luxury";
  notes?: string;
}

export interface ITrip extends Document {
  user: Types.ObjectId; // owner - enforces per-user data isolation
  destination: string;
  numberOfDays: number;
  budgetType: BudgetType;
  interests: string[];
  itinerary: IDay[];
  budgetEstimate?: IBudgetEstimate;
  hotelSuggestions: IHotelSuggestion[];
  packingList: string[];
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true },
    description: { type: String },
  },
  { _id: true }
);

const daySchema = new Schema<IDay>(
  {
    dayNumber: { type: Number, required: true },
    activities: [activitySchema],
  },
  { _id: false }
);

const tripSchema = new Schema<ITrip>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    destination: { type: String, required: true, trim: true },
    numberOfDays: { type: Number, required: true, min: 1, max: 30 },
    budgetType: { type: String, enum: ["Low", "Medium", "High"], required: true },
    interests: [{ type: String }],
    itinerary: [daySchema],
    budgetEstimate: {
      flights: Number,
      accommodation: Number,
      food: Number,
      activities: Number,
      total: Number,
      currency: { type: String, default: "USD" },
    },
    hotelSuggestions: [
      {
        name: String,
        tier: { type: String, enum: ["Budget Friendly", "Mid Range", "Luxury"] },
        notes: String,
      },
    ],
    packingList: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>("Trip", tripSchema);
