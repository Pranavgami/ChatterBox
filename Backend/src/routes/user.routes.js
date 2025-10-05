import userController from "../controllers/user.controller.js";
import express from "express";
import { catchAsyncHandler } from "../errors/catchAsyncHandler.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", catchAsyncHandler(userController.signIn));
router.post("/login", catchAsyncHandler(userController.login));
// router.get("/", protectedRoute, userController.getUserProfile);
router.put(
  "/update-profile",
  protectedRoute,
  catchAsyncHandler(userController.updateProfile)
);
router.get(
  "/check-auth",
  protectedRoute,
  catchAsyncHandler(userController.checkAuth)
);

export default router;
