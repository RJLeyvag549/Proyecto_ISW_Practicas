"use strict";
import { Router } from "express";
import {
    getOrCreateConversation,
    getAllConversations,
    getMessages,
    markMessagesAsRead,
} from "../controllers/message.controller.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdminOrCoordinator } from "../middlewares/authorization.middleware.js";

const router = Router();

router.use(authenticateJwt);
router.get("/conversation/:studentId", getOrCreateConversation);
router.get("/conversations", isAdminOrCoordinator, getAllConversations);
router.get("/conversation/:conversationId/messages", getMessages);
router.put("/conversation/:conversationId/read", markMessagesAsRead);

export default router;
