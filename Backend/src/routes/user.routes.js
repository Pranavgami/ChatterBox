import userController from "../controllers/user.controller.js";
import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", userController.signIn);
router.post("/login", userController.login);
// router.get("/", protectedRoute, userController.getUserProfile);
router.put("/update-profile", protectedRoute, userController.updateProfile);
router.get("/check-auth", protectedRoute, userController.checkAuth);

export default router;
