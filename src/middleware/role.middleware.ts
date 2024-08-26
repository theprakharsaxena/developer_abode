import { Request, Response, NextFunction } from "express";

// const roleMiddleware = (roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user || !roles.includes((req.user as { role: string }).role)) {
//       return res.status(403).send("Access denied.");
//     }
//     next();
//   };
// };

const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as { role: string }).role;
    if (!req.user || !allowedRoles.includes(role)) {
      return res.status(403).send(`Access denied. Your role is ${role}`);
    }
    next();
  };
};

export default roleMiddleware;
