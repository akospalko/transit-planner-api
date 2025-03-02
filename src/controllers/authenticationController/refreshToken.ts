import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/prisma";
import sendResponse from "../../utility/responseHandler";
import {
  JwtPayloadRefresh,
  BlacklistedRefreshToken,
} from "../../types/authenticationTypes";
import { TokenType } from "../../enums/authentication";
import { ErrorResponse, RefreshTokenResponseData } from "../../types/apiTypes";
import { QueriedUser } from "../../types/userTypes";

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.body.refreshToken;
  const errors: ErrorResponse<null> = {};

  if (!refreshToken) {
    errors.message = "Refresh token is required";
    return sendResponse<null, null>(res, {
      status: 400,
      message: "Token error",
      error: errors,
    });
  }

  const refreshTokenSecret: string | undefined =
    process.env.REFRESH_TOKEN_SECRET;
  const accessTokenSecret: string | undefined = process.env.ACCESS_TOKEN_SECRET;

  if (!refreshTokenSecret || !accessTokenSecret) {
    throw new Error("Token secrets are not set in environment variables.");
  }

  try {
    const decoded: JwtPayloadRefresh | undefined = jwt.verify(
      refreshToken,
      refreshTokenSecret
    ) as JwtPayloadRefresh;

    const blacklistedRefreshToken: BlacklistedRefreshToken | null =
      await prisma.blacklistedToken.findUnique({
        where: { token: refreshToken, tokenType: TokenType.REFRESH },
      });

    if (blacklistedRefreshToken) {
      errors.message = "Refresh token is blacklisted";
      return sendResponse<null, null>(res, {
        status: 401,
        message: "Token error",
        error: errors,
      });
    }

    const refreshTokenExpiration: Date = new Date(decoded.exp * 1000);

    if (refreshTokenExpiration < new Date()) {
      errors.message = "Refresh token has expired";
      return sendResponse<null, null>(res, {
        status: 401,
        message: "Token error",
        error: errors,
      });
    }

    const userId: number = decoded.id;

    const user: QueriedUser | null = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      errors.message = "Couldn't resolve user role from token payload";
      return sendResponse<null, null>(res, {
        status: 401,
        message: "Token error",
        error: errors,
      });
    }

    const newAccessToken: string = jwt.sign(
      { id: userId, roles: user.roles },
      accessTokenSecret,
      { expiresIn: "15m" }
    );

    const newRefreshToken: string = jwt.sign(
      { id: userId },
      refreshTokenSecret,
      { expiresIn: "7d" }
    );

    await prisma.blacklistedToken.create({
      data: {
        token: refreshToken,
        tokenType: TokenType.REFRESH,
        expiresAt: refreshTokenExpiration,
        userId,
      },
    });

    sendResponse<RefreshTokenResponseData, null>(res, {
      status: 200,
      message: "Tokens refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    errors.message = "Invalid or expired refresh token";
    return sendResponse<null, null>(res, {
      status: 401,
      message: "Token error",
      error: errors,
    });
  }
};

export default refreshToken;
