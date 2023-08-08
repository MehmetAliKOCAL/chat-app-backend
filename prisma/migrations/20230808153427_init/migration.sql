/*
  Warnings:

  - You are about to drop the column `from` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Message` table. All the data in the column will be lost.
  - Added the required column `fromId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "fromId" TEXT NOT NULL,
ADD COLUMN     "toId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_toId_fkey" FOREIGN KEY ("toId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
