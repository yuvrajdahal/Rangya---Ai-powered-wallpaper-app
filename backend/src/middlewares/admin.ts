import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access only" });
  }

  
  (req as any).session = session;
  next();
};
