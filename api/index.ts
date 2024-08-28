import dotenv from "dotenv";
import { config } from "./config";
import app from "./app";
import { connectDB } from "./utils";

dotenv.config();
const PORT = config.port || 8080;

app.get("/", (req, res) => {
  res.json({ message: `${config.environment}: Server is running` });
});

// Start the server for local development
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
