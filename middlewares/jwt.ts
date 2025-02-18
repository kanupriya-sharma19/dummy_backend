import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization'];
  if (!token) {
    res.status(401).json({ status: false, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.user = decoded.id;  
    next();
  } catch (error) {
    res.status(401).json({ status: false, message: 'Invalid token' });
  }
};
