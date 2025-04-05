import { Request, Response } from "express";
import { razorpay } from "../config/razorpay.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { parse, isBefore, isAfter } from "date-fns";

const prisma = new PrismaClient();

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { userId, turfId, amount, numberOfSeats, bookedFrom, bookedTo, day } =
    req.body;

  try {
    const bookedFromFormatted = parse(
      bookedFrom,
      "dd-MM-yyyy HH:mm",
      new Date(),
    );
    const bookedToFormatted = parse(bookedTo, "dd-MM-yyyy HH:mm", new Date());

    if (!isBefore(bookedFromFormatted, bookedToFormatted)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking time range" });
    }

    const turf = await prisma.turfOwner.findUnique({
      where: { id: turfId },
    });

    if (!turf) {
      return res
        .status(404)
        .json({ success: false, message: "Turf not found" });
    }

    if (numberOfSeats > turf.availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${turf.availableSeats} seats are available`,
      });
    }

    const expectedAmount =
      Math.round((turf.pricePerPerson ?? 0) * numberOfSeats * 100) / 100;
    if (expectedAmount !== amount) {
      return res.status(400).json({
        success: false,
        message: `Invalid amount. Expected ${expectedAmount}`,
      });
    }

    if (turf.availabilitySlots) {
      const slotsData: {
        day: string;
        slots: { start: string; end: string }[];
      }[] = JSON.parse(turf.availabilitySlots as unknown as string);

      const matchingDay = slotsData.find(
        (slotDay) => slotDay.day.toLowerCase() === day.toLowerCase(),
      );

      if (!matchingDay) {
        return res.status(400).json({
          success: false,
          message: `No slots available on ${day}`,
        });
      }

      const isValidSlot = matchingDay.slots.some((slot) => {
        const slotStart = parse(slot.start, "HH:mm", bookedFromFormatted);
        const slotEnd = parse(slot.end, "HH:mm", bookedToFormatted);

        return (
          !isBefore(bookedFromFormatted, slotStart) &&
          !isAfter(bookedToFormatted, slotEnd)
        );
      });

      if (!isValidSlot) {
        return res.status(400).json({
          success: false,
          message: "Selected time is not within available slots",
        });
      }
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        turfId,
        numberOfSeats: Number(numberOfSeats),
        bookedFrom: bookedFromFormatted,
        bookedTo: bookedToFormatted,
        day,
      },
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: booking.id,
      notes: {
        userId,
        turfId,
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      bookingId: booking.id,
      currency: order.currency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
      },
    });

    return res.json({
      success: true,
      message: "Payment verified & booking confirmed",
    });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }
};
