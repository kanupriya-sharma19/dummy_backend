import { Prisma, TurfOwnerType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function signupTurfOwner(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      turfName,
      turfLocation,
      ownerType,
      organizationName,
      registrationNumber,
      contactPersonName,
      contactPersonPhone,
    } = req.body;

    if (!Object.values(TurfOwnerType).includes(ownerType)) {
      res.status(400).json({
        status: false,
        message:
          "Invalid owner type. Must be either 'INDIVIDUAL' or 'ORGANIZATION'.",
      });
      return;
    }
    const existingTurfOwner = await prisma.turfOwner.findUnique({
      where: { email },
    });
    if (existingTurfOwner) {
      res.status(400).json({
        status: false,
        message: "Turf Owner already exists. Please Login",
      });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const turfOwner = await prisma.turfOwner.create({
      data: {
        name: ownerType === "INDIVIDUAL" ? name : null,
        email,
        password: hashedPassword,
        phoneNumber,
        turfName,
        turfLocation,
        ownerType,
        organizationName:
          ownerType === "ORGANIZATION" ? organizationName : null,
        registrationNumber:
          ownerType === "ORGANIZATION" ? registrationNumber : null,
        contactPersonName:
          ownerType === "ORGANIZATION" ? contactPersonName : null,
        contactPersonPhone:
          ownerType === "ORGANIZATION" ? contactPersonPhone : null,
      } as Prisma.TurfOwnerCreateInput,
    });

    const token = jwt.sign(
      { id: turfOwner.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(201).json({
      status: true,
      message: "Turf Owner successfully signed up",
      data: { turfOwner, token },
    });
  } catch (err: any) {
    console.error("Error signing up Turf Owner:", err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

export async function updateDetails(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const turfOwnerId = req.turfOwner;
    const profilePhoto = req.file ? (req.file as any).path : null;
    const turfPhotos = req.files
      ? (req.files as Express.Multer.File[]).map((file) => file.path)
      : req.file
        ? [(req.file as Express.Multer.File).path]
        : [];
    const {
      turfDescription,
      turfSize,
      turfGames,
      amenities,
      pricePerPerson,
      totalSeats,
      available,
      availabilitySlots,
    } = req.body;
    const updatedTurfOwner = await prisma.turfOwner.update({
      where: { id: turfOwnerId },
      data: {
        profilePhoto,
        turfDescription,
        turfSize,
        turfGames: turfGames ? (turfGames as string[]) : [],
        amenities: amenities ? (amenities as string[]) : [],
        pricePerPerson,
        totalSeats,
        available,
        availabilitySlots: availabilitySlots
          ? (availabilitySlots as Prisma.JsonObject)
          : {},
        turfPhoto: turfPhotos.length ? turfPhotos : undefined,
      },
    });
    res.status(201).json({
      status: true,
      message: "Turf Owner updated successfully",
      data: updatedTurfOwner,
    });
  } catch (err: any) {
    console.error("Error updating ", err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

export async function loginTurfOwner(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password } = req.body;
    const turfOwner = await prisma.turfOwner.findUnique({ where: { email } });
    if (!turfOwner) {
      res.status(401).json({ status: false, message: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, turfOwner.password);
    if (!isMatch) {
      res.status(401).json({ status: false, message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: turfOwner.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(200).json({
      status: true,
      message: "Login successful",
      data: { turfOwner, token },
    });
  } catch (err: any) {
    console.error("Error login ", err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}
export async function logoutTurfOwner(req: Request, res: Response) {
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
