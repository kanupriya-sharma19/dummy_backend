/*
  Warnings:

  - You are about to drop the column `ownerId` on the `SportsAmenity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SportsAmenity" DROP CONSTRAINT "SportsAmenity_TurfOwner_fkey";

-- DropForeignKey
ALTER TABLE "SportsAmenity" DROP CONSTRAINT "SportsAmenity_User_fkey";

-- AlterTable
ALTER TABLE "SportsAmenity" DROP COLUMN "ownerId",
ADD COLUMN     "turfOwnerId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "SportsAmenity" ADD CONSTRAINT "SportsAmenity_User_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsAmenity" ADD CONSTRAINT "SportsAmenity_TurfOwner_fkey" FOREIGN KEY ("turfOwnerId") REFERENCES "TurfOwner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
