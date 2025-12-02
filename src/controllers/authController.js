import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../schemas/authSchema.js";

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      await validateRequest(req, {
        required: [],
        allowed: ["nama_lengkap", "email", "username", "password", "role", "kodeBagian", "jabatan", "phone", "isActive"],
        schema: registerSchema,
      });
      // Extract validated data (sudah divalidasi dan di-sanitize oleh Zod)
      // Panggil service
      const { nama_lengkap, email, username, password, role, kodeBagian, jabatan, phone, isActive } = req.body;

      // Panggil service untuk register user
      const result = await this.authService.register({
        nama_lengkap,
        email,
        username,
        password,
        role,
        kodeBagian,
        jabatan,
        phone,
        isActive: isActive ?? true,
      });

      // Return success response
      return ApiResponse.success(res, result, "Registrasi berhasil.", 201);
    } catch (error) {
      // Tampilkan detail errors jika ada (dari Zod validation)
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  login = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      await validateRequest(req, {
        required: ["username", "password"],
        allowed: ["username", "password"],
        schema: loginSchema,
      });

      // Extract validated data (sudah divalidasi dan di-sanitize oleh Zod)
      const { username, password } = req.body;

      // Panggil service
      const result = await this.authService.login({
        username,
        password,
      });

      // Return success response
      return ApiResponse.success(
        res,
        result,
        "Login berhasil. Selamat datang!",
        200
      );
    } catch (error) {
      // Tampilkan detail errors jika ada (dari Zod validation)
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  getCurrentUser = async (req, res) => {
    try {
      // User sudah di-set di auth middleware
      const userId = req.user.id;

      // Panggil service
      const user = await this.authService.getCurrentUser(userId);

      // Return success response
      return ApiResponse.success(res, { user }, "Data user berhasil diambil");
    } catch (error) {
      // Tampilkan detail errors jika ada
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  logout = async (req, res) => {
    try {
      // Logout hanya menghapus token di client side
      // Jika ingin implementasi token blacklist, bisa ditambahkan di sini
      return ApiResponse.success(res, null, "Logout berhasil. Terima kasih!");
    } catch (error) {
      // Tampilkan detail errors jika ada
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  changePassword = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      await validateRequest(req, {
        required: ["oldPassword", "newPassword"],
        allowed: ["oldPassword", "newPassword"],
        schema: changePasswordSchema,
      });

      // User sudah di-set di auth middleware
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      // Panggil service
      const result = await this.authService.changePassword(userId, {
        oldPassword,
        newPassword,
      });

      // Return success response
      return ApiResponse.success(res, result, "Password berhasil diubah");
    } catch (error) {
      // Tampilkan detail errors jika ada (dari Zod validation)
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500,
        error.errors || null
      );
    }
  };

  updateProfile = async (req, res) => {
    try {
      // Validasi dengan Zod schema + Controller validation
      // Untuk update profile, semua field optional, tapi harus ada minimal 1 field
      await validateRequest(req, {
        required: [],
        allowed: ["id", "nama_lengkap", "email", "username", "password", "role", "kodeBagian", "jabatan", "phone", "isActive"],
        schema: updateProfileSchema,
      });

      // Validasi business rule: Minimal 1 field harus diisi untuk update
      const { id, email, username, password, role, nama_lengkap, kodeBagian, jabatan, phone, isActive } = req.body;
      const hasId = id !== undefined;


      if (!hasId) {
        return ApiResponse.error(
          res,
          "ID user harus diisi",
          400,
          [
            {
              field: "body",
              message: "ID user harus diisi",
            },
          ]
        );
      }

      const hasAnyField =
         email !== undefined || username !== undefined || password !== undefined || role !== undefined || nama_lengkap !== undefined || kodeBagian !== undefined || jabatan !== undefined || phone !== undefined || isActive !== undefined;

      if (!hasAnyField) {
        return ApiResponse.error(
          res,
          "Minimal satu field harus diisi untuk update profile",
          400,
          [
            {
              field: "body",
              message:
                "Minimal satu field (nama_lengkap, kodeBagian, jabatan, phone, atau isActive) harus diisi",
            },
          ]
        );
      }

      // User sudah di-set di auth middleware
      const userId = req.user.id;

      // Panggil service
      const user = await this.authService.updateProfile(userId, {
        id,
        nama_lengkap,
        email,
        username,
        password,
        role,
        kodeBagian,
        jabatan,
        phone,
        isActive: isActive ?? true,
      });

      // Return success response
      return ApiResponse.success(res, { user }, "Profil berhasil diupdate");
    } catch (error) {
      // Tampilkan detail errors jika ada (dari Zod validation)
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500,
        error.errors || null
      );
    }
  };
}
