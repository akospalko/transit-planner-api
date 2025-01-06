import { Request, Response } from "express";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { QueriedUserInsensitive } from "../../types/userTypes";
import { ErrorGeneral } from "../../types/ErrorTypes";

const getUser = errorHandlerMiddleware(async (req: Request, res: Response) => {
  const userId: number = Number(req.params.id);

  if (isNaN(userId)) {
    return sendResponse<null, ErrorGeneral>(res, {
      status: 400,
      error: { general: "Wrong user ID format." },
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
    return sendResponse(res, {
      status: 404,
      error: { general: "Wrong user ID format." },
    });
  }

  sendResponse<QueriedUserInsensitive, null>(res, {
    status: 200,
    message: "User retrieved successfully",
    data: user,
  });
});

export default getUser;
