import dotenv from "dotenv";
import { config } from "./config";
import app from "./app";
import mongoose from "mongoose";

dotenv.config();
const PORT = config.port || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Development: Server is running" });
});

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Start the server for local development
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
