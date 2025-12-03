// src/routes/suratMasukRoutes.js (IMPROVED)
import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { SuratMasukController } from "../controllers/suratMasukController.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
const controller = new SuratMasukController();

// Semua route surat masuk memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

// Public routes (semua user bisa akses)
router.get("/", controller.list);
router.get("/stats", controller.getStats);
router.get("/pending", controller.getPending);
router.get("/by-status/:status", controller.getByStatus);
router.get("/:id", controller.detail);

// Admin & Sekretaris Kantor only
router.post(
  "/",
  authorize(["ADMIN", "SEKRETARIS_PENGURUS"]),
  controller.create
);
router.put(
  "/:id",
  authorize(["ADMIN", "SEKRETARIS_PENGURUS"]),
  controller.update
);
router.put(
  "/:id/status",
  authorize(["ADMIN", "SEKRETARIS_PENGURUS"]),
  controller.updateStatus
);
router.delete(
  "/:id",
  authorize(["ADMIN", "SEKRETARIS_PENGURUS"]),
  controller.delete
);

export default router;
