/*
  Warnings:

  - You are about to drop the column `hasSeen` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "hasSeen",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seenBy" TEXT[] DEFAULT ARRAY[]::TEXT[];
