-- AlterTable
ALTER TABLE "User" ADD COLUMN     "requiredCourses" TEXT[] DEFAULT ARRAY[]::TEXT[];
