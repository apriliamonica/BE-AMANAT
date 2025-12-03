import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { SuratKeluarController } from "../controllers/suratKeluarController.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
const controller = new SuratKeluarController();

// Semua route surat keluar memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

router.get("/", controller.list);
router.get("/:id", controller.detail);
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
  authorize(["ADMIN", "SEKRETARIS_PENGURUS", "KETUA_PENGURUS"]),
  controller.updateStatus
);
router.delete(
  "/:id",
  authorize(["ADMIN", "SEKRETARIS_PENGURUS"]),
  controller.delete
);

export default router;
