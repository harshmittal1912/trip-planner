import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

// Centralized error handler so every controller can just `throw` and let this
// format the response consistently, instead of repeating try/catch boilerplate.
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  if (!isAppError) {
    console.error("Unexpected error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: isAppError ? err.message : "Something went wrong on our end",
    ...(process.env.NODE_ENV === "development" && !isAppError
      ? { stack: err.stack }
      : {}),
  });
};
