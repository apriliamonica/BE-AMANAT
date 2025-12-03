import express from "express";
import { AuthMiddleware } from "../middlewares/auth.js";
import { UserController } from "../controllers/userController.js";
import { authorize } from "../middlewares/authorize.js";

const router = express.Router();
const controller = new UserController();

// Semua route user memerlukan autentikasi
router.use(AuthMiddleware.authenticate);

router.get("/", authorize(["ADMIN"]), controller.list);
router.get("/by-role/:role", controller.getByRole);
router.get("/by-bagian/:kodeBagian", controller.getByBagian);
router.get("/:id", controller.detail);
router.put("/:id", authorize(["ADMIN"]), controller.update);
router.put("/:id/status", authorize(["ADMIN"]), controller.updateStatus);
router.delete("/:id", authorize(["ADMIN"]), controller.delete);

export default router;
