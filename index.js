import dotenv from "dotenv";
import connectToDatabase from "./database/connection.js";
import { config } from "./config/index.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import cluster from "cluster";
import os from "os";
import bodyParser from "body-parser";

// Import routes
import Chapter from "./routes/ChapterRoute.js";

// Load environment variables
dotenv.config();

// Number of CPU cores
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker on exit
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection. In this case, it's an Express app.

  // Connect to the database
  connectToDatabase();

  // Initialize Express app
  const app = express();
  // app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Enable CORS
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
    })
  );

  // Set view engine and static files
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.use("/chapter", Chapter);

  app.use("/uploads", express.static("uploads"));
  app.use("/Assets", express.static("Assets"));


  // 404 page
  app.use("*", (req, res) => {
    res.status(404).render("404");
  });

  // Start the server on the worker process
  const port = config.backendPort || 3000;
  app.listen(port, () => {
    console.log(`Worker ${process.pid} is listening on port ${port}`);
  });

}
