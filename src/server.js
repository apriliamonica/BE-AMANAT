// src/server.js (Gunakan SINTAKS IMPORT)

import express from "express";
// Sesuaikan path import di bawah ini jika file database Anda ada di lokasi lain
import prisma from "./config/database.cjs";
import cors from "cors";

// Import rute Anda (pastikan file rutenya juga ES Modules/gunakan import/export default)
import authRouter from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS in development
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
}

// Mount routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("API BE-AMANAT (ES Module) is running!");
});

// Server listener (ini yang membuat server tetap hidup)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
