import { Response } from "express";
import asyncHandler from "express-async-handler";
import { z } from "zod";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user.id);

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    // Same message for both cases so we don't leak which emails are registered.
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user.id);
  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out" });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
});
