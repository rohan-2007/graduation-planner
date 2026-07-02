-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" DOUBLE PRECISION NOT NULL,
    "school" TEXT NOT NULL,
    "prerequisiteCodes" JSONB,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
