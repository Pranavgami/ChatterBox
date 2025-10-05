import { Router } from "express";
import cloudinary from "../lib/cloudinary.js";
import messageController from "../controllers/message.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { catchAsyncHandler } from "../errors/catchAsyncHandler.js";

const router = Router();

router.get(
  "/users",
  protectedRoute,
  catchAsyncHandler(messageController.getUserById)
);

router.get(
  "/messages/:id",
  protectedRoute,
  catchAsyncHandler(messageController.getMessages)
);

router.put(
  "/marks/:id",
  protectedRoute,
  catchAsyncHandler(messageController.marksAsSeen)
);

router.post(
  "/send",
  protectedRoute,
  catchAsyncHandler(messageController.sendMessage)
);

export default router;
