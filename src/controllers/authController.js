// src/controllers/authController.js
import authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { validationResult } from "express-validator";

class AuthController {
  /**
   * Register Controller
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      // 1. Cek validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, "Validasi gagal", errors.array());
      }

      // 2. Extract data
      const {
        name,
        email,
        username,
        password,
        role,
        jabatan,
        kodeBagian,
        phone,
      } = req.body;

      // 3. Call service
      const newUser = await authService.register({
        name,
        email,
        username,
        password,
        role,
        jabatan,
        kodeBagian,
        phone,
      });

      // 4. Return success response
      return successResponse(res, 201, "Registrasi berhasil", newUser);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  /**
   * Login Controller
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      // 1. Cek validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, "Validasi gagal", errors.array());
      }

      // 2. Extract data
      const { email, password } = req.body;

      // 3. Call service
      const result = await authService.login(email, password);

      // 4. Set token di cookie (optional)
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      // 5. Return success response
      return successResponse(res, 200, "Login berhasil", result);
    } catch (error) {
      return errorResponse(res, 401, error.message);
    }
  }

  /**
   * Get Current User Controller
   * GET /api/auth/me
   * Requires: Authorization header
   */
  async getCurrentUser(req, res) {
    try {
      // 1. User sudah di-decode di middleware auth
      const userId = req.user.id;

      // 2. Get user data
      const user = await authService.getUserById(userId);

      // 3. Return success response
      return successResponse(res, 200, "Data user", user);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  /**
   * Refresh Token Controller
   * POST /api/auth/refresh-token
   */
  async refreshToken(req, res) {
    try {
      // 1. Get token dari header atau body
      const token =
        req.headers.authorization?.replace("Bearer ", "") || req.body.token;

      if (!token) {
        return errorResponse(res, 401, "Token tidak ditemukan");
      }

      // 2. Call service
      const result = await authService.refreshToken(token);

      // 3. Return success response
      return successResponse(res, 200, "Token diperbarui", result);
    } catch (error) {
      return errorResponse(res, 401, error.message);
    }
  }

  /**
   * Update Profile Controller
   * PUT /api/auth/profile
   * Requires: Authorization header
   */
  async updateProfile(req, res) {
    try {
      // 1. Cek validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, "Validasi gagal", errors.array());
      }

      // 2. Extract data
      const userId = req.user.id;
      const { name, phone, jabatan } = req.body;

      // 3. Call service
      const updatedUser = await authService.updateProfile(userId, {
        name,
        phone,
        jabatan,
      });

      // 4. Return success response
      return successResponse(
        res,
        200,
        "Profile berhasil diupdate",
        updatedUser
      );
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  /**
   * Change Password Controller
   * POST /api/auth/change-password
   * Requires: Authorization header
   */
  async changePassword(req, res) {
    try {
      // 1. Cek validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 400, "Validasi gagal", errors.array());
      }

      // 2. Extract data
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      // 3. Call service
      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      // 4. Return success response
      return successResponse(res, 200, result.message);
    } catch (error) {
      return errorResponse(res, 400, error.message);
    }
  }

  /**
   * Logout Controller
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // 1. Clear cookie
      res.clearCookie("token");

      // 2. Return success response
      return successResponse(res, 200, "Logout berhasil");
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  /**
   * Get All Users Controller (Admin only)
   * GET /api/auth/users
   * Requires: Authorization header + Admin role
   */
  async getAllUsers(req, res) {
    try {
      // 1. Extract query params
      const { role, search, limit = 10, offset = 0 } = req.query;

      // 2. Call service
      const result = await authService.getAllUsers({
        role,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // 3. Return success response
      return successResponse(res, 200, "Daftar user", result);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  /**
   * Deactivate User Controller (Admin only)
   * PATCH /api/auth/users/:userId/deactivate
   */
  async deactivateUser(req, res) {
    try {
      // 1. Extract userId
      const { userId } = req.params;

      // 2. Call service
      const updatedUser = await authService.toggleUserStatus(userId, false);

      // 3. Return success response
      return successResponse(
        res,
        200,
        "User berhasil dinonaktifkan",
        updatedUser
      );
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }

  /**
   * Activate User Controller (Admin only)
   * PATCH /api/auth/users/:userId/activate
   */
  async activateUser(req, res) {
    try {
      // 1. Extract userId
      const { userId } = req.params;

      // 2. Call service
      const updatedUser = await authService.toggleUserStatus(userId, true);

      // 3. Return success response
      return successResponse(res, 200, "User berhasil diaktifkan", updatedUser);
    } catch (error) {
      return errorResponse(res, 500, error.message);
    }
  }
}

export default new AuthController();
