import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import pool from "./db/db.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swagger.js"


dotenv.config();


const app = express()
const PORT = process.env.PORT || 3005;
app.use(cors())


app.use(express.json())


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get("/", async (req, res) => {
  res.send("Server started");
});


app.get("/dbHealth", async (req, res) => {
    try{
        const result = await pool.query("SELECT NOW() as now")
        res.json({ok:true})
    } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
