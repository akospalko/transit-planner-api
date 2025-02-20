import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { ErrorResponse } from "../../types/apiTypes";
import { QueriedUser } from "../../types/userTypes";

// TODO Outsource
interface RefreshPasswordRequestBody {
  resetToken: string;
  newPassword: string;
}

const refreshPassword = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { resetToken, newPassword }: RefreshPasswordRequestBody = req.body;

    // TODO controller specific error response generic
    const errors: ErrorResponse<null> = {};

    // Validate resetToken and newPassword presence
    if (!resetToken || !newPassword) {
      errors.message = "Reset token and new password are required.";
      // TODO Type generic
      return sendResponse<null, null>(res, {
        status: 400,
        message: "Refresh password failed",
        error: errors,
      });
    }

    // Find user by resetToken
    const user: QueriedUser | null = await prisma.user.findFirst({
      where: { resetToken, resetTokenExp: { gt: new Date() } },
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

export default refreshPassword;
