/*
  Warnings:

  - You are about to drop the column `fromEmail` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `toEmail` on the `Message` table. All the data in the column will be lost.
  - Added the required column `authorEmail` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentToEmail` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_fromEmail_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_toEmail_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fromEmail",
DROP COLUMN "toEmail",
ADD COLUMN     "authorEmail" TEXT NOT NULL,
ADD COLUMN     "sentToEmail" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorEmail_fkey" FOREIGN KEY ("authorEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentToEmail_fkey" FOREIGN KEY ("sentToEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
