// src/routes/authRoutes.js
import express from "express";
import { body } from "express-validator";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

/**
 * ==================== PUBLIC ROUTES ====================
 */

/**
 * POST /api/auth/register
 * Register user baru
 * Body: { name, email, username, password, role, jabatan, kodeBagian?, phone? }
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Nama wajib diisi"),
    body("email").isEmail().withMessage("Email tidak valid"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username minimal 3 karakter"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
    body("role").notEmpty().withMessage("Role wajib diisi"),
    body("jabatan").notEmpty().withMessage("Jabatan wajib diisi"),
  ],
  authController.register
);

/**
 * POST /api/auth/login
 * Login user
 * Body: { email (or username), password }
 */
router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Email/Username wajib diisi"),
    body("password").notEmpty().withMessage("Password wajib diisi"),
  ],
  authController.login
);

/**
 * POST /api/auth/refresh-token
 * Refresh JWT token
 * Body: { token } atau Header: { Authorization: Bearer <token> }
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post("/logout", authController.logout);

/**
 * ==================== PROTECTED ROUTES ====================
 * Requires: Authorization header dengan valid JWT token
 */

/**
 * GET /api/auth/me
 * Get data user yang sedang login
 */
router.get("/me", authMiddleware, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update profile user
 * Body: { name?, phone?, jabatan? }
 */
router.put(
  "/profile",
  authMiddleware,
  [
    body("name").optional().notEmpty().withMessage("Nama tidak boleh kosong"),
    body("phone").optional().notEmpty().withMessage("Phone tidak boleh kosong"),
    body("jabatan")
      .optional()
      .notEmpty()
      .withMessage("Jabatan tidak boleh kosong"),
  ],
  authController.updateProfile
);

/**
 * POST /api/auth/change-password
 * Ubah password user
 * Body: { oldPassword, newPassword }
 */
router.post(
  "/change-password",
  authMiddleware,
  [
    body("oldPassword").notEmpty().withMessage("Password lama wajib diisi"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password baru minimal 6 karakter"),
  ],
  authController.changePassword
);

/**
 * ==================== ADMIN ROUTES ====================
 * Requires: Authorization header + ADMIN role
 */

/**
 * GET /api/auth/users
 * Get semua user (dengan filter)
 * Query: { role?, search?, limit?, offset? }
 */
router.get(
  "/users",
  authMiddleware,
  authorize(["ADMIN"]),
  authController.getAllUsers
);

/**
 * PATCH /api/auth/users/:userId/deactivate
 * Nonaktifkan user
 */
router.patch(
  "/users/:userId/deactivate",
  authMiddleware,
  authorize(["ADMIN"]),
  authController.deactivateUser
);

/**
 * PATCH /api/auth/users/:userId/activate
 * Aktifkan user
 */
router.patch(
  "/users/:userId/activate",
  authMiddleware,
  authorize(["ADMIN"]),
  authController.activateUser
);

export default router;
