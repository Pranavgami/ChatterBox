import express from "express";
import cors from "cors";
import { createServer } from "http";
import "dotenv/config";
import { connectDB } from "./lib/db.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json({ limit: "4mb" }));

app.get("/health", (req, res) => {
  res.send("Server is healthy");
});

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
