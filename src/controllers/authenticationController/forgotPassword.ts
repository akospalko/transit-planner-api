import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import { QueriedUser } from "@tp-types/userTypes";
import { sendMail } from "@src/utility/sendMail";

interface ForgotPasswordRequestBody {
  email: string;
}

const forgotPassword = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { email }: ForgotPasswordRequestBody = req.body;

    const errors: ErrorResponse<null> = {};

    if (!email) {
      errors.message = "Email is required";
      return sendResponse<null, null>(res, {
        status: 400,
        message: "Request new password failed",
        error: errors,
      });
    }

    const user: QueriedUser | null = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      errors.message = "If the email exists, a reset link has been sent.";
      return sendResponse<null, null>(res, {
        status: 200,
        message: "Request new password successful",
        error: errors,
      });
    }

    // Generate token
    const resetTokenPlain = crypto.randomBytes(32).toString("hex");
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(resetTokenPlain)
      .digest("hex");

    const resetTokenExp: Date = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    // Store in DB
    await prisma.user.update({
      where: { email },
      data: { resetToken: resetTokenHashed, resetTokenExp },
    });

    // Send email
    const resetLink: string = `${process.env.FRONTEND_APP_URL}/reset-password?token=${resetTokenPlain}`;

    try {
      await sendMail({
        to: email,
        subject: "Password Reset",
        text: `Click the link below to reset your password:\n${resetLink}\n\nThis link is valid for 15 minutes.`,
        html: `<p>Click the link below to reset your password:</p>
               <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #FFF; text-decoration: none; border-radius: 5px;">Reset Password</a>
               <p>This link is valid for 15 minutes.</p>`,
      });
    } catch (error) {
      return sendResponse<null, null>(res, {
        status: 500,
        message: "Error sending email",
      });
    }

    return sendResponse<null, null>(res, {
      status: 200,
      message: "Reset link sent to your email",
    });
  }
);

export default forgotPassword;
