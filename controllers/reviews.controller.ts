import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createReview = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { turfId, rating, comment } = req.body;
    
    const userId = req.user.id;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      return res.status(404).json({ error: "User not found. Please login again." });
    }
    

    if (!userId || !turfId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        turfId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        error: "You have already reviewed this turf",
      });
    }

    if (!userId || !turfId || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        turfId,
        rating,
        comment,
      },
    });
    const turf = await prisma.turfOwner.findUnique({
      where: { id: turfId },
      select: { countReviews: true, ratings: true },
    });

    if (turf) {
      const newReviewCount = turf.countReviews + 1;
      const newAverageRating =
        (turf.ratings * turf.countReviews + rating) / newReviewCount;

      await prisma.turfOwner.update({
        where: { id: turfId },
        data: {
          countReviews: newReviewCount,
          ratings: newAverageRating,
        },
      });
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
};
export const getTurfReviews = async (req: Request, res: Response) => {
  const { turfId } = req.params;

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

export const getUserReviews = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: { turf: { select: { turfName: true, turfLocation: true } } },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: "Failed to update review" });
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: "Review not found" });

    if (review.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.review.delete({ where: { id } });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
};
