import { Request, Response } from "express";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { QueriedUserInsensitive } from "../../types/userTypes";

const getAllUsers = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const totalUsers: number = await prisma.user.count();

    if (totalUsers === 0) {
      return sendResponse<[], null>(res, {
        status: 200,
        message: "No users present",
        data: [],
      });
    }

    const allUsers: QueriedUserInsensitive[] = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        verifiedAt: true,
      },
    });

    return sendResponse<QueriedUserInsensitive[], null>(res, {
      status: 200,
      message: "Users retrieved successfully",
      data: allUsers,
    });
  }
);

export default getAllUsers;
