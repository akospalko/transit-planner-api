import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import {
  QueriedUserPassword,
  UserUpdateEmailRequestBody,
  UserUpdatePasswordRequestBody,
} from "../../types/userTypes";
import { ErrorUpdateEmail, ErrorUpdatePassword } from "../../types/ErrorTypes";

const updateEmail = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { currentPassword, email }: UserUpdateEmailRequestBody = req.body;
    const userId: number = Number(req.params.id);

    if (isNaN(userId)) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 400,
        error: { general: "Invalid user." },
      });
    }

    if (!email && !currentPassword) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 400,
        error: {
          email: "Email is required.",
          currentPassword: "Current password is required.",
        },
      });
    }

    if (!email) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 400,
        error: { email: "Email is required." },
      });
    }

    if (!currentPassword) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 400,
        error: { currentPassword: "Current password are required." },
      });
    }

    const user: QueriedUserPassword | null = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 404,
        error: { general: "User not found." },
      });
    }

    const userExists: boolean =
      (await prisma.user.count({
        where: { email },
      })) > 0;

    if (userExists) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 400,
        error: { email: "Email is already in use." },
      });
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return sendResponse<null, ErrorUpdateEmail>(res, {
        status: 401,
        error: { currentPassword: "Current password is invalid." },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    return sendResponse(res, {
      status: 200,
      message: "Email updated successfully.",
    });
  }
);

const updatePassword = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword }: UserUpdatePasswordRequestBody =
      req.body;
    const userId: number = Number(req.params.id);

    if (isNaN(userId)) {
      return sendResponse<null, ErrorUpdatePassword>(res, {
        status: 400,
        error: { general: "Invalid user." },
      });
    }

    if (!currentPassword && !newPassword) {
      return sendResponse<null, ErrorUpdatePassword>(res, {
        status: 400,
        error: {
          currentPassword: "Current password is missing.",
          newPassword: "New password is missing.",
        },
      });
    }

    if (!currentPassword) {
      return sendResponse<null, ErrorUpdatePassword>(res, {
        status: 400,
        error: {
          currentPassword: "Current password is missing.",
        },
      });
    }

    if (!newPassword) {
      return sendResponse<null, ErrorUpdatePassword>(res, {
        status: 400,
        error: {
          newPassword: "New password is missing.",
        },
      });
    }

    const user: QueriedUserPassword | null = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return sendResponse<null, ErrorUpdatePassword>(res, {
        status: 404,
        error: { general: "User not found." },
      });
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return sendResponse<null, ErrorUpdatePassword>(res, {
        status: 401,
        error: { currentPassword: "Incorrect current password." },
      });
    }

    const hashedPassword: string = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return sendResponse(res, {
      status: 200,
      message: "Password updated successfully.",
    });
  }
);

export { updateEmail, updatePassword };
