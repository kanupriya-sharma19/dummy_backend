// searchRoutes.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CountResult {
  count: bigint;
}

export const searchTurfs = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { query, limit = 10, offset = 0 } = req.query;
    if (!query || typeof query !== "string") {
      return res
        .status(400)
        .json({ error: "Query is required and must be a string" });
    }

    // Fuzzy search using pg_trgm with % operator
    const results = await prisma.$queryRaw`
      SELECT id, "turfName", "turfLocation" AS location, "pricePerPerson" AS price, amenities
      FROM "TurfOwner"
      WHERE "turfName" % ${query} OR "turfLocation" % ${query}
      ORDER BY GREATEST(SIMILARITY("turfName", ${query}), SIMILARITY("turfLocation", ${query})) DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const totalResult = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*) AS count
      FROM "TurfOwner"
      WHERE "turfName" % ${query} OR "turfLocation" % ${query}
    `;

    const total = totalResult[0]?.count ? Number(totalResult[0].count) : 0;

    res.json({
      total,
      data: results,
    });
  } catch (error: any) {
    console.error("Search Error:", error.message);
    res.status(500).json({ error: "Search failed", details: error.message });
  } finally {
    await prisma.$disconnect();
  }
};
