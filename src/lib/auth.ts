import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aethercat_secure_secret_token_key_123';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(payload: TokenPayload): string {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'aethercat_secure_secret_token_key_123')) {
    throw new Error("FATAL CONFIG ERROR: JWT_SECRET must be explicitly defined in production mode to prevent credential forgery.");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'aethercat_secure_secret_token_key_123')) {
    throw new Error("FATAL CONFIG ERROR: JWT_SECRET must be explicitly defined in production mode to prevent credential forgery.");
  }
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req: NextRequest): string | null {
  // Try cookie first
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) {
    const decoded = verifyToken(cookieToken);
    if (decoded) return decoded.userId;
  }

  // Fallback to Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded) return decoded.userId;
  }

  return null;
}
