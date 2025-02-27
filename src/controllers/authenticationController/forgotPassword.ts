// TODO Typing
import { Request, Response } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import { QueriedUser } from "../../types/userTypes";
import { ErrorResponse } from "../../types/apiTypes";
import sendResponse from "../../utility/responseHandler";

// TODO Outsource -  Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
      errors.message = "User not found"; // TODO Replace with a more ambigous info -> success -> email is sent to email if existing...
      return sendResponse<null, null>(res, {
        status: 404,
        message: "Request new password failed",
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
    const isDev = process.env.NODE_ENV === "development";
    const RESET_LINK_PREFIX = isDev
      ? process.env.RESET_LINK_PREFIX_DEV
      : process.env.RESET_LINK_PREFIX_PROD;
    const resetLink: string = `${RESET_LINK_PREFIX}/reset-password?token=${resetTokenPlain}`;

    // TODO Set up basic email template
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
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
