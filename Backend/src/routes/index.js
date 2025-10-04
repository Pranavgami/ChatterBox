import { Router } from "express";
import messageRoutes from "./message.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", userRoutes);
router.use("/messages", messageRoutes);

export default router;
