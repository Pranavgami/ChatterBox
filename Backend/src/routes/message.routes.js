import { Router } from "express";
import cloudinary from "../lib/cloudinary.js";
import messageController from "../controllers/message.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/users", protectedRoute, messageController.getUserById);

router.get("/messages/:id", protectedRoute, messageController.getMessages);

router.put("/marks/:id", protectedRoute, messageController.marksAsSeen);

router.post("/send", protectedRoute, messageController.sendMessage);

export default router;
