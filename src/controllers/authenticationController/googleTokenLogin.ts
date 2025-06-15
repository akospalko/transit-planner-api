// TODO Add typing
// TODO Revise logic
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import { QueriedUser } from "@tp-types/userTypes";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleTokenLogin = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { idToken } = req.body;

    if (!idToken) {
      return sendResponse(res, {
        status: 400,
        message: "Missing Google ID token",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken, // TODO Revise proper value
      audience: process.env.GOOGLE_CLIENT_ID, // TODO Revise proper value
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return sendResponse(res, {
        status: 401,
        message: "Invalid Google token",
      });
    }

    const email = payload.email;
    const username = payload.name?.toLowerCase().replace(/\s/g, "") ?? email;

    let user: QueriedUser | null = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: await bcrypt.hash("google-oauth-" + email, 10), // dummy password
          roles: ["USER"],
          verifiedAt: new Date(),
        },
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, roles: user.roles },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return sendResponse(res, {
      status: 200,
      message: "Google login successful",
      data: { accessToken, refreshToken },
    });
  }
);

export default googleTokenLogin;
