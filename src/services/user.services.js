// src/services/user.services.js
import { prisma } from "../config/index.js";
import { hashPassword } from "../utils/password.js";

class UserService {
  async list(filters = {}) {
    const { role, isActive, page = 1, limit = 10, search } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    if (search) {
      where.OR = [
        { nama_lengkap: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          nama_lengkap: true,
          email: true,
          username: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
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
  }

  async updateUser(id, data) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("User tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const {
      nama_lengkap,
      email,
      username,
      role,
      kodeBagian,
      jabatan,
      phone,
      isActive,
    } = data;

    // Validasi email jika diubah
    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (emailExists) {
        const error = new Error("Email sudah digunakan");
        error.statusCode = 409;
        throw error;
      }
    }

    // Validasi username jika diubah
    if (username && username !== existing.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: username.trim() },
      });

      if (usernameExists) {
        const error = new Error("Username sudah digunakan");
        error.statusCode = 409;
        throw error;
      }
    }

    // Validasi nama_lengkap jika diubah
    if (nama_lengkap && nama_lengkap !== existing.nama_lengkap) {
      const nameExists = await prisma.user.findFirst({
        where: { nama_lengkap: nama_lengkap.trim() },
      });

      if (nameExists) {
        const error = new Error("Nama lengkap sudah digunakan");
        error.statusCode = 409;
        throw error;
      }
    }

    const updateData = {};
    if (nama_lengkap !== undefined)
      updateData.nama_lengkap = nama_lengkap.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (username !== undefined) updateData.username = username.trim();
    if (role !== undefined) updateData.role = role;
    if (kodeBagian !== undefined)
      updateData.kodeBagian = kodeBagian?.trim() || null;
    if (jabatan !== undefined) updateData.jabatan = jabatan?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        kodeBagian: true,
        jabatan: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async updateStatus(id, isActive) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("User tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        username: true,
        role: true,
        kodeBagian: true,
        jabatan: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteUser(id) {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("User tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Cegah delete admin terakhir (optional)
    if (existing.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        const error = new Error(
          "Tidak dapat menghapus admin terakhir. Minimal harus ada 1 admin."
        );
        error.statusCode = 400;
        throw error;
      }
    }

    await prisma.user.delete({ where: { id } });
    return true;
  }

  async getByRole(role, filters = {}) {
    const { page = 1, limit = 10 } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { role, isActive: true },
        skip,
        take,
        select: {
          id: true,
          nama_lengkap: true,
          email: true,
          username: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { nama_lengkap: "asc" },
      }),
      prisma.user.count({ where: { role, isActive: true } }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getByBagian(kodeBagian, filters = {}) {
    const { page = 1, limit = 10 } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { kodeBagian, isActive: true },
        skip,
        take,
        select: {
          id: true,
          nama_lengkap: true,
          email: true,
          username: true,
          role: true,
          kodeBagian: true,
          jabatan: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { nama_lengkap: "asc" },
      }),
      prisma.user.count({ where: { kodeBagian, isActive: true } }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }
}

export default UserService;
