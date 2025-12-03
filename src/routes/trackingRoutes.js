import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { TrackingController } from "../controllers/trackingController.js";

const router = express.Router();
const controller = new TrackingController();

// Semua route tracking memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

router.get("/surat-masuk/:suratMasukId", controller.getBySuratMasuk);
router.get("/surat-keluar/:suratKeluarId", controller.getBySuratKeluar);
router.get("/stats/:tahapProses", controller.getStatsByTahap);
router.get("/:id", controller.detail);
router.post("/", controller.create);

export default router;
