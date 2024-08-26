import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/database";
import { config } from "./config/config";

dotenv.config();

const PORT = config.port || 3000;

// Define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Development: Server is running" });
});

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
