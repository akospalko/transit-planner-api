import { Request, Response, NextFunction, RequestHandler } from "express";

import jwt from "jsonwebtoken";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import { JwtPayloadAccess } from "@tp-types/authenticationTypes";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import { TokenType } from "@src/enums/authentication";

const authenticateToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  const errors: ErrorResponse<null> = {};

  if (!token) {
    errors.message = "Unauthorized";
    return sendResponse<null, null>(res, {
      status: 401,
      message: "Token authentication error",
      error: errors,
    });
  }

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
      errors.message = "Unauthorized";
      return sendResponse<null, null>(res, {
        status: 401,
        message: "Token authentication error",
        error: errors,
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    errors.message = "Invalid or expired token";
    return sendResponse<null, null>(res, {
      status: 401,
      message: "Token authentication error",
      error: errors,
    });
  }
};

export default authenticateToken;
