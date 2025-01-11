import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/prisma";
import sendResponse from "../../utility/responseHandler";
import {
  JwtPayloadRefresh,
  BlacklistedRefreshToken,
} from "../../types/authenticationTypes";
import { ErrorGeneral } from "../../types/ErrorTypes";
import { TokenType } from "../../enums/authentication";

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.body.refreshToken;

  if (!refreshToken) {
    return sendResponse<null, ErrorGeneral>(res, {
      status: 400,
      error: { general: "Refresh token is required" },
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
      return sendResponse<null, ErrorGeneral>(res, {
        status: 401,
        error: { general: "Refresh token is blacklisted" },
      });
    }

    const refreshTokenExpiration: Date = new Date(decoded.exp * 1000);

    if (refreshTokenExpiration < new Date()) {
      return sendResponse<null, ErrorGeneral>(res, {
        status: 401,
        error: { general: "Refresh token has expired" },
      });
    }

    const userId: number = decoded.id;

    const newAccessToken: string = jwt.sign(
      { id: userId, roles: decoded.roles },
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

    sendResponse(res, {
      status: 200,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    return sendResponse<null, ErrorGeneral>(res, {
      status: 401,
      error: { general: "Invalid or expired refresh token" },
    });
  }
};

export default refreshToken;
