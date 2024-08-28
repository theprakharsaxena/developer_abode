import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "./utils";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }
  try {
    const decoded = verifyToken(token) as JwtPayload;
    // const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

export const canCreate = (allowedRoles: string[], role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      try {
        const decoded = jwt.verify(token, "jwt_secret") as JwtPayload;
        const userRole = decoded.role;

        if (allowedRoles.includes(userRole)) {
          // Allow creation if the user's role is in the allowedRoles array
          req.user = decoded;
          return next();
        }

        return res
          .status(403)
          .send(
            `Access denied. ${userRole} can only manage their own account.`
          );
      } catch (error) {
        return res.status(400).send("Invalid token.");
      }
    } else {
      if (["student", "admin"].includes(role)) {
        // Allow unauthenticated creation of student and admin accounts
        return next();
      }

      return res
        .status(403)
        .send(`Only ${allowedRoles.join(", ")} can create this account.`);
    }
  };
};

export const checkOwnership = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req.user as { role: string }).role;
    const userId = (req.user as { _id: string })._id;
    if (role === userRole && userId !== req.params.id) {
      return res
        .status(403)
        .send(`Access denied. ${userRole} can only manage their own account.`);
    }
    next();
  };
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as { role: string }).role;
    if (!req.user || !allowedRoles.includes(role)) {
      return res.status(403).send(`Access denied. Your role is ${role}`);
    }
    next();
  };
};
