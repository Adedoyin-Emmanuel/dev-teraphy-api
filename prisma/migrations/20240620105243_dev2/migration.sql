/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
