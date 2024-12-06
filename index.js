import dotenv from "dotenv";
import connectToDatabase from "./database/connection.js";
import { config } from "./config/index.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cluster from "cluster";
import os from "os";
import bodyParser from "body-parser";

import { Chapter, Users } from "./routes/AdminRoutes/index.js";

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  connectToDatabase();

  const app = express();
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

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
  app.use("/user", Users);

  app.use("/uploads", express.static("uploads"));
  app.use("/Assets", express.static("Assets"));

  app.use("*", (req, res) => {
    res.status(404).render("404");
  });

  const port = config.backendPort || 3000;
  app.listen(port, () => {
    console.log(`Worker ${process.pid} is listening on port ${port}`);
  });
}
