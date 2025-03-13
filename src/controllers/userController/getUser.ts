import { Request, Response } from "express";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { QueriedUserInsensitive } from "@tp-types/userTypes";
import { ErrorResponse } from "@tp-types/commonApiTypes";

const getUser = errorHandlerMiddleware(async (req: Request, res: Response) => {
  const userId: number = Number(req.params.id);

  const errors: ErrorResponse<null> = {};

  if (isNaN(userId)) {
    errors.message = "Wrong user ID format.";
    return sendResponse<null, null>(res, {
      status: 400,
      message: "Get user error",
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
    errors.message = "Wrong user ID format.";
    return sendResponse<null, null>(res, {
      status: 404,
      message: "Get user error",
      error: errors,
    });
  }

  sendResponse<QueriedUserInsensitive, null>(res, {
    status: 200,
    message: "User retrieved successfully",
    data: user,
  });
});

export default getUser;
