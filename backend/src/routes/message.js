import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  getChatList,
  markMessagesAsRead
} from "../controllers/messageController.js";

const router = express.Router();

// All message routes require authentication
router.use(authMiddleware);

// Send a message
router.post("/", sendMessage);

// Get messages between current user and another user
router.get("/:recipientId", getMessages);

// Get list of chat partners for current user
router.get("/", getChatList);

// Mark messages as read from a specific sender
router.put("/read/:senderId", markMessagesAsRead);

export default router;
