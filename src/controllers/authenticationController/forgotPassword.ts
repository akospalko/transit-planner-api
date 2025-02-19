// TODO Implement
// TODO Typing
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "../../../prisma/prisma";

// TODO Outsource - Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate token
  const resetToken: string = crypto.randomBytes(32).toString("hex");
  const resetTokenExp = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

  // Store in DB
  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExp },
  });

  // Send email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    text: `Click the link to reset your password: ${resetLink}`,
  });

  res.json({ message: "Reset link sent to your email" });
};

export default forgotPassword;
