import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiration,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
