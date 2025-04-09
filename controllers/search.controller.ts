import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { parse, isBefore, isAfter } from "date-fns";

const prisma = new PrismaClient();

interface TurfSearchResult {
  id: string;
  turfName: string;
  location: string;
  price: number;
  amenities: string[];
  availabilitySlots: string;
}

interface CountResult {
  count: bigint;
}

// export const searchTurfs = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const { query, limit = 10, offset = 0, day, startTime, endTime } = req.query;

//     if (query && typeof query !== "string") {
//       return res.status(400).json({ error: "Query must be a string if provided" });
//     }

//     const q = query as string;
//     const dayLower = (day as string)?.toLowerCase();

//     const turfsRaw = await prisma.$queryRaw<TurfSearchResult[]>`
//       SELECT id, "turfName", "turfLocation" AS location, "pricePerPerson" AS price, amenities, "availabilitySlots"
//       FROM "TurfOwner"
//       WHERE "available" = true
//       ${q ? Prisma.sql`AND ("turfName" % ${q} OR "turfLocation" % ${q})` : Prisma.empty}
//       ${q
//         ? Prisma.sql`ORDER BY GREATEST(SIMILARITY("turfName", ${q}), SIMILARITY("turfLocation", ${q})) DESC`
//         : Prisma.sql`ORDER BY "createdAt" DESC`}
//       LIMIT ${Number(limit)} OFFSET ${Number(offset)}
//     `;

//     const filteredTurfs = turfsRaw.filter((turf) => {
//       if (!day || !startTime || !endTime) return true;
//       if (!turf.availabilitySlots) return false;

//       try {
//         const slotsParsed = JSON.parse(turf.availabilitySlots) as {
//           day: string;
//           slots: { start: string; end: string }[];
//         }[];

//         const matchedDay = slotsParsed.find(
//           (d) => d.day.toLowerCase() === dayLower
//         );
//         if (!matchedDay) return false;

//         const reqStart = parse(startTime as string, "HH:mm", new Date());
//         const reqEnd = parse(endTime as string, "HH:mm", new Date());

//         return matchedDay.slots.some((slot) => {
//           const slotStart = parse(slot.start, "HH:mm", new Date());
//           const slotEnd = parse(slot.end, "HH:mm", new Date());

//           return !isBefore(reqStart, slotStart) && !isAfter(reqEnd, slotEnd);
//         });
//       } catch (err) {
//         console.error("JSON parse error in availabilitySlots", err);
//         return false;
//       }
//     });

//     res.json({
//       total: filteredTurfs.length,
//       data: filteredTurfs,
//     });
//   } catch (error: any) {
//     console.error("Search Error:\n", error.message);
//     res.status(500).json({ error: "Search failed", details: error.message });
//   }
// };

export const filterTurfsByPrice = async (req: Request, res: Response): Promise<any> => {
  try {
    const { minPrice, maxPrice, limit = 10, offset = 0 } = req.query;

    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

    const results = await prisma.$queryRaw`
      SELECT id, "turfName", "turfLocation" AS location, "pricePerPerson" AS price, amenities
      FROM "TurfOwner"
      WHERE "pricePerPerson" BETWEEN ${min} AND ${max} AND "available" = true
      ORDER BY "pricePerPerson" ASC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const totalResult = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*) AS count
      FROM "TurfOwner"
      WHERE "pricePerPerson" BETWEEN ${min} AND ${max}
    `;

    const total = totalResult[0]?.count ? Number(totalResult[0].count) : 0;
    if (total === 0) {
      return res.status(404).json({ message: "No turfs found" });
    }

    res.json({ total, data: results });
  } catch (error: any) {
    console.error("Price Filter Error:", error.message);
    res.status(500).json({ error: "Price filter failed", details: error.message });
  }
};

export const filterRentalsByPrice = async (req: Request, res: Response): Promise<any> => {
  try {
    const { minPrice, maxPrice, limit = 10, offset = 0 } = req.query;

    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Number.MAX_SAFE_INTEGER;

    const results = await prisma.$queryRaw`
      SELECT id, "name", "pricePerHour" AS price, photos, quantity
      FROM "SportsAmenity"
      WHERE "pricePerHour" BETWEEN ${min} AND ${max} AND "isAvailable" = true
      ORDER BY "pricePerHour" ASC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const totalResult = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*) AS count
      FROM "SportsAmenity"
      WHERE "pricePerHour" BETWEEN ${min} AND ${max}
    `;

    const total = totalResult[0]?.count ? Number(totalResult[0].count) : 0;
    if (total === 0) {
      return res.status(404).json({ message: "No matching rentals found" });
    }

    res.json({ total, data: results });
  } catch (error: any) {
    console.error("Rental Price Filter Error:", error.message);
    res.status(500).json({ error: "Rental price filter failed", details: error.message });
  }
};

export const searchRentals = async (req: Request, res: Response): Promise<any> => {
  try {
    const { query, limit = 10, offset = 0 } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required and must be a string" });
    }

    const results = await prisma.$queryRaw`
      SELECT id, "name", "pricePerHour" AS price, photos, quantity
      FROM "SportsAmenity"
      WHERE "name" % ${query} AND "isAvailable" = true
      ORDER BY GREATEST(SIMILARITY("name", ${query})) DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const totalResult = await prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(*) AS count
      FROM "SportsAmenity"
      WHERE "name" % ${query} AND "isAvailable" = true
    `;

    const total = totalResult[0]?.count ? Number(totalResult[0].count) : 0;
    if (total === 0) {
      return res.status(404).json({ message: "No matching rentals found" });
    }

    res.json({ total, data: results });
  } catch (error: any) {
    console.error("Search Error:", error.message);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};
