import express from "express";
import { AuthController } from "../controllers/authController.js";
import { AuthMiddleware } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();
const authController = new AuthController();

// ========== PUBLIC ROUTES ==========
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

// ========== PROTECTED ROUTES ==========
// Semua routes di bawah ini memerlukan authentication
router.use(AuthMiddleware.authenticate);

router.get("/me", authController.getCurrentUser);
router.post("/logout", authController.logout);
router.put("/change-password", authController.changePassword);
router.put("/profile", authController.updateProfile);

export default router;
