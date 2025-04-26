import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "@prisma/client";
import { Role } from "@src/enums/authentication";

export interface JwtPayloadAccess extends JwtPayload {
  id: number;
  roles: Role[];
  iat: number;
  exp: number;
}

export interface JwtPayloadRefresh extends JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

export interface BlacklistedRefreshToken {
  id: number;
  token: string;
  tokenType: TokenType;
  expiresAt: Date;
  createdAt: Date;
  userId: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayloadAccess;
}

export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  loginIdentifier: string; // username or email
  password: string;
}

// Forgot Password / Reset Password
export interface ResetPasswordRequestBody {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RequestPasswordResetEmailBody {
  email: string;
}
