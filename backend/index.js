import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db/db.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js";

import authRoute from "./route/authRoute.js";
import recordsRoute from "./route/recordsRoute.js";
import roleRoute from "./route/roleRoute.js";
import analyzeRoute from "./route/analyzeRoute.js"; 

import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use("/zorvyn", apiLimiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Server started");
});

app.get("/dbHealth", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "DB is healthy" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/zorvyn", authRoute);
app.use("/zorvyn", analyzeRoute);
app.use("/zorvyn", recordsRoute);
app.use("/zorvyn", roleRoute);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      code: "NOT_FOUND",
    },
  });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
