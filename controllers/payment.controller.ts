import { Request, Response } from "express";
import { razorpay } from "../config/razorpay.js";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { parse } from "date-fns";

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
