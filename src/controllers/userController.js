// src/controllers/userController.js
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import UserService from "../services/user.services.js";

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // GET /users
  list = async (req, res) => {
    try {
      const { page, limit, search, role, isActive } = req.query;

      const result = await this.userService.list({
        page,
        limit,
        search,
        role,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
      });

      return ApiResponse.success(res, result, "Data user berhasil diambil");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /users/:id
  detail = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getById(id);
      return ApiResponse.success(res, user, "Detail user berhasil diambil");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 404
      );
    }
  };

  // PUT /users/:id
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nama_lengkap,
        email,
        username,
        role,
        kodeBagian,
        jabatan,
        phone,
        isActive,
      } = req.body;

      // Validasi minimal satu field diisi
      const hasAnyField =
        nama_lengkap !== undefined ||
        email !== undefined ||
        username !== undefined ||
        role !== undefined ||
        kodeBagian !== undefined ||
        jabatan !== undefined ||
        phone !== undefined ||
        isActive !== undefined;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          "Minimal satu field harus diisi untuk update user",
          400
        );
      }

      const updated = await this.userService.updateUser(id, {
        nama_lengkap,
        email,
        username,
        role,
        kodeBagian,
        jabatan,
        phone,
        isActive,
      });

      return ApiResponse.success(res, updated, "User berhasil diupdate");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // PUT /users/:id/status
  updateStatus = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ["isActive"],
        allowed: ["isActive"],
      });

      const { id } = req.params;
      const { isActive } = req.body;

      const updated = await this.userService.updateStatus(id, isActive);
      return ApiResponse.success(res, updated, "Status user berhasil diupdate");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // DELETE /users/:id
  delete = async (req, res) => {
    try {
      const { id } = req.params;

      // Validasi jangan bisa delete user sendiri
      if (req.user.id === id) {
        return ApiResponse.error(
          res,
          "Anda tidak dapat menghapus akun Anda sendiri",
          400
        );
      }

      await this.userService.deleteUser(id);
      return ApiResponse.success(res, null, "User berhasil dihapus");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // GET /users/by-role/:role
  getByRole = async (req, res) => {
    try {
      const { role } = req.params;
      const { page, limit } = req.query;

      const result = await this.userService.getByRole(role, { page, limit });
      return ApiResponse.success(
        res,
        result,
        `User dengan role ${role} berhasil diambil`
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /users/by-bagian/:kodeBagian
  getByBagian = async (req, res) => {
    try {
      const { kodeBagian } = req.params;
      const { page, limit } = req.query;

      const result = await this.userService.getByBagian(kodeBagian, {
        page,
        limit,
      });
      return ApiResponse.success(
        res,
        result,
        `User dengan bagian ${kodeBagian} berhasil diambil`
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };
}
