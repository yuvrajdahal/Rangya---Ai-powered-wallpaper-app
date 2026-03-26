import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Convert Express headers to standard web Headers for better-auth
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, value as string);
    }

    const session = await auth.api.getSession({ headers });
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Attach user info to request
    (req as any).user = session.user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
