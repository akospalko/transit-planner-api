// TODO 1. via profile ? click btn (profile)

import { Request, Response } from "express";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";

// 2. via email -> generate link -> send link via mail -> click link -> send request -> verify user
export interface VerifyResponseData {
  verified: boolean;
}

const verifyUser = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const userId = req.user?.id; // Assuming user ID is extracted from auth middleware

    if (!userId) {
      const errors: ErrorResponse = { message: "Unauthorized access" };
      return sendResponse<null, ErrorResponse>(res, {
        status: 401,
        message: "Verification failed",
        error: errors,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      const errors: ErrorResponse = { message: "User not found" };
      return sendResponse<null, ErrorResponse>(res, {
        status: 404,
        message: "Verification failed",
        error: errors,
      });
    }

    if (user.verifiedAt) {
      return sendResponse<VerifyResponseData, null>(res, {
        status: 200,
        message: "User already verified",
        data: { verified: true },
      });
    }

    await prisma.user.update({
      where: { id: userId },
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
