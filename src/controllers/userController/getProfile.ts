import { Response } from "express";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { QueriedUserInsensitive } from "@tp-types/userTypes";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";
import { ErrorResponse } from "@tp-types/commonApiTypes";

const getProfile = errorHandlerMiddleware(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId: number | undefined = req.user?.id;

    const errors: ErrorResponse<null> = {};

    if (!userId) {
      errors.message = "Wrong user ID format.";
      return sendResponse<null, null>(res, {
        status: 401,
        message: "Profile retrieval error",
        error: errors,
      });
    }

    const user: QueriedUserInsensitive | null = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        verifiedAt: true,
      },
    });

    if (!user) {
      errors.message = "User not found";
      return sendResponse<null, null>(res, {
        status: 404,
        message: "Profile retrieval error",
        error: errors,
      });
    }

    sendResponse<QueriedUserInsensitive, null>(res, {
      status: 200,
      message: "Profile retrieved successfully",
      data: user,
    });
  }
);

export default getProfile;
