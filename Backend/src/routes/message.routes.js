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
  "/:id",
  protectedRoute,
  catchAsyncHandler(messageController.getMessages)
);

router.put(
  "/mark/:id",
  protectedRoute,
  catchAsyncHandler(messageController.marksAsSeen)
);

router.post(
  "/send/:id",
  protectedRoute,
  catchAsyncHandler(messageController.sendMessage)
);

export default router;
