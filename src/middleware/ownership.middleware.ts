import { Request, Response, NextFunction } from "express";

const checkOwnership = (role: string) => {
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

export default checkOwnership;
