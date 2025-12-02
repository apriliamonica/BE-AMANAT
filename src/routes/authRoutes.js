import express from "express";
import { AuthController } from "../controllers/authController.js";
import { AuthMiddleware } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();
const authController = new AuthController();

// ========== PUBLIC ROUTES ==========
router.post("/login", authLimiter, authController.login);

// ========== PROTECTED ROUTES ==========
// Semua routes di bawah ini memerlukan authentication
router.use(AuthMiddleware.authenticate);

router.get("/me", authController.getCurrentUser);
router.post("/logout", authController.logout);
router.put("/change-password", authController.changePassword);
router.put("/update-profile", authController.updateProfile);


router.use(AuthMiddleware.authorize('ADMIN'));
router.post("/register", authLimiter, authController.register);

export default router;
