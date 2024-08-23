import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

const canCreate = (allowedRoles: string[], role: string) => {
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

export default canCreate;
