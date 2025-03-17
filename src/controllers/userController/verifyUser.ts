// TODO Improve typing
// TODO 1. via profile ? click btn (profile)
import { Request, Response } from "express";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import {
  AuthenticatedRequest,
  JwtPayloadAccess,
} from "@tp-types/authenticationTypes";

// 2. via email -> generate link -> send link via mail -> click link -> send request -> verify user
export interface VerifyResponseData {
  verified: boolean;
}

const verifyUser = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { user }: AuthenticatedRequest = req;

    const errors: ErrorResponse<null> = {};

    if (!user) {
      errors.message = "Unauthorized";
      return sendResponse<null, null>(res, {
        status: 401,
        message: "Logout failed",
        error: errors,
      });
    }

    const { id }: JwtPayloadAccess = user;

    const queriedUser = await prisma.user.findUnique({ where: { id } });

    if (!queriedUser) {
      errors.message = "User not found";
      return sendResponse<null, null>(res, {
        status: 404,
        message: "Verification failed",
        error: errors,
      });
    }

    if (queriedUser.verifiedAt) {
      return sendResponse<VerifyResponseData, null>(res, {
        status: 200,
        message: "User already verified",
        data: { verified: true },
      });
    }

    await prisma.user.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });

    return sendResponse<VerifyResponseData, null>(res, {
      status: 200,
      message: "User verified successfully",
      data: { verified: true },
    });
  }
);

export default verifyUser;
