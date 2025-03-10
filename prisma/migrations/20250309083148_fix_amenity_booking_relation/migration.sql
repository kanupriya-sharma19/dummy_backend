/*
  Warnings:

  - Added the required column `day` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerType` to the `TurfOwner` table without a default value. This is not possible if the table is not empty.
  - Made the column `availableSeats` on table `TurfOwner` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TurfOwnerType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "AmenityOwnerType" AS ENUM ('USER', 'TURFOWNER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "reviewId" TEXT;

-- AlterTable
ALTER TABLE "TurfOwner" ADD COLUMN     "contactPersonName" TEXT,
ADD COLUMN     "contactPersonPhone" TEXT,
ADD COLUMN     "organizationName" TEXT,
ADD COLUMN     "ownerType" "TurfOwnerType" NOT NULL,
ADD COLUMN     "registrationNumber" TEXT,
ALTER COLUMN "availableSeats" SET NOT NULL,
ALTER COLUMN "availableSeats" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "SportsAmenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "ownerType" "AmenityOwnerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SportsAmenityBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "bookedFrom" TIMESTAMP(3) NOT NULL,
    "bookedTo" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsAmenityBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsAmenity" ADD CONSTRAINT "SportsAmenity_User_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsAmenity" ADD CONSTRAINT "SportsAmenity_TurfOwner_fkey" FOREIGN KEY ("ownerId") REFERENCES "TurfOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsAmenityBooking" ADD CONSTRAINT "SportsAmenityBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SportsAmenityBooking" ADD CONSTRAINT "SportsAmenityBooking_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "SportsAmenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
