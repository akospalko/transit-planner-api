-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifyEmailToken" TEXT,
ADD COLUMN     "verifyEmailTokenExp" TIMESTAMP(3);
