import { getAvailableCourses, type course, type Graph } from "./graph";

export type semesterPlan = {
  semester: number;
  courses: course[];
};

export const generatePlan = (
  graph: Graph,
  completedCourses: string[],
  allCourses: course[],
  maxCreditsPerSemester: number,
  // numberOfSemestersLeft: number,
) => {
  const plan: semesterPlan[] = [];

  var availableCourseIndex = 0;
  var availableCourses = getAvailableCourses(graph, completedCourses);
  var i = 1;
  while (availableCourses.length > 0) {
    availableCourseIndex = 0;
    console.log("inside for");
    const semesterCourses: course[] = [];
    var semesterCredits = 0;

    while (
      semesterCredits < maxCreditsPerSemester &&
      availableCourseIndex < availableCourses.length
    ) {
      console.log("inside while");
      const currentCourse = allCourses.find(
        (course) => course.code == availableCourses[availableCourseIndex],
      );

      if (!currentCourse) continue;

      if (semesterCredits + currentCourse.credits <= maxCreditsPerSemester) {
        semesterCourses.push(currentCourse);
        semesterCredits += currentCourse.credits;
        completedCourses.push(currentCourse.code);
      }
      availableCourseIndex++;
    }

    plan.push({
      semester: i,
      courses: semesterCourses,
    });

    availableCourses = getAvailableCourses(graph, completedCourses);
    i++;
  }

  return plan;
};
