/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `TurfOwner` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TurfOwner" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiration" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "TurfOwner_resetToken_key" ON "TurfOwner"("resetToken");
