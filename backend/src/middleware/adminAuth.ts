import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (req.user.role !== "admin") {
      console.warn(
        `🚫 Admin access denied for user ${req.user.id} with role ${req.user.role}`
      );
      return res.status(403).json({
        success: false,
        error: "Access denied: Admin role required",
      });
    }

    // User is authenticated and has admin role
    console.log(`✅ Admin access granted for user ${req.user.id}`);
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Authorization check failed",
    });
  }
}

/**
 * Optional admin middleware - allows access but tracks admin status
 */
export function optionalAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Don't require authentication, but set admin flag if user is admin
    if (req.user && req.user.role === "admin") {
      (req as any).isAdmin = true;
      console.log(`👑 Admin user detected: ${req.user.id}`);
    }
    next();
  } catch (error) {
    console.error("Optional admin middleware error:", error);
    next(); // Don't block the request
  }
}
