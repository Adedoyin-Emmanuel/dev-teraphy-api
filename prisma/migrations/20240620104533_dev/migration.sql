-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('verify', 'refresh', 'access');

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiresBy" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
