import { Request, Response } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const requestVerificationEmail = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const errors: ErrorResponse<null> = {};

    if (!email) {
      errors.message = "Email is required";
      return sendResponse(res, {
        status: 400,
        message: "Email is required",
        error: errors,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendResponse(res, {
        status: 200,
        message: "If the email exists, a verification link has been sent.",
      });
    }

    if (user.verifiedAt) {
      return sendResponse(res, {
        status: 200,
        message: "User is already verified.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenExp = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { verifyToken: tokenHash, verifyTokenExp: tokenExp },
    });

    const verifyLink = `${process.env.FRONTEND_APP_URL}/verify-email?token=${token}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        text: `Click the link below to verify your email:
${verifyLink}

This link is valid for 15 minutes.`,
        html: `<p>Click the link below to verify your email:</p>
               <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #FFF; text-decoration: none; border-radius: 5px;">Verify Email</a>
               <p>This link is valid for 15 minutes.</p>`,
      });
    } catch (error) {
      return sendResponse(res, { status: 500, message: "Error sending email" });
    }

    return sendResponse(res, {
      status: 200,
      message: "Verification link sent to your email.",
    });
  }
);

const verifyUserByEmail = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { token } = req.query;
    const errors: ErrorResponse<null> = {};

    if (!token) {
      errors.message = "Invalid or missing token";
      return sendResponse(res, {
        status: 400,
        message: "Invalid or missing token",
        error: errors,
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token as string)
      .digest("hex");
    const user = await prisma.user.findFirst({
      where: { verifyToken: tokenHash, verifyTokenExp: { gt: new Date() } },
    });

    if (!user) {
      errors.message = "Invalid or expired token";
      return sendResponse(res, {
        status: 400,
        message: "Invalid or expired token",
        error: errors,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verifiedAt: new Date(), verifyToken: null, verifyTokenExp: null },
    });

    return sendResponse(res, {
      status: 200,
      message: "Email verified successfully.",
    });
  }
);

export { requestVerificationEmail, verifyUserByEmail };
