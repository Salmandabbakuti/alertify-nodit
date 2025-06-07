/*
  Warnings:

  - You are about to drop the column `addresses` on the `monitors` table. All the data in the column will be lost.
  - Added the required column `address` to the `monitors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "monitors" DROP COLUMN "addresses",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "description" TEXT DEFAULT '',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
