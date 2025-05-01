import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import {
  QueriedUserPassword,
  UserUpdatePasswordRequestBody,
} from "@tp-types/userTypes";
import { ErrorResponse, UpdatePasswordError } from "@tp-types/commonApiTypes";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";

const updatePassword = errorHandlerMiddleware(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      currentPassword,
      newPassword,
      newPasswordConfirm,
    }: UserUpdatePasswordRequestBody = req.body;
    const userId: number | undefined = req.user?.id;
    const errors: ErrorResponse<UpdatePasswordError> = {};

    if (!userId) {
      errors.message = "Wrong user ID format.";
      return sendResponse(res, {
        status: 401,
        message: "Update password error",
        error: errors,
      });
    }

    errors.fields = {};
    if (!currentPassword)
      errors.fields.currentPassword = "Current password is missing.";
    if (!newPassword) errors.fields.newPassword = "New password is missing.";
    if (!newPasswordConfirm)
      errors.fields.newPasswordConfirm =
        "New password confirmation is missing.";
    if (
      newPassword &&
      newPasswordConfirm &&
      newPassword !== newPasswordConfirm
    ) {
      errors.fields.newPasswordConfirm =
        "New password and confirmation do not match.";
    }

    if (Object.keys(errors.fields).length > 0) {
      return sendResponse(res, {
        status: 400,
        message: "Update user error",
        error: errors,
      });
    }

    const user: QueriedUserPassword | null = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      errors.message = "User not found.";
      return sendResponse(res, {
        status: 404,
        message: "User not found",
        error: errors,
      });
    }

    const validPassword: boolean = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validPassword) {
      errors.fields.currentPassword = "Current password is incorrect.";
      return sendResponse(res, {
        status: 403,
        message: "Invalid credentials",
        error: errors,
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

export default updatePassword;
