import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import {
  QueriedUserPassword,
  UserUpdateEmailRequestBody,
} from "@tp-types/userTypes";
import { ErrorResponse, UpdateEmailError } from "@tp-types/commonApiTypes";

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

export { updateEmail };
