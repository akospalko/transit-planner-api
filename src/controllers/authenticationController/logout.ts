import { Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import {
  AuthenticatedRequest,
  JwtPayloadAccess,
  JwtPayloadRefresh,
} from "../../types/authenticationTypes";
import { TokenType } from "../../enums/authentication";

const logout = errorHandlerMiddleware(
  async (req: AuthenticatedRequest, res: Response) => {
    const { user, body }: AuthenticatedRequest = req;

    if (!user) {
      return sendResponse(res, {
        status: 401,
        error: { general: "Unauthorized" },
      });
    }

    const { id }: JwtPayloadAccess = user;

    const accessToken: string | undefined =
      req.headers.authorization?.split(" ")[1];

    const refreshToken: string | undefined = body.refreshToken;

    if (!accessToken) {
      return sendResponse(res, {
        status: 400,
        error: { general: "Access token missing in the request" },
      });
    }

    const decodedAccessToken: JwtPayloadAccess | undefined = req.user;

    if (!decodedAccessToken) {
      return sendResponse(res, {
        status: 401,
        error: { general: "Unauthorized" },
      });
    }

    const accessTokenExpiration: number = decodedAccessToken.exp * 1000;

    await prisma.blacklistedToken.create({
      data: {
        token: accessToken,
        tokenType: TokenType.ACCESS,
        expiresAt: new Date(accessTokenExpiration),
        userId: id,
      },
    });

    if (refreshToken) {
      try {
        const decodedRefreshToken: JwtPayloadRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as JwtPayloadRefresh;

        const refreshTokenExpiration: number = decodedRefreshToken.exp * 1000;

        await prisma.blacklistedToken.create({
          data: {
            token: refreshToken,
            tokenType: TokenType.REFRESH,
            expiresAt: new Date(refreshTokenExpiration),
            userId: id,
          },
        });
      } catch (error) {
        return sendResponse(res, {
          status: 400,
          error: { general: "Invalid refresh token" },
        });
      }
    }

    await prisma.user.update({
      where: { id },
      data: { refreshToken: null },
    });

    sendResponse(res, { status: 200, message: "Logged out successfully" });
  }
);

export default logout;
