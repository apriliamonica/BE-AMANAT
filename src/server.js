// src/services/auth.service.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-env";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

class AuthService {
  /**
   * Register User Baru
   * @param {Object} userData - Data user yang akan didaftarkan
   * @param {string} userData.name - Nama lengkap
   * @param {string} userData.email - Email
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @param {string} userData.role - Role (ADMIN, KETUA_PENGURUS, dll)
   * @param {string} userData.jabatan - Jabatan
   * @param {string} userData.kodeBagian - Kode bagian (optional, untuk Kepala Bagian)
   * @returns {Promise<Object>} Data user yang terdaftar (tanpa password)
   */
  async register(userData) {
    try {
      const {
        name,
        email,
        username,
        password,
        role,
        jabatan,
        kodeBagian,
        phone,
      } = userData;

      // 1. Validasi input
      if (!name || !email || !username || !password || !role || !jabatan) {
        throw new Error(
          "Field wajib: name, email, username, password, role, jabatan"
        );
      }

      // 2. Cek email sudah ada
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new Error("Email sudah terdaftar");
      }

      // 3. Cek username sudah ada
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new Error("Username sudah terdaftar");
      }

      // 4. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5. Validasi role
      const validRoles = [
        "ADMIN",
        "KETUA_PENGURUS",
        "SEKRETARIS_PENGURUS",
        "BENDAHARA_PENGURUS",
        "KEPALA_BAGIAN_PSDM",
        "KEPALA_BAGIAN_KEUANGAN",
        "KEPALA_BAGIAN_UMUM",
      ];

      if (!validRoles.includes(role)) {
        throw new Error(
          `Role tidak valid. Pilih dari: ${validRoles.join(", ")}`
        );
      }

      // 6. Jika role KEPALA_BAGIAN, kodeBagian wajib
      if (role.startsWith("KEPALA_BAGIAN") && !kodeBagian) {
        throw new Error("kodeBagian wajib untuk Kepala Bagian");
      }

      // 7. Create user
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
          role,
          jabatan,
          kodeBagian: kodeBagian || null,
          phone: phone || null,
          isActive: true,
        },
      });

      // 8. Return user tanpa password
      return this._formatUserResponse(newUser);
    } catch (error) {
      throw new Error(`Register gagal: ${error.message}`);
    }
  }

  /**
   * Login User
   * @param {string} email - Email atau username
   * @param {string} password - Password
   * @returns {Promise<Object>} User data + JWT token
   */
  async login(email, password) {
    try {
      // 1. Validasi input
      if (!email || !password) {
        throw new Error("Email/Username dan password wajib diisi");
      }

      // 2. Cari user berdasarkan email atau username
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username: email }],
        },
      });

      if (!user) {
        throw new Error("Email/Username atau password salah");
      }

      // 3. Cek user active
      if (!user.isActive) {
        throw new Error("Akun Anda sudah dinonaktifkan. Hubungi admin");
      }

      // 4. Validasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Email/Username atau password salah");
      }

      // 5. Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          name: user.name,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // 6. Return user + token
      return {
        user: this._formatUserResponse(user),
        token,
        expiresIn: JWT_EXPIRE,
      };
    } catch (error) {
      throw new Error(`Login gagal: ${error.message}`);
    }
  }

  /**
   * Verify JWT Token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token data
   */
  async verifyToken(token) {
    try {
      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      // Hapus prefix "Bearer " jika ada
      const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

      const decoded = jwt.verify(cleanToken, JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token sudah expired");
      }
      throw new Error(`Token tidak valid: ${error.message}`);
    }
  }

  /**
   * Refresh Token
   * @param {string} token - Old token
   * @returns {Promise<Object>} New token
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);

      // Generate token baru
      const newToken = jwt.sign(
        {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role,
          name: decoded.name,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      return {
        token: newToken,
        expiresIn: JWT_EXPIRE,
      };
    } catch (error) {
      throw new Error(`Refresh token gagal: ${error.message}`);
    }
  }

  /**
   * Get User By ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      return this._formatUserResponse(user);
    } catch (error) {
      throw new Error(`Get user gagal: ${error.message}`);
    }
  }

  /**
   * Update User Profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data yang akan diupdate
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(userId, updateData) {
    try {
      const { name, phone, jabatan } = updateData;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          phone: phone || undefined,
          jabatan: jabatan || undefined,
        },
      });

      return this._formatUserResponse(updatedUser);
    } catch (error) {
      throw new Error(`Update profile gagal: ${error.message}`);
    }
  }

  /**
   * Change Password
   * @param {string} userId - User ID
   * @param {string} oldPassword - Password lama
   * @param {string} newPassword - Password baru
   * @returns {Promise<Object>} Success message
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // 1. Cari user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User tidak ditemukan");
      }

      // 2. Validasi password lama
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Password lama tidak sesuai");
      }

      // 3. Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 4. Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { message: "Password berhasil diubah" };
    } catch (error) {
      throw new Error(`Change password gagal: ${error.message}`);
    }
  }

  /**
   * Get All Users (Admin only)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers(options = {}) {
    try {
      const { role, search, limit = 10, offset = 0 } = options;

      const where = {};

      // Filter by role
      if (role) {
        where.role = role;
      }

      // Search by name, email, username
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          jabatan: true,
          kodeBagian: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      });

      const total = await prisma.user.count({ where });

      return {
        data: users,
        total,
        limit,
        offset,
      };
    } catch (error) {
      throw new Error(`Get all users gagal: ${error.message}`);
    }
  }

  /**
   * Deactivate/Activate User (Admin only)
   * @param {string} userId - User ID
   * @param {boolean} isActive - Status aktif/tidak
   * @returns {Promise<Object>} Updated user
   */
  async toggleUserStatus(userId, isActive) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
      });

      return this._formatUserResponse(updatedUser);
    } catch (error) {
      throw new Error(`Toggle user status gagal: ${error.message}`);
    }
  }

  /**
   * Format user response (tanpa password)
   * @private
   */
  _formatUserResponse(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();
