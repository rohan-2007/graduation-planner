import { createAgent } from "langchain";
import { checkpointer } from "./checkpointer";
import { model } from "./model";
import { createDegreeAuditTool } from "./tools/degreeAuditTool";
import { createGeneratePlanTool } from "./tools/generatePlanTool";
import { createSimulateFailureTool } from "./tools/simulateFailureTool";

export function createGradAssistantAgent(studentId: number) {
  const agent = createAgent({
    model,
    tools: [
      createGeneratePlanTool(studentId),
      createDegreeAuditTool(studentId),
      createSimulateFailureTool(studentId),
    ],
    checkpointer,
  });

  return agent;
}
