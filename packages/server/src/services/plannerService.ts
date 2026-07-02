import { PrismaClient } from "../../generated/prisma";
import { buildGraph, course } from "../graduationPlanner/graph";
import { generatePlan } from "../graduationPlanner/scheduler";

const prisma = new PrismaClient();

export const generateStudentPlan = async (studentId: number) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return {
      message: "User does not exist",
    };
  }

  const graph = await buildGraph();

  const completedCourses = student.completedCourses;

  const allCourses = (await prisma.course.findMany()) as course[];

  const maxCreditsPerSemester = 15;

  // const numberOfSemestersLeft = 4;

  const plan = generatePlan(
    graph,
    completedCourses,
    allCourses,
    maxCreditsPerSemester,
    // numberOfSemestersLeft,
  );

  console.log("plan: ", plan);

  return plan;
};
