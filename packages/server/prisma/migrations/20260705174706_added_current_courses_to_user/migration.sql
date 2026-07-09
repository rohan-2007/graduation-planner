-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentCourses" TEXT[] DEFAULT ARRAY[]::TEXT[];
