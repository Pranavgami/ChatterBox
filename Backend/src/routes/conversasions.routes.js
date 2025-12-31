import { Router } from "express";
import conversationsController from "../controllers/conversations.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { catchAsyncHandler } from "../errors/catchAsyncHandler.js";

const router = Router();

router.post(
  "/",
  protectedRoute,
  catchAsyncHandler(conversationsController.accessConversation)
);
router.post(
  "/group",
  protectedRoute,
  catchAsyncHandler(conversationsController.createGroupChat)
);
router.get(
  "/",
  protectedRoute,
  catchAsyncHandler(conversationsController.getMyConversations)
);

router.get(
  "/:conversationId/messages",
  protectedRoute,
  catchAsyncHandler(conversationsController.getMessagesByConversation)
);

// Update group icon
router.put(
  "/:conversationId/icon",
  protectedRoute,
  catchAsyncHandler(conversationsController.updateGroupIcon)
);

export default router;
