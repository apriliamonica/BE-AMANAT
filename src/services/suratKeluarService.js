// src/services/suratKeluarService.js
import { prisma } from "../config/index.js";

class SuratKeluarService {
  async list(filters = {}) {
    const { status, kategori, page = 1, limit = 10, search } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (status) where.status = status;
    if (kategori) where.kategori = kategori;

    if (search) {
      where.OR = [
        { nomorSurat: { contains: search, mode: "insensitive" } },
        { perihal: { contains: search, mode: "insensitive" } },
        { tujuanSurat: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.suratKeluar.findMany({
        where,
        skip,
        take,
        include: {
          createdBy: {
            select: {
              id: true,
              nama_lengkap: true,
              email: true,
            },
          },
          lampiran: {
            select: {
              id: true,
              namaFile: true,
              ukuran: true,
            },
          },
          balasanDariSuratMasuk: {
            select: {
              id: true,
              nomorSurat: true,
              perihal: true,
              asalSurat: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.suratKeluar.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getById(id) {
    const surat = await prisma.suratKeluar.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
        lampiran: true,
        tracking: {
          orderBy: { createdAt: "asc" },
        },
        disposisi: true,
        balasanDariSuratMasuk: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
            asalSurat: true,
            tanggalDiterima: true,
          },
        },
      },
    });

    if (!surat) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    return surat;
  }

  async create(data, userId) {
    const {
      nomorSurat,
      tanggalSurat,
      tujuanSurat,
      perihal,
      kategori,
      catatan,
      balasanDariSuratMasukId,
    } = data;

    // Validasi nomor surat tidak duplikat
    const existingNomor = await prisma.suratKeluar.findFirst({
      where: { nomorSurat },
    });

    if (existingNomor) {
      const error = new Error("Nomor surat sudah digunakan");
      error.statusCode = 400;
      throw error;
    }

    // Validasi kategori valid
    const validCategories = [
      "UNDANGAN",
      "PERMOHONAN",
      "PEMBERITAHUAN",
      "VERIFIKASI",
      "AUDIT",
      "LAINNYA",
    ];
    if (!validCategories.includes(kategori)) {
      const error = new Error("Kategori tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const created = await prisma.suratKeluar.create({
      data: {
        nomorSurat,
        tanggalSurat: new Date(tanggalSurat),
        tujuanSurat,
        perihal,
        kategori,
        catatan: catatan || null,
        status: "DRAFT",
        createdById: userId,
        balasanDariSuratMasukId: balasanDariSuratMasukId || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
          },
        },
        balasanDariSuratMasuk: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
          },
        },
      },
    });

    // Create tracking record
    await prisma.trackingSurat.create({
      data: {
        suratKeluarId: created.id,
        tahapProses: "DRAFT",
        posisiSaat: "SEKRETARIS_KANTOR",
        aksiDilakukan: "Membuat draft surat keluar",
        statusTracking: "DRAFT",
        createdById: userId,
      },
    });

    return created;
  }

  async update(id, data) {
    const existing = await prisma.suratKeluar.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Hanya bisa update jika status masih DRAFT atau REVIEW_SEKPENGURUS
    if (!["DRAFT", "REVIEW_SEKPENGURUS"].includes(existing.status)) {
      const error = new Error(
        `Tidak dapat mengubah surat dengan status ${existing.status}`
      );
      error.statusCode = 400;
      throw error;
    }

    const {
      nomorSurat,
      tanggalSurat,
      tujuanSurat,
      perihal,
      kategori,
      catatan,
    } = data;

    // Validasi kategori jika diubah
    if (kategori) {
      const validCategories = [
        "UNDANGAN",
        "PERMOHONAN",
        "PEMBERITAHUAN",
        "VERIFIKASI",
        "AUDIT",
        "LAINNYA",
      ];
      if (!validCategories.includes(kategori)) {
        const error = new Error("Kategori tidak valid");
        error.statusCode = 400;
        throw error;
      }
    }

    // Validasi nomor surat jika diubah
    if (nomorSurat && nomorSurat !== existing.nomorSurat) {
      const existingNomor = await prisma.suratKeluar.findFirst({
        where: { nomorSurat },
      });
      if (existingNomor) {
        const error = new Error("Nomor surat sudah digunakan");
        error.statusCode = 400;
        throw error;
      }
    }

    const updateData = {};
    if (nomorSurat) updateData.nomorSurat = nomorSurat;
    if (tanggalSurat) updateData.tanggalSurat = new Date(tanggalSurat);
    if (tujuanSurat) updateData.tujuanSurat = tujuanSurat;
    if (perihal) updateData.perihal = perihal;
    if (kategori) updateData.kategori = kategori;
    if (catatan !== undefined) updateData.catatan = catatan || null;

    const updated = await prisma.suratKeluar.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async updateStatus(id, status) {
    const existing = await prisma.suratKeluar.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Validasi status workflow
    const validStatuses = [
      "DRAFT",
      "REVIEW_SEKPENGURUS",
      "LAMPIRAN_KABAG",
      "REVIEW_KETUA",
      "TERKIRIM",
    ];
    if (!validStatuses.includes(status)) {
      const error = new Error("Status tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.suratKeluar.update({
      where: { id },
      data: { status },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id) {
    const existing = await prisma.suratKeluar.findUnique({
      where: { id },
    });

    if (!existing) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Hanya bisa delete jika status DRAFT
    if (existing.status !== "DRAFT") {
      const error = new Error(
        "Hanya surat dengan status DRAFT yang dapat dihapus"
      );
      error.statusCode = 400;
      throw error;
    }

    // Delete related lampiran dan tracking
    await prisma.lampiran.deleteMany({
      where: { suratKeluarId: id },
    });

    await prisma.trackingSurat.deleteMany({
      where: { suratKeluarId: id },
    });

    await prisma.suratKeluar.delete({ where: { id } });
    return true;
  }
}

export default SuratKeluarService;
