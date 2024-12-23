import dotenv from "dotenv";
import connectToDatabase from "./database/connection.js";
import { config } from "./config/index.js";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

import { Chapter, Users } from "./routes/AdminRoutes/index.js";

dotenv.config();

connectToDatabase();

const app = express();

// Middleware
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

// Start the server
const port = config.backendPort || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
