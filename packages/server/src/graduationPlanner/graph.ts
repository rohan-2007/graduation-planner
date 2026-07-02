import { PrismaClient } from "../../generated/prisma";

export type Graph = Record<string, string[]>;

export type course = {
  id: number;
  code: string;
  name: string;
  credits: number;
  school: string;
  prerequisiteCodes: string[];
};

const prisma = new PrismaClient();

export const buildGraph = async () => {
  const courses = await prisma.course.findMany();

  const graph: Graph = {};

  for (const course of courses) {
    graph[course.code] = (course.prerequisiteCodes as string[]) || [];
  }

  return graph;
};

export const createDummyCourses = async () => {
  const dummy_course_data = [
    {
      code: "CS101",
      name: "Intro to CS",
      credits: 3.0,
      school: "dummy school",
      prerequisiteCodes: [],
    },
    {
      code: "CS201",
      name: "CS 2",
      credits: 3.5,
      school: "dummy school",
      prerequisiteCodes: ["CS101"],
    },
    {
      code: "CS301",
      name: "CS 3",
      credits: 4.0,
      school: "dummy school",
      prerequisiteCodes: ["CS201"],
    },
    {
      code: "CS350",
      name: "CS 4",
      credits: 3.0,
      school: "dummy school",
      prerequisiteCodes: ["CS201"],
    },
    {
      code: "CS450",
      name: "CS 5",
      credits: 3.5,
      school: "dummy school",
      prerequisiteCodes: ["CS301"],
    },
  ];

  await prisma.course.createMany({
    data: dummy_course_data,
    skipDuplicates: true,
  });
};

export const getAvailableCourses = (
  graph: Graph,
  completedCourses: string[],
): string[] => {
  const availableCourses: string[] = [];

  for (const course in graph) {
    if (completedCourses.includes(course)) {
      continue;
    }

    const prereqs = graph[course];

    const prereqsSatisfied = prereqs.every((prereq) =>
      completedCourses.includes(prereq),
    );

    if (prereqsSatisfied) {
      availableCourses.push(course);
    }
  }

  return availableCourses;
};

export const getCourses = async (courseCodes: string[] = []) => {
  if (courseCodes) {
    const courses = (await prisma.course.findMany({
      where: {
        code: {
          in: courseCodes,
        },
      },
    })) as course[];
    return courses;
  }

  const courses = (await prisma.course.findMany()) as course[];

  return courses;
};
