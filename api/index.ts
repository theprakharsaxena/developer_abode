import dotenv from "dotenv";
import app from "./app";

dotenv.config();
const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ message: "Development: Server is running" });
});

// Start the server for local development
const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
