import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

export const checkpointer = PostgresSaver.fromConnString(
  process.env.DATABASE_URL!,
);

export async function initializeCheckpointer() {
  await checkpointer.setup();
}
