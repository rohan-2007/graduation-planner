import { course } from "@/graduationPlanner/graph";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export const degreeAudit = async (studentId: number) => {
  var completedCredits = 0;

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return {
      message: "User does not exist",
    };
  }

  const completedCourses = student.completedCourses;

  const allCourses = (await prisma.course.findMany()) as course[];

  for (const course of completedCourses) {
    const courseObj = allCourses.find((c) => c.code == course);
    const credits = courseObj ? courseObj.credits : 0;
    completedCredits += credits;
  }

  const requiredCourses = student.requiredCourses;

  const remainingCourses: course[] = [];

  for (const course of requiredCourses) {
    if (!completedCourses.includes(course)) {
      const remainingCourseObj = allCourses.find((c) => c.code == course);
      if (remainingCourseObj) {
        remainingCourses.push(remainingCourseObj);
      }
    }
  }

  var remainingCredits = 0;

  for (const course of remainingCourses) {
    remainingCredits += course.credits;
  }

  const graduationEligible = remainingCredits == 0;

  console.log("here");

  return {
    completedCredits: completedCredits,
    remainingCredits: remainingCredits,
    remainingCourses: remainingCourses.map((course) => course.code),
    graduationEligible: graduationEligible,
  };
};
