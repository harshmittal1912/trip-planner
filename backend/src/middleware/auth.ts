import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Verifies the JWT (from httpOnly cookie or Authorization header) and attaches
 * the authenticated user's id to the request. This is the single choke point
 * that guarantees every protected route knows exactly which user is calling it,
 * which is what makes per-user data isolation enforceable downstream.
 */
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized, no token provided", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError("Server misconfiguration", 500);

    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError("User no longer exists", 401);
      }

      req.userId = decoded.id;
      next();
    } catch (err) {
      throw new AppError("Not authorized, invalid or expired token", 401);
    }
  }
);
