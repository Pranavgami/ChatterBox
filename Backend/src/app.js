import express from "express";
import { createServer } from "http";
import { connectDB } from "./lib/db.js";
import env from "./utils.js/env.js";
import apiRoutes from "./routes/index.js";
import { Server } from "socket.io";
import cors from "cors";
import { errorHandler } from "./errors/ErrorHandler.js";
import { logger } from "./lib/logger.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected", userId);
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("online-users", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
    io.emit("online-users", Object.keys(userSocketMap));
  });
});

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
