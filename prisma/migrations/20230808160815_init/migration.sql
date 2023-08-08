/*
  Warnings:

  - You are about to drop the column `fromId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `toId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `fromEmail` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toEmail` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_toId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fromId",
DROP COLUMN "toId",
ADD COLUMN     "fromEmail" TEXT NOT NULL,
ADD COLUMN     "toEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromEmail_fkey" FOREIGN KEY ("fromEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_toEmail_fkey" FOREIGN KEY ("toEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
