import { PrismaClient } from "../../generated/prisma";
import { buildGraph, course } from "../graduationPlanner/graph";
import { generatePlan } from "../graduationPlanner/scheduler";

const prisma = new PrismaClient();

export const simulateFailure = async (
  studentId: number,
  failedCourse: string,
) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return {
      message: "User does not exist",
    };
  }

  // var completedCourses = student.completedCourses;

  // console.log("Earlier completed courses: ", completedCourses);

  const graph = await buildGraph();

  const allCourses = (await prisma.course.findMany()) as course[];

  const maxCreditsPerSemester = 15;

  const actualPlan = generatePlan(
    graph,
    [...student.completedCourses],
    allCourses,
    maxCreditsPerSemester,
  );

  const projectedCompletedCourses = student.completedCourses.filter(
    (course) => course != failedCourse,
  );

  // console.log("Later completed courses: ", completedCourses);

  // const numberOfSemestersLeft = 4;

  const projectedPlan = generatePlan(
    graph,
    [...projectedCompletedCourses],
    allCourses,
    maxCreditsPerSemester,
    // numberOfSemestersLeft,
  );

  var actualAvgCreditsPerSemester = 0;
  var actualNumSemesters = 0;

  for (const semester of actualPlan) {
    actualNumSemesters++;
    for (const course of semester.courses) {
      actualAvgCreditsPerSemester += course.credits;
    }
  }

  actualAvgCreditsPerSemester /= actualNumSemesters;

  var projectedAvgCreditsPerSemester = 0;
  var projectedNumSemesters = 0;

  for (const semester of projectedPlan) {
    projectedNumSemesters++;
    for (const course of semester.courses) {
      projectedAvgCreditsPerSemester += course.credits;
    }
  }

  projectedAvgCreditsPerSemester /= projectedNumSemesters;

  const graduationDelayed = projectedNumSemesters > actualNumSemesters;

  return {
    actualAvgCreditsPerSemester: actualAvgCreditsPerSemester,
    projectedAvgCreditsPerSemester: projectedAvgCreditsPerSemester,
    actualNumSemesters: actualNumSemesters,
    projectedNumSemesters: projectedNumSemesters,
    graduationDelayed: graduationDelayed,
    projectedPlan: projectedPlan,
  };
};
