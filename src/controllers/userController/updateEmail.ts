import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import {
  QueriedUserUpdateEmail,
  UserUpdateEmailRequestBody,
} from "@tp-types/userTypes";
import { ErrorResponse, UpdateEmailError } from "@tp-types/commonApiTypes";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";

const updateEmail = errorHandlerMiddleware(
  async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, email }: UserUpdateEmailRequestBody = req.body;
    const userId: number | undefined = req.user?.id;

    const errors: ErrorResponse<UpdateEmailError> = {};
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
    if (!email) errors.fields.email = "Email is missing.";

    if (Object.keys(errors.fields).length > 0) {
      return sendResponse(res, {
        status: 400,
        message: "Update user error",
        error: errors,
      });
    }

    const user: QueriedUserUpdateEmail | null = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, email: true },
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

    const normalizedEmail: string = email.toLowerCase();

    const isEmailUnchanged: boolean = user.email === normalizedEmail;
    if (isEmailUnchanged) {
      errors.fields.email = "Email is already in use.";
      // TODO Revise sendResponse type
      return sendResponse<null, UpdateEmailError>(res, {
        status: 400,
        message: "Update user error",
        error: errors,
      });
    }

    // TODO Proper typing
    const emailInUse = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: { id: userId },
      },
    });

    if (emailInUse) {
      errors.fields.email = "This email is already in use by another account.";
      return sendResponse(res, {
        status: 400,
        message: "Update user error",
        error: errors,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: normalizedEmail },
    });

    return sendResponse<null, null>(res, {
      status: 200,
      message: "Email updated successfully.",
    });
  }
);

export default updateEmail;
