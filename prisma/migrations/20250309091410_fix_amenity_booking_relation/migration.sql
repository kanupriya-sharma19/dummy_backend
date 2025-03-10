/*
  Warnings:

  - The `availabilitySlots` column on the `TurfOwner` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TurfOwner" DROP COLUMN "availabilitySlots",
ADD COLUMN     "availabilitySlots" TEXT[];
