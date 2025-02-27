-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'TURFOWNER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT NOT NULL DEFAULT 'N/A',
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "TurfOwner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "turfPhoto" TEXT[],
    "turfName" TEXT NOT NULL,
    "turfDescription" TEXT NOT NULL,
    "turfLocation" TEXT NOT NULL,
    "turfSize" TEXT NOT NULL,
    "turfGames" TEXT[],
    "amenities" TEXT[],
    "ratings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "availabilitySlots" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TurfOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "turfId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numberOfSeats" INTEGER NOT NULL,
    "bookedFrom" TIMESTAMP(3) NOT NULL,
    "bookedTo" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TurfOwner_email_key" ON "TurfOwner"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_turfId_fkey" FOREIGN KEY ("turfId") REFERENCES "TurfOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
