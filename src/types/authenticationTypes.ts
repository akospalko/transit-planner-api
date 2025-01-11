import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../enums/authentication";
import { TokenType } from "@prisma/client";

export interface JwtPayloadAccess extends JwtPayload {
  id: number;
  role: Role[];
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
