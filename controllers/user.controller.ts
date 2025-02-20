import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function getUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany();
  res.json({
    status: true,
    message: "Users Successfully fetched",
    data: users,
  });
}

export async function getUser(req: Request, res: Response) {
  const { userid } = req.params;
  const user = await prisma.user.findFirst({ where: { id: userid } });
  res.json({ status: true, message: "User Successfully fetched", data: user });
}

export const signupUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { name, email, password, dob, gender, city, gamePreferences } =
      req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    const profilePhoto = req.file ? (req.file as any).path : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dob: dob ? new Date(dob) : null,
        gender,
        city,
        gamePreferences,
        profilePhoto,
      } as Prisma.UserUncheckedCreateInput,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(201).json({
      status: true,
      message: "User successfully signed up",
      data: { user, token },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    next(error);
  }
};

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: { user, token },
    });
  } catch (error: any) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { dob, gender, city, gamePreferences } = req.body;
    const profilePhoto = req.file ? (req.file as any).path : null;

    const updatedUser = await prisma.user.update({
      where: { id: req.user },
      data: {
        dob: dob ? new Date(dob) : undefined,
        gender,
        city,
        gamePreferences: gamePreferences || undefined,
        profilePhoto,
      },
    });

    res.json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ status: false, message: error.message || "Server error" });
  }
}

export async function generateResetLink(
  req: Request,
  res: Response,
): Promise<any> {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ status: false, message: "User not found" });
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiration: new Date(Date.now() + 3600000) }, // 1 hour expiration
  });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `Click on the link to reset your password: ${resetLink}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ status: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ status: false, message: "Error sending email" });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<any> {
  const { token, newPassword } = req.body;

  // Debug log for received token
  console.log("Received token:", token);

  // Find user by reset token
  const user = await prisma.user.findUnique({
    where: { resetToken: token },
  });

  // Log user data to see what is returned
  console.log("User found:", user);

  if (!user) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid or expired token" });
  }

  // Check if token has expired
  const isTokenExpired =
    user.resetTokenExpiration && user.resetTokenExpiration < new Date();
  if (isTokenExpired) {
    return res
      .status(400)
      .json({ status: false, message: "Token has expired" });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password and clear the reset token fields
  await prisma.user.update({
    where: { resetToken: token },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiration: null,
    },
  });

  res
    .status(200)
    .json({ status: true, message: "Password updated successfully" });
}

export async function logoutUser(req: Request, res: Response) {
  try {
    const isLocal = process.env.NODE_ENV !== "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: !isLocal,
      sameSite: "strict",
    });

    res.status(200).json({ status: true, message: "Logout successful" });
  } catch (error: any) {
    res
      .status(500)
      .json({ status: false, message: error.message || "Server error" });
  }
}

export async function changePassword(
  req: Request,
  res: Response,
): Promise<any> {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res
        .status(400)
        .json({ status: false, message: "Incorrect old password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return res
      .status(200)
      .json({ status: true, message: "Password changed successfully" });
  } catch (err: any) {
    console.error("Error changing password ", err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}
