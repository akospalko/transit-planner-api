import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import { QueriedUser } from "@tp-types/userTypes";
import sendResponse from "@src/utility/responseHandler";
import { sendMail } from "@src/utility/sendMail";

const requestUserVerificationEmail = errorHandlerMiddleware(
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

    const user: QueriedUser | null = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendResponse(res, {
        status: 200,
        message: "Verification link has been sent to your email address.",
      });
    }

    if (user.verifiedAt) {
      return sendResponse(res, {
        status: 200,
        message: "User is already verified.",
      });
    }

    const verifyTokenPlain: string = crypto.randomBytes(32).toString("hex");
    const verifyTokenHashed: string = crypto
      .createHash("sha256")
      .update(verifyTokenPlain)
      .digest("hex");

    const verifyTokenExp: Date = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await prisma.user.update({
      where: { email },
      data: {
        verifyEmailToken: verifyTokenHashed,
        verifyEmailTokenExp: verifyTokenExp,
      },
    });

    const verifyLink: string = `${process.env.API_URL}/auth/verify-email?token=${verifyTokenPlain}`;

    try {
      await sendMail({
        to: email,
        subject: "Verify Your Email",
        text: `Click the link below to verify your email:\n${verifyLink}\n\nThis link is valid for 15 minutes.`,
        html: `<p>Click the link below to verify your email:</p>
               <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #FFF; text-decoration: none; border-radius: 5px;">Verify Email</a>
               <p>Raw link: ${verifyLink}</p>,
               <p>This link is valid for 15 minutes.</p>`,
      });
    } catch (error) {
      return sendResponse(res, {
        status: 500,
        message: "Error sending email. Please try again later.",
      });
    }

    return sendResponse(res, {
      status: 200,
      message: "Verification link has been sent to your email address.",
    });
  }
);

export default requestUserVerificationEmail;
