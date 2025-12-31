import { Router } from "express";
import conversasionRoutes from "./conversasions.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", userRoutes);
router.use("/conversations", conversasionRoutes);

export default router;
