import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import {
  QueriedUserPassword,
  UserUpdateEmailRequestBody,
  UserUpdatePasswordRequestBody,
} from "../../types/userTypes";
import {
  ErrorResponse,
  UpdatePasswordError,
  UpdateEmailError,
} from "../../types/apiTypes";

const updateEmail = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { currentPassword, email }: UserUpdateEmailRequestBody = req.body;
    const userId: number = Number(req.params.id);

    const errors: ErrorResponse<UpdateEmailError> = {};
    if (!errors.fields) {
      errors.fields = {};

      if (isNaN(userId)) {
        errors.message = "Invalid user.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
        });
      }

      if (!email && !currentPassword) {
        errors.fields.email = "Email is required.";
        errors.fields.currentPassword = "Current password is required.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
        });
      }

      if (!email) {
        errors.fields.email = "Email is required.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
        });
      }

      if (!currentPassword) {
        errors.fields.currentPassword = "Current password are required.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
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
        errors.message = "User not found.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 404,
          message: "Update user error",
          error: errors,
        });
      }

      const userExists: boolean =
        (await prisma.user.count({
          where: { email },
        })) > 0;

      if (userExists) {
        errors.fields.email = "Email is already in use.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
        });
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        errors.fields.currentPassword = "Current password is invalid.";
        return sendResponse<null, UpdateEmailError>(res, {
          status: 401,
          message: "Update user error",
          error: errors,
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { email },
      });

      return sendResponse<null, null>(res, {
        status: 200,
        message: "Email updated successfully.",
      });
    }
  }
);

const updatePassword = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword }: UserUpdatePasswordRequestBody =
      req.body;
    const userId: number = Number(req.params.id);

    const errors: ErrorResponse<UpdatePasswordError> = {};
    if (!errors.fields) {
      errors.fields = {};

      if (isNaN(userId)) {
        errors.message = "Invalid user.";
        return sendResponse<null, UpdatePasswordError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
        });
      }

      if (!currentPassword) {
        errors.fields.currentPassword = "Current password is missing.";
      }

      if (!newPassword) {
        errors.fields.newPassword = "New password is missing.";
        return sendResponse<null, UpdatePasswordError>(res, {
          status: 400,
          message: "Update user error",
          error: errors,
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
        errors.message = "User not found.";
        return sendResponse<null, UpdatePasswordError>(res, {
          status: 404,
          message: "Update user error",
          error: errors,
        });
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        errors.fields.currentPassword = "Incorrect current password.";
        return sendResponse<null, UpdatePasswordError>(res, {
          status: 401,
          message: "Update user error",
          error: errors,
        });
      }

      const hashedPassword: string = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return sendResponse<null, null>(res, {
        status: 200,
        message: "Password updated successfully.",
      });
    }
  }
);

export { updateEmail, updatePassword };
