import { tool } from "@langchain/core/tools";
import { degreeAudit } from "../../services/degreeAuditService";

export function createDegreeAuditTool(studentId: number) {
  return tool(
    async () => {
      return await degreeAudit(studentId);
    },
    {
      name: "degree_audit",
      description: "Generate a degree audit.",
    },
  );
}
