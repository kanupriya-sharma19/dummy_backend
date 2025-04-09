import { Prisma, TurfOwnerType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { any, z } from "zod";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

const availabilitySchema = z.array(
  z.object({
    day: z.string(),
    date: z
      .string()
      .regex(/^\d{2}-\d{2}-\d{4}$/, "Invalid date format (dd-MM-yyyy)")
      .optional(),
    slots: z.array(
      z.object({
        start: z.string().regex(
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Invalid time format (HH:MM)"
        ),
        end: z.string().regex(
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Invalid time format (HH:MM)"
        ),
      }),
    ),
  }),
);


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
        ownerType: ownerType as TurfOwnerType,
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

export async function getAllTurfOwners(req: Request, res: Response): Promise<any> {
  try {
    const turfOwners = await prisma.turfOwner.findMany({
      where: {
        available: true,
      },
orderBy: {
        turfName: 'asc',
      },
    });

    res.status(200).json(turfOwners);
  } catch (err) {
    res.status(500).json({ message: "Error fetching turf owners", error: err });
  }
}



export async function updateDetails(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const turfOwnerId = req.turfOwner.id;
    const profilePhoto =
      req.files && "profilePhoto" in req.files
        ? (req.files["profilePhoto"] as Express.Multer.File[])[0].path
        : null;
    const turfPhotos =
      req.files && "turfPhoto" in req.files
        ? (req.files["turfPhoto"] as Express.Multer.File[]).map(
            (file) => file.path,
          )
        : [];
    const {
      turfDescription,
      turfSize,
      pricePerPerson,
      totalSeats,
      available,
      availableSeats,
      availabilitySlots,
    } = req.body;
    const parsedAvailability = availabilitySlots
      ? JSON.parse(availabilitySlots)
      : [];
    const parsedAvailable = available === "true";

    const validatedAvailability = availabilitySchema.parse(parsedAvailability);
    let turfGames;
    try {
      turfGames = req.body.turfGames ? JSON.parse(req.body.turfGames) : [];
    } catch {
      turfGames = [];
    }
    let amenities;
    try {
      amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
    } catch {
      amenities = [];
    }
    turfGames = Array.isArray(turfGames) ? turfGames : [turfGames];
    amenities = Array.isArray(amenities) ? amenities : [amenities];
    const parsedPricePerPerson =
      pricePerPerson !== undefined ? parseFloat(pricePerPerson) : undefined;
    const parsedTotalSeats =
      totalSeats !== undefined ? parseInt(totalSeats, 10) : undefined;
    const updatedTurfOwner = await prisma.turfOwner.update({
      where: { id: turfOwnerId },
      data: {
        profilePhoto,
        turfDescription,
        turfSize,
        turfGames,
        amenities,
        pricePerPerson: parsedPricePerPerson,
        totalSeats: parsedTotalSeats,
        available: parsedAvailable,
        availableSeats: parseInt(availableSeats),
        availabilitySlots: validatedAvailability ? validatedAvailability : [],
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

export async function logoutTurfOwner(
  req: Request,
  res: Response,
): Promise<any> {
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

export async function getAvailableSlots(
  req: Request,
  res: Response,
): Promise<any> {
  try {
    const turf = await prisma.turfOwner.findUnique({
      where: { id: req.turfOwner.id },
    });
    if (!turf) {
      return res
        .status(404)
        .json({ status: false, message: "Turf not found. Please login first" });
    }
    const bookings = turf.availabilitySlots;
    return res.status(200).json({
      status: true,
      message: "Bookings successfully retrieved",
      bookings,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ status: false, message: err.message || "Server error" });
  }
}

export async function getBookings(req: Request, res: Response): Promise<any> {
  try {
    const turf = await prisma.turfOwner.findUnique({
      where: { id: req.turfOwner.id },
      include: { bookings: true },
    });
    if (!turf) {
      return res
        .status(404)
        .json({ status: false, message: "Turf not found. Please login first" });
    }
    const now = new Date();
    const pastBookings = turf.bookings
      .filter((b) => new Date(b.bookedTo) < now)
      .sort(
        (a, b) =>
          new Date(b.bookedTo).getTime() - new Date(a.bookedTo).getTime(),
      );
    const upcomingBookings = turf.bookings
      .filter((b) => new Date(b.bookedFrom) >= now)
      .sort(
        (a, b) =>
          new Date(a.bookedFrom).getTime() - new Date(b.bookedFrom).getTime(),
      );
    return res.status(200).json({
      status: true,
      pastBookings,
      upcomingBookings,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ status: false, message: err.message || "Server error" });
  }
}

export const getTurfReviews = async (req: Request, res: Response) => {
  const { turfId } =  req.turfOwner.id;

  try {
    const reviews = await prisma.review.findMany({
      where: { turfId },
      include: { user: { select: { name: true, profilePhoto: true } } },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};


export async function generateResetLink(
  req: Request,
  res: Response,
): Promise<any> {
  const { email } = req.body;
  const turfOwner = await prisma.turfOwner.findUnique({ where: { email } });
  if (!turfOwner) {
    return res.status(404).json({ status: false, message: "User not found" });
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  await prisma.turfOwner.update({
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

  const resetLink = `${process.env.TURF_URL}/reset-password?token=${resetToken}`;
  console.log(resetLink);
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
  const { newPassword } = req.body;
if (!newPassword) {
  return res.status(400).json({ message: "New password is required" });
}
  const token = req.query.token as string;
  const user = await prisma.turfOwner.findUnique({
    where: { resetToken: token },
  });

  

  if (!user) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid or expired token" });
  }

  const isTokenExpired =
    user.resetTokenExpiration && user.resetTokenExpiration < new Date();
  if (isTokenExpired) {
    return res
      .status(400)
      .json({ status: false, message: "Token has expired" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.turfOwner.update({
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


export async function changePassword(
  req: Request,
  res: Response,
): Promise<any> {
  try {
    if (!req.turfOwner) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized: No user ID found" });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.turfOwner.id as string;

    const user = await prisma.turfOwner.findUnique({ where: { id: userId } });

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
    await prisma.turfOwner.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ status: true, message: "Password changed successfully" });
  } catch (err: any) {
    console.error("Error changing password:", err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
}