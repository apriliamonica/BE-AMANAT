import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { LampiranController } from "../controllers/lampiranController.js";
import { uploadMultiple } from "../config/cloudinary.js";

const router = express.Router();
const controller = new LampiranController();

// Semua route lampiran memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

// GET lampiran
router.get("/surat-masuk/:suratMasukId", controller.getBySuratMasuk);
router.get("/surat-keluar/:suratKeluarId", controller.getBySuratKeluar);
router.get("/:id", controller.detail);

// POST lampiran
router.post(
  "/surat-masuk/:suratMasukId",
  uploadMultiple.single("file"),
  controller.uploadSuratMasuk
);
router.post(
  "/surat-keluar/:suratKeluarId",
  uploadMultiple.single("file"),
  controller.uploadSuratKeluar
);

// PUT lampiran
router.put("/:id", controller.update);

// DELETE lampiran
router.delete("/:id", controller.delete);

export default router;
