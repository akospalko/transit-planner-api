// TODO Implement
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../prisma/prisma";
import sendResponse from "../../utility/responseHandler";
import {
  JwtPayloadRefresh,
  BlacklistedRefreshToken,
} from "../../types/authenticationTypes";
import { TokenType } from "../../enums/authentication";
import { ErrorResponse, RefreshTokenResponseData } from "../../types/apiTypes";
import { QueriedUser } from "../../types/userTypes";
import bcrypt from "bcryptjs";

const refreshPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  // Find user by token
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExp: null },
  });

  res.json({ message: "Password reset successful" });
};

export default refreshPassword;
