-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('SPRING', 'AUTUMN', 'SUMMER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gradSemester" "Semester" NOT NULL DEFAULT 'SPRING';
