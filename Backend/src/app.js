import express from "express";
import { createServer } from "http";
import { connectDB } from "./lib/db.js";
import env from "./utils.js/env.js";
import apiRoutes from "./routes/index.js";
import cors from "cors";
import { errorHandler } from "./errors/ErrorHandler.js";
import { logger } from "./lib/logger.js";
import { initializeSocket } from "./lib/socket.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());

const io = initializeSocket(httpServer);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(logger);
app.get("/health", (req, res) => {
  res.send("Server is healthy");
});
app.use("/api", apiRoutes);

// Connect to MongoDB
connectDB();

app.use(errorHandler);
const PORT = env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
