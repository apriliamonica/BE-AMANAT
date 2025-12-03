import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { DisposisiController } from "../controllers/disposisiController.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
const controller = new DisposisiController();

// Semua route disposisi memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

router.get("/", controller.list);
router.get("/user/:userId", controller.getByUser);
router.get("/:id", controller.detail);
router.post(
  "/",
  authorize(["ADMIN", "KETUA_PENGURUS", "SEKRETARIS_PENGURUS"]),
  controller.create
);
router.put(
  "/:id",
  authorize(["ADMIN", "KETUA_PENGURUS", "SEKRETARIS_PENGURUS"]),
  controller.update
);
router.put("/:id/status", controller.updateStatus);
router.delete(
  "/:id",
  authorize(["ADMIN", "KETUA_PENGURUS", "SEKRETARIS_PENGURUS"]),
  controller.delete
);

export default router;
