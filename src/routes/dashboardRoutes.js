// src/routes/dashboardRoutes.js
import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { DashboardController } from "../controllers/dashboardController.js";

const router = express.Router();
const controller = new DashboardController();

// Semua route dashboard memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

// GET /dashboard/stats - Dashboard statistics
router.get("/stats", controller.getStats);

// GET /dashboard/surat-masuk - Recent surat masuk untuk tracking
router.get("/surat-masuk", controller.getRecentSuratMasuk);

// GET /dashboard/surat-keluar - Recent surat keluar untuk tracking
router.get("/surat-keluar", controller.getRecentSuratKeluar);

// GET /dashboard/disposisi - Disposisi untuk user saat ini
router.get("/disposisi", controller.getMyDisposisi);

export default router;
