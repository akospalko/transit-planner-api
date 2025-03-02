import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { ErrorResponse } from "../../types/apiTypes";
import { QueriedUser } from "../../types/userTypes";

interface RefreshPasswordRequestBody {
  resetToken: string;
  newPassword: string;
}

const refreshPassword = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { resetToken, newPassword }: RefreshPasswordRequestBody = req.body;
    const errors: ErrorResponse<null> = {};

    if (!resetToken || !newPassword) {
      errors.message = "Reset token and new password are required.";
      return sendResponse<null, null>(res, {
        status: 400,
        message: "Refresh password failed",
        error: errors,
      });
    }

    // Hash the provided token to match stored hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user by hashed resetToken and ensure token is not expired
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

    // Hash new password
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
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
