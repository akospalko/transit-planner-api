import { Request, Response } from "express";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import {
  ErrorResponse,
  VerifyUserResponseData,
} from "@tp-types/commonApiTypes";
import {
  AuthenticatedRequest,
  JwtPayloadAccess,
} from "@tp-types/authenticationTypes";

const verifyUser = errorHandlerMiddleware<AuthenticatedRequest>(
  async (req, res) => {
    const { user } = req;

    const errors: ErrorResponse<null> = {};
    if (!user) {
      errors.message = "Unauthorized";
      return sendResponse<VerifyUserResponseData, null>(res, {
        status: 401,
        message: "Logout failed",
        error: errors,
        data: { verified: false },
      });
    }

    const { id }: JwtPayloadAccess = user;

    const queriedUser = await prisma.user.findUnique({ where: { id } });

    if (!queriedUser) {
      errors.message = "User not found";

      return sendResponse<VerifyUserResponseData, null>(res, {
        status: 404,
        message: "Verification failed",
        error: errors,
        data: { verified: false },
      });
    }

    if (queriedUser.verifiedAt) {
      return sendResponse<VerifyUserResponseData, null>(res, {
        status: 200,
        message: "User already verified",
        data: { verified: true },
      });
    }

    await prisma.user.update({
      where: { id },
      data: { verifiedAt: new Date() },
    });

    return sendResponse<VerifyUserResponseData, null>(res, {
      status: 200,
      message: "User verified successfully",
      data: { verified: true },
    });
  }
);

export default verifyUser;
