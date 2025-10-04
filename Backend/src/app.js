import express from "express";
import { createServer } from "http";
import { connectDB } from "./lib/db.js";
import env from "./utils.js/env.js";
import apiRoutes from "./routes/index.js";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("User connected", userId);
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("online-users", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
    io.emit("online-users", Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: "4mb" }));

app.get("/health", (req, res) => {
  res.send("Server is healthy");
});
app.use("/api/v1", apiRoutes);

// Connect to MongoDB
connectDB();

const PORT = env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
