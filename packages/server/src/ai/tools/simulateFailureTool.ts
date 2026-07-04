import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { simulateFailure } from "../../services/simulationService";

export function createSimulateFailureTool(studentId: number) {
  return tool(
    async (failedCourse: string) => {
      return await simulateFailure(studentId, failedCourse);
    },
    {
      name: "simulate_failure",
      description:
        "Generate a semester-by-semester graduation plan which simulates failing the course with the provided course code and calculate the impact on graduation.",
      schema: z.object({
        failedCourse: z.string(),
      }),
    },
  );
}
