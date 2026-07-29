import { Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import Trip from "../models/Trip";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import * as llm from "../services/llmService";

const tripInputSchema = z.object({
  destination: z.string().min(2).max(100),
  numberOfDays: z.number().int().min(1).max(30),
  budgetType: z.enum(["Low", "Medium", "High"]),
  interests: z.array(z.string()).default([]),
});

/**
 * Every lookup below is scoped by BOTH _id and user. This is the data-isolation
 * guarantee from the spec: a valid trip id belonging to someone else resolves
 * to "not found", not "forbidden" - we don't want to confirm the id even exists.
 */
async function findOwnedTrip(tripId: string, userId: string) {
  const trip = await Trip.findOne({ _id: tripId, user: userId });
  if (!trip) throw new AppError("Trip not found", 404);
  return trip;
}

export const createTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = tripInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const brief = parsed.data;

  // Generate itinerary, budget, hotel suggestions, and packing list concurrently.
  const [itinerary, budgetEstimate, hotelSuggestions, packingList] = await Promise.all([
    llm.generateItinerary(brief),
    llm.estimateBudget(brief),
    llm.suggestHotels(brief),
    llm.generatePackingList(brief),
  ]);

  const trip = await Trip.create({
    user: req.userId,
    ...brief,
    itinerary,
    budgetEstimate,
    hotelSuggestions,
    packingList,
  });

  res.status(201).json({ success: true, trip });
});

export const getTrips = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trips = await Trip.find({ user: req.userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, trips });
});

export const getTripById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await findOwnedTrip(req.params.id, req.userId!);
  res.status(200).json({ success: true, trip });
});

export const deleteTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await findOwnedTrip(req.params.id, req.userId!);
  await trip.deleteOne();
  res.status(200).json({ success: true, message: "Trip deleted" });
});

const addActivitySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1).max(150),
  description: z.string().max(500).optional(),
});

export const addActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = addActivitySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const trip = await findOwnedTrip(req.params.id, req.userId!);
  const day = trip.itinerary.find((d) => d.dayNumber === parsed.data.dayNumber);
  if (!day) throw new AppError(`Day ${parsed.data.dayNumber} does not exist on this trip`, 404);

  day.activities.push({ title: parsed.data.title, description: parsed.data.description });
  await trip.save();
  res.status(200).json({ success: true, trip });
});

export const removeActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { dayNumber, activityId } = req.params;
  const trip = await findOwnedTrip(req.params.id, req.userId!);

  const day = trip.itinerary.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) throw new AppError(`Day ${dayNumber} does not exist on this trip`, 404);

  const before = day.activities.length;
  day.activities = day.activities.filter((a) => a._id?.toString() !== activityId);
  if (day.activities.length === before) {
    throw new AppError("Activity not found", 404);
  }

  await trip.save();
  res.status(200).json({ success: true, trip });
});

const regenerateDaySchema = z.object({
  instruction: z.string().min(3).max(300),
});

export const regenerateDay = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = regenerateDaySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const trip = await findOwnedTrip(req.params.id, req.userId!);
  const dayNumber = Number(req.params.dayNumber);
  const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNumber);
  if (dayIndex === -1) throw new AppError(`Day ${dayNumber} does not exist on this trip`, 404);

  const newDay = await llm.regenerateDay(
    {
      destination: trip.destination,
      numberOfDays: trip.numberOfDays,
      budgetType: trip.budgetType,
      interests: trip.interests,
    },
    dayNumber,
    parsed.data.instruction
  );

  trip.itinerary[dayIndex] = newDay;
  await trip.save();
  res.status(200).json({ success: true, trip });
});
