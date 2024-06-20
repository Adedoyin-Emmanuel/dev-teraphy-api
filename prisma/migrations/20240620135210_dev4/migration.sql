-- DropIndex
DROP INDEX "User_googleId_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "googleId" DROP DEFAULT;
