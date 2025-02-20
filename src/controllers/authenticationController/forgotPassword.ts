// TODO Implement
// TODO Typing
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import { QueriedUser } from "../../types/userTypes";
import { ErrorResponse } from "../../types/apiTypes";
import sendResponse from "../../utility/responseHandler";

// TODO Outsource -  Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "Gmail",
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

    // Find user
    const user: QueriedUser | null = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      errors.message = "User not found";
      return sendResponse<null, null>(res, {
        status: 404,
        message: "Request new password failed",
        error: errors,
      });
    }

    // Generate token
    const resetToken: string = crypto.randomBytes(32).toString("hex");
    const resetTokenExp: Date = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    // Store in DB
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExp },
    });

    // Send email
    const resetLink: string = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // TODO Set up basic email template
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click the link to reset your password: ${resetLink} (available for 15 minutes)`,
    });

    return sendResponse<null, null>(res, {
      status: 200,
      message: "Reset link sent to your email",
    });
  }
);

export default forgotPassword;
