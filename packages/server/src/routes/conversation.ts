import { AuthRequest } from "@/types/authRequest";
import express from "express";
import {
  createNewConversation,
  getAllConversations,
} from "../services/conversationService";
import { authenticate } from "./auth";

const conversationRouter = express.Router();

conversationRouter.post(
  "/new_conversation",
  authenticate,
  async (req: AuthRequest, res) => {
    const studentId = Number(req.user?.userId);

    const { title } = req.body;

    try {
      const newConversation = await createNewConversation(studentId, title);

      if (newConversation.error) {
        res.status(404).json(newConversation);
        return;
      }

      res.status(200).json(newConversation);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        error: String(error),
      });
      return;
    }
  },
);

conversationRouter.get("/conversations", authenticate, async (_req, res) => {
  try {
    const conversations = await getAllConversations();

    res.status(200).json(conversations);
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      error: String(error),
    });
  }
});

export default conversationRouter;
