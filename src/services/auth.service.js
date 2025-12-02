import { prisma } from "../config/index.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../config/jwt.js";

export class AuthService {
  async register(data) {
    try {
      const { nama_lengkap, email, username, password, role, kodeBagian, jabatan, phone, isActive } = data;

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
        where: { nama_lengkap: nama_lengkap.trim() },
      });

      if (existingName) {
        const error = new Error(
          "Nama sudah terdaftar. Silakan gunakan nama lain atau login."
        );
        error.statusCode = 409;
        throw error;
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username: username.trim() },
      });

      if (existingUsername) {
        const error = new Error(
          "Username sudah terdaftar. Silakan gunakan username lain atau login."
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
          username: username.trim(),
          password: hashedPassword,
          nama_lengkap: nama_lengkap.trim(),
          role: role,
          kodeBagian: kodeBagian ?? null,
          jabatan: jabatan ?? null,
          phone: phone ?? null,
          isActive: isActive ?? true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          nama_lengkap: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate token
      // const token = generateToken({ userId: user.id });

      return {
        user
      };
    } catch (error) {
      const err = new Error(error.message);
      err.statusCode = error.statusCode || 400;
      throw err;
    }
  }

  async login(data) {
    try {
      const { username, password } = data;

      // Validasi: Cari user berdasarkan email
      const user = await prisma.user.findUnique({
        where: { username: username.trim() },
      });

      if (!user) {
        const error = new Error(
          "Username atau password salah. Silakan coba lagi."
        );
        error.statusCode = 401;
        throw error;
      }

      // Validasi: Verifikasi password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        const error = new Error(
          "Username atau password salah. Silakan coba lagi."
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
          nama_lengkap: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
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
      const { id, nama_lengkap, email, username, password, role, kodeBagian, jabatan, phone, isActive } = data;

      // validasi is me or is admin dari userId
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }
      if (currentUser.id !== id && currentUser.role !== 'ADMIN') {
        const error = new Error("Anda tidak memiliki akses untuk mengupdate profile user lain");
        error.statusCode = 403;
        throw error;
      }

      // Validasi: Cek apakah user ada
      const existingUser = await prisma.user.findUnique({
        where: { id: id },
      });

      if (!existingUser) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }

      // Validasi: Cek apakah nama sedang diubah dan sudah digunakan
      if (nama_lengkap && nama_lengkap.trim() !== existingUser.nama_lengkap) {
        // Gunakan findFirst karena nama bukan unique field
        const nameExists = await prisma.user.findFirst({
          where: { nama_lengkap: nama_lengkap.trim() },
        });

        if (nameExists) {
          const error = new Error(
            "Nama lengkap sudah digunakan. Silakan gunakan nama lengkap lain."
          );
          error.statusCode = 409;
          throw error;
        }
      }

      // Prepare update data (hanya field yang diisi)
      const updateData = {};
      if (nama_lengkap !== undefined) updateData.nama_lengkap = nama_lengkap.trim();
      if (email !== undefined) updateData.email = email.toLowerCase().trim();
      if (username !== undefined) updateData.username = username.trim();
      if (password !== undefined) updateData.password = await hashPassword(password);
      if (role !== undefined) updateData.role = role;
      if (kodeBagian !== undefined)
        updateData.kodeBagian = kodeBagian?.trim() || null;
      if (jabatan !== undefined) updateData.jabatan = jabatan?.trim() || null;
      if (phone !== undefined) updateData.phone = phone?.trim() || null;
      if (isActive !== undefined) updateData.isActive = isActive ?? true;

      // Update user
      const user = await prisma.user.update({
        where: { id: id },
        data: updateData,
        select: {
          id: true,
          email: true,
          nama_lengkap: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
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
