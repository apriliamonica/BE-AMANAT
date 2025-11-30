import { prisma } from "../config/index.js";
import { hashPassword, comparePassword } from "../utils/index.js";
import { generateToken } from "../config/jwt.js";

export class AuthService {
  async register(data) {
    try {
      const { email, password, nama } = data;

      // Validasi: Cek apakah email atau nama sudah terdaftar
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (existingEmail) {
        const error = new Error(
          "Email sudah terdaftar. Silakan gunakan email lain atau login."
        );
        error.statusCode = 409;
        throw error;
      }

      const existingName = await prisma.user.findFirst({
        where: { nama: nama.trim() },
      });

      if (existingName) {
        const error = new Error(
          "Nama sudah terdaftar. Silakan gunakan nama lain atau login."
        );
        error.statusCode = 409;
        throw error;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          nama: nama.trim(),
          role: "USER",
        },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
          fakultas: true,
          prodi: true,
          createdAt: true,
        },
      });

      // Generate token
      const token = generateToken({ userId: user.id });

      return {
        user,
        token,
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 400;
      throw err;
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      // Validasi: Cari user berdasarkan email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        const error = new Error(
          "Email atau password salah. Silakan coba lagi."
        );
        error.statusCode = 401;
        throw error;
      }

      // Validasi: Verifikasi password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        const error = new Error(
          "Email atau password salah. Silakan coba lagi."
        );
        error.statusCode = 401;
        throw error;
      }

      // Generate token
      const token = generateToken({ userId: user.id });

      // Return user tanpa password
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 400;
      throw err;
    }
  }

  async getCurrentUser(userId) {
    try {
      // Validasi: Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
          fakultas: true,
          prodi: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }

      return user;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 400;
      throw err;
    }
  }

  async changePassword(userId, data) {
    try {
      const { oldPassword, newPassword } = data;

      // Validasi: Cek apakah user ada
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Verifikasi password lama
      const isOldPasswordValid = await comparePassword(
        oldPassword,
        user.password
      );

      if (!isOldPasswordValid) {
        const error = new Error(
          "Password lama tidak sesuai. Silakan masukkan password lama yang benar."
        );
        error.statusCode = 400;
        throw error;
      }

      // Validasi: Cek apakah password baru sama dengan password lama
      const isSamePassword = await comparePassword(newPassword, user.password);

      if (isSamePassword) {
        const error = new Error(
          "Password baru harus berbeda dengan password lama. Silakan gunakan password yang berbeda."
        );
        error.statusCode = 400;
        throw error;
      }

      // Hash password baru
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return {
        message:
          "Password berhasil diubah. Silakan login ulang dengan password baru.",
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 400;
      throw err;
    }
  }

  async updateProfile(userId, data) {
    try {
      const { nama, fakultas, prodi } = data;

      // Validasi: Cek apakah user ada
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah nama sedang diubah dan sudah digunakan
      if (nama && nama.trim() !== existingUser.nama) {
        // Gunakan findFirst karena nama bukan unique field
        const nameExists = await prisma.user.findFirst({
          where: { nama: nama.trim() },
        });

        if (nameExists) {
          const error = new Error(
            "Nama sudah digunakan. Silakan gunakan nama lain."
          );
          error.statusCode = 409;
          throw error;
        }
      }

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (nama !== undefined) updateData.nama = nama.trim();
      if (fakultas !== undefined)
        updateData.fakultas = fakultas?.trim() || null;
      if (prodi !== undefined) updateData.prodi = prodi?.trim() || null;

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          nama: true,
          role: true,
          fakultas: true,
          prodi: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 400;
      throw err;
    }
  }
}
