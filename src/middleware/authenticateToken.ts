import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma/prisma";
import sendResponse from "../utility/responseHandler";
import { ErrorGeneral } from "../types/ErrorTypes";
import { JwtPayloadAccess } from "../types/authenticationTypes";
import { AuthenticatedRequest } from "../types/authenticationTypes";
import { TokenType } from "../enums/authentication";

const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  if (!token)
    return sendResponse<null, ErrorGeneral>(res, {
      status: 401,
      error: { general: "Unauthorized" },
    });

  try {
    const accessTokenSecret: string | undefined =
      process.env.ACCESS_TOKEN_SECRET;

    if (!accessTokenSecret) throw new Error("ACCESS_TOKEN_SECRET is not set.");

    const decoded: JwtPayloadAccess | undefined = jwt.verify(
      token,
      accessTokenSecret
    ) as JwtPayloadAccess;

    const blacklistedAccessToken = await prisma.blacklistedToken.findUnique({
      where: { token: token, tokenType: TokenType.ACCESS },
    });

    if (blacklistedAccessToken) {
      return sendResponse(res, {
        status: 401,
        error: { general: "Access token is blacklisted" },
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    return sendResponse<null, ErrorGeneral>(res, {
      status: 401,
      error: { general: "Invalid or expired token" },
    });
  }
};

export default authenticateToken;
