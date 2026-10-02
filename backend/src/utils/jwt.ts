import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole } from '../models/types.js';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  username: string;
  email: string;
}

export const signToken = (payload: TokenPayload, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};
