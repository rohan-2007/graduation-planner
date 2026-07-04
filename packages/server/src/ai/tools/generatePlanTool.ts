import { tool } from "@langchain/core/tools";
import { generateStudentPlan } from "../../services/plannerService";

export function createGeneratePlanTool(studentId: number) {
  return tool(
    async () => {
      return await generateStudentPlan(studentId);
    },
    {
      name: "generate_plan",
      description: "Generate a semester-by-semester graduation plan.",
    },
  );
}
