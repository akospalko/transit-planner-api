import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import { QueriedUser } from "@tp-types/userTypes";
import { ResetPasswordRequestBody } from "@tp-types/authenticationTypes";

const resetPassword = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { token, newPassword }: ResetPasswordRequestBody = req.body;
    const errors: ErrorResponse<null> = {};

    if (!token || !newPassword) {
      errors.message = "Reset token and new password are required.";
      return sendResponse<null, null>(res, {
        status: 400,
        message: "Refresh password failed",
        error: errors,
      });
    }

    const hashedToken: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user: QueriedUser | null = await prisma.user.findFirst({
      where: { resetToken: hashedToken, resetTokenExp: { gt: new Date() } },
    });

    if (!user) {
      errors.message = "Invalid or expired reset token";
      return sendResponse<null, null>(res, {
        status: 400,
        message: "Refresh password failed",
        error: errors,
      });
    }

    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
    });

    return sendResponse<null, null>(res, {
      status: 200,
      message: "Password reset successful",
    });
  }
);

export default resetPassword;
