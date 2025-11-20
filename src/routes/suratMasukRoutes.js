import { Router } from "express";
import suratController from "../controllers/surat.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, suratController.getAll);
router.post("/", authMiddleware, suratController.create);

export default router;
