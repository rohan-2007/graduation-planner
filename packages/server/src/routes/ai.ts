// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";
// import express, { Request, Response } from "express";
// import { langfuse } from "./langfuse";

// dotenv.config();

// console.log("AI ROUTER LOADED");

// const router = express.Router();

// interface ChatbotMessageBody {
//   message: string;
// }

// const genAI = new GoogleGenerativeAI(
//   process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY : "",
// );

// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// /** * Helper function to safely extract Gemini token usage */
// function getUsage(response: any) {
//   const usage = response?.usageMetadata;
//   return {
//     promptTokens: usage?.promptTokenCount || 0,
//     completionTokens: usage?.candidatesTokenCount || 0,
//     totalTokens: usage?.totalTokenCount || 0,
//   };
// }

// router.post(
//   "/send",
//   async (req: Request<unknown, unknown, ChatbotMessageBody>, res: Response) => {
//     const startTime = Date.now();

//     const { message } = req.body;

//     if (!message) {
//       res.status(400).json({ error: "Message is required" });
//       return;
//     }

//     console.log("Before User ID: " + req.session.userId);
//     console.log("Before User name: " + req.session.userName);
//     const trace = langfuse.trace({
//       name: "chat-request",
//       input: message,
//     });
//     console.log("After User ID: " + req.session.userId);
//     console.log("After User name: " + req.session.userName);
//     console.log("SESSION:", req.session);

//     try {
//       const span = trace.span({
//         name: "gemini-chat",
//         input: message,
//       });

//       const chat = model.startChat({
//         history: [],
//       });

//       const result = await chat.sendMessage(message);

//       const response = await result.response;

//       const text = response.text();
//       const usage = getUsage(response);

//       const latencyMs = Date.now() - startTime;

//       span.end({
//         output: text,
//       });

//       trace.update({
//         output: text,
//         metadata: {
//           durationMs: Date.now() - startTime,
//         },
//       });

//       await langfuse.flush();

//       res.status(200).json({
//         message: "response fetched successfully",
//         response: text,
//       });
//     } catch (error) {
//       console.error("CHAT ERROR:", error);

//       trace.update({
//         tags: ["error"],
//         metadata: {
//           error: error instanceof Error ? error.message : String(error),
//         },
//       });

//       await langfuse.flush();

//       res.status(500).json({
//         error: error instanceof Error ? error : "Unknown error",
//       });
//     }
//   },
// );

// router.get("/test", (_req, res) => {
//   res.send("chat router works");
// });

// export default router;

import dotenv from "dotenv";
import express, { Response } from "express";
import { createGradAssistantAgent } from "../ai/agent";
import { AuthRequest } from "../types/authRequest";
import { authenticate } from "./auth";
import { langfuse } from "./langfuse";

dotenv.config();

const router = express.Router();

// interface ChatbotMessageBody {
//   message: string;
// }

/**
 * Extract token usage from Gemini response
 */
// function extractUsage(response: any) {
//   const usage = response?.usageMetadata;

//   return {
//     inputTokens: usage?.promptTokenCount || 0,
//     outputTokens: usage?.candidatesTokenCount || 0,
//     totalTokens: usage?.totalTokenCount || 0,
//   };
// }

router.get("/lf-test", async (_req, res) => {
  const trace = langfuse.trace({
    name: "test_trace",
  });

  trace.update({
    output: "hello world",
  });

  await langfuse.flush();

  res.json({ trace_id: trace.id });
});

router.post("/send", authenticate, async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const { message, conversationId } = req.body;
  const studentId = Number(req.user!.userId);

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const agent = createGradAssistantAgent(studentId);

  /**
   * ==========
   * ROOT TRACE
   * ==========
   */
  const trace = langfuse.trace({
    name: "chat_completion",
    input: message,
    metadata: {
      application_version_id: "a84b83ea-069d-4e00-9b93-fc706ba12ba4",
    },
  });

  /**
   * ===========
   * OBSERVATION
   * ===========
   */
  const generation = trace.generation({
    name: req.body.message ? "chat-generation" : "empty",
    // traceId: trace.id, // equivalent to trace_context.trace_id
    input: message,
    model: "gemini-2.5-flash",
  });

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    // const chat = model.startChat({ history: [] });

    // const result = await chat.sendMessage(message);

    let response = "";

    const stream = await agent.stream(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        configurable: {
          thread_id: conversationId,
        },
        streamMode: "messages",
      },
    );

    for await (const chunk of stream) {
      response = response + chunk[0].content;
      const chunk_content = chunk[0].content;
      // if (chunk_content.at(-1) != " ") {
      //   res.write(chunk[0].content + " ");
      // } else {
      //   res.write(chunk[0].content);
      // }
      res.write(chunk_content);
      // console.log("chunk: ", chunk[0].content);
    }

    // res.write("data: [END]\n\n");
    res.end();

    // for await (const chunk of stream) {
    //   if (
    //     "messages" in
    //     (chunk["params"]["data"] as Record<
    //       string,
    //       string | number | Record<string, string>
    //     >)
    //   ) {
    //     const chunk_data = chunk["params"]["data"] as Record<
    //       string,
    //       string | number | Record<string, string>
    //     >;
    //     console.log("chunk: ", chunk_data["messages"]["content"] as string);
    //   }
    //   response = response + chunk;
    // }

    // const text =
    //   typeof response?.content === "string"
    //     ? response.content
    //     : JSON.stringify(response?.content);

    // const usage = extractUsage(response);

    const latencyMs = Date.now() - startTime;

    /**
     * =========================
     * observation.update(...)
     * =========================
     */
    generation.update({
      input: message,
      // output: text,
      model: "gemini-2.5-flash",

      metadata: {
        latency_ms: latencyMs,
        project_id: "support-agent",
        status: "success",
        error_message: null,
      },

      // usageDetails: {
      //   input: usage.inputTokens,
      //   output: usage.outputTokens,
      // },
    });

    /**
     * Optional trace enrichment
     */
    trace.update({
      // output: text,
      metadata: {
        latency_ms: latencyMs,
        status: "success",
        project_id: "support-agent",
        // usage: {
        //   input: usage.inputTokens,
        //   output: usage.outputTokens,
        // },
      },
    });

    await langfuse.flush();

    // res.status(200).json({
    //   // response: text,
    //   trace_id: trace.id,
    // });
    return;
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    const errMsg = error instanceof Error ? error.message : String(error);

    /**
     * =========================
     * ERROR observation update
     * =========================
     */
    generation.update({
      input: message,
      output: null,
      model: "gemini-2.5-flash",

      metadata: {
        latency_ms: latencyMs,
        project_id: "support-agent",
        status: "error",
        error_message: errMsg,
      },

      usageDetails: {
        input_tokens: 0,
        output_tokens: 0,
      },
    });

    trace.update({
      metadata: {
        status: "error",
        error_message: errMsg,
        latency_ms: latencyMs,
      },
    });

    await langfuse.flush();

    // return res.status(500).json({
    //   error: errMsg,
    //   trace_id: trace.id,
    // });
    return;
  }
});

export default router;
