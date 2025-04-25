import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import { QueriedUser } from "@tp-types/userTypes";
import { sendMail } from "@src/utility/sendMail";
import { MailOptions } from "@tp-types/mail";
import { RequestPasswordResetEmailBody } from "@tp-types/authenticationTypes";

const requestPasswordResetEmail = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { email }: RequestPasswordResetEmailBody = req.body;

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

    const resetTokenPlain = crypto.randomBytes(32).toString("hex");
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(resetTokenPlain)
      .digest("hex");

    const resetTokenExp: Date = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await prisma.user.update({
      where: { email },
      data: { resetToken: resetTokenHashed, resetTokenExp },
    });

    const passwordResetLink: string = `${process.env.API_URL}/auth/reset-password-redirect-link?token=${resetTokenPlain}`;

    const passwordResetEmail: MailOptions = {
      to: email,
      subject: "Password Reset",
      text: `Click the link below to reset your password:\n${passwordResetLink}\n\nThis link is valid for 15 minutes.`,
      html: `<p>Click the link below to reset your password:</p>
             <a href="${passwordResetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #FFF; text-decoration: none; border-radius: 5px;">Reset Password</a>
             <p>This link is valid for 15 minutes.</p>`,
    };

    try {
      await sendMail(passwordResetEmail);
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

export default requestPasswordResetEmail;
