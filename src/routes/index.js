// src/routes/index.js (UPDATED)
import express from "express";
import authRoutes from "./authRoutes.js";
import suratMasukRoutes from "./suratMasukRoutes.js";
import suratKeluarRoutes from "./suratKeluarRoutes.js";
import disposisiRoutes from "./disposisiRoutes.js";
import lampiranRoutes from "./lampiranRoutes.js";
import trackingRoutes from "./trackingRoutes.js";
import userRoutes from "./userRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import { prisma } from "../config/index.js";

const router = express.Router();

// Health check
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      status: "healthy",
      message: "API is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unhealthy",
      message: "API is running but database is disconnected",
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

// Routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/surat-masuk", suratMasukRoutes);
router.use("/surat-keluar", suratKeluarRoutes);
router.use("/disposisi", disposisiRoutes);
router.use("/lampiran", lampiranRoutes);
router.use("/tracking", trackingRoutes);

export default router;
