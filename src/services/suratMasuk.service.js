// src/services/suratMasuk.service.js (IMPROVED)
import { prisma } from "../config/index.js";
import { generateNomorSuratMasuk } from "../utils/generateNomor.js";

class SuratMasukService {
  async list(filters = {}) {
    const { status, kategori, page = 1, limit = 10, search } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (status) where.status = status;
    if (kategori) where.kategori = kategori;

    // Perbaikan: remove field yang tidak ada (nomorAgenda, prioritas)
    if (search) {
      where.OR = [
        { nomorSurat: { contains: search, mode: "insensitive" } },
        { perihal: { contains: search, mode: "insensitive" } },
        { asalSurat: { contains: search, mode: "insensitive" } },
        { namaPengirim: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.suratMasuk.findMany({
        where,
        skip,
        take,
        include: {
          createdBy: {
            select: {
              id: true,
              nama_lengkap: true,
              email: true,
              role: true,
            },
          },
          lampiran: {
            select: {
              id: true,
              namaFile: true,
              ukuran: true,
              uploadedAt: true,
            },
          },
          disposisi: {
            select: {
              id: true,
              toUser: {
                select: {
                  id: true,
                  nama_lengkap: true,
                  email: true,
                },
              },
              status: true,
              jenisDispo: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.suratMasuk.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getById(id) {
    const surat = await prisma.suratMasuk.findUnique({
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
        disposisi: {
          include: {
            fromUser: {
              select: {
                id: true,
                nama_lengkap: true,
                email: true,
              },
            },
            toUser: {
              select: {
                id: true,
                nama_lengkap: true,
                email: true,
              },
            },
          },
        },
        tracking: {
          include: {
            createdBy: {
              select: {
                id: true,
                nama_lengkap: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!surat) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    return surat;
  }

  async create(data, userId) {
    const {
      nomorSurat,
      tanggalSurat,
      tanggalDiterima,
      asalSurat,
      perihal,
      kategori,
      namaPengirim,
    } = data;

    // Validasi kategori
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

    // Validasi nomor surat tidak duplikat
    const existingNomor = await prisma.suratMasuk.findFirst({
      where: { nomorSurat },
    });

    if (existingNomor) {
      const error = new Error("Nomor surat sudah digunakan");
      error.statusCode = 409;
      throw error;
    }

    // Validasi user (createdBy) ada
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error("User tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Validasi tanggalSurat tidak lebih besar dari tanggalDiterima
    const tglSurat = new Date(tanggalSurat);
    const tglDiterima = new Date(tanggalDiterima);

    if (tglSurat > tglDiterima) {
      const error = new Error(
        "Tanggal surat tidak boleh lebih besar dari tanggal diterima"
      );
      error.statusCode = 400;
      throw error;
    }

    const created = await prisma.suratMasuk.create({
      data: {
        nomorSurat,
        tanggalSurat: tglSurat,
        tanggalDiterima: tglDiterima,
        asalSurat,
        perihal,
        kategori,
        status: "DITERIMA",
        namaPengirim,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Buat tracking record otomatis
    await prisma.trackingSurat.create({
      data: {
        suratMasukId: created.id,
        tahapProses: "DITERIMA",
        posisiSaat: "SEKRETARIS_KANTOR",
        aksiDilakukan: `Menerima surat dari ${asalSurat}`,
        statusTracking: "DITERIMA",
        createdById: userId,
      },
    });

    return created;
  }

  async update(id, data, userId) {
    const existing = await prisma.suratMasuk.findUnique({
      where: { id },
    });

    if (!existing) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const {
      nomorSurat,
      tanggalSurat,
      tanggalDiterima,
      asalSurat,
      perihal,
      kategori,
      namaPengirim,
      status,
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
      const existingNomor = await prisma.suratMasuk.findFirst({
        where: { nomorSurat },
      });
      if (existingNomor) {
        const error = new Error("Nomor surat sudah digunakan");
        error.statusCode = 409;
        throw error;
      }
    }

    // Validasi status jika diubah
    if (status) {
      const validStatuses = [
        "DITERIMA",
        "DIPROSES",
        "DISPOSISI_KETUA",
        "DISPOSISI_SEKPENGURUS",
        "DISPOSISI_KABAG",
        "SELESAI",
      ];
      if (!validStatuses.includes(status)) {
        const error = new Error("Status tidak valid");
        error.statusCode = 400;
        throw error;
      }
    }

    const updateData = {};
    if (nomorSurat) updateData.nomorSurat = nomorSurat;
    if (tanggalSurat) updateData.tanggalSurat = new Date(tanggalSurat);
    if (tanggalDiterima) updateData.tanggalDiterima = new Date(tanggalDiterima);
    if (asalSurat) updateData.asalSurat = asalSurat;
    if (perihal) updateData.perihal = perihal;
    if (kategori) updateData.kategori = kategori;
    if (namaPengirim !== undefined)
      updateData.namaPengirim = namaPengirim || null;
    if (status) updateData.status = status;

    const updated = await prisma.suratMasuk.update({
      where: { id },
      data: updateData,
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
        disposisi: true,
      },
    });

    // Buat tracking record untuk perubahan status
    if (status && status !== existing.status) {
      await prisma.trackingSurat.create({
        data: {
          suratMasukId: id,
          tahapProses: status,
          posisiSaat: "SEKRETARIS_KANTOR",
          aksiDilakukan: `Status surat diubah menjadi ${status}`,
          statusTracking: status,
          createdById: userId,
        },
      });
    }

    return updated;
  }

  async updateStatus(id, status, userId) {
    const existing = await prisma.suratMasuk.findUnique({
      where: { id },
    });

    if (!existing) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Validasi status
    const validStatuses = [
      "DITERIMA",
      "DIPROSES",
      "DISPOSISI_KETUA",
      "DISPOSISI_SEKPENGURUS",
      "DISPOSISI_KABAG",
      "SELESAI",
    ];
    if (!validStatuses.includes(status)) {
      const error = new Error("Status tidak valid");
      error.statusCode = 400;
      throw error;
    }

    // Validasi workflow status (tidak bisa mundur)
    const statusOrder = [
      "DITERIMA",
      "DIPROSES",
      "DISPOSISI_KETUA",
      "DISPOSISI_SEKPENGURUS",
      "DISPOSISI_KABAG",
      "SELESAI",
    ];
    const currentIndex = statusOrder.indexOf(existing.status);
    const newIndex = statusOrder.indexOf(status);

    if (newIndex < currentIndex) {
      const error = new Error(
        `Tidak dapat mengubah status dari ${existing.status} ke ${status} (mundur tidak diperbolehkan)`
      );
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.suratMasuk.update({
      where: { id },
      data: { status },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Buat tracking record
    await prisma.trackingSurat.create({
      data: {
        suratMasukId: id,
        tahapProses: status,
        posisiSaat: "SEKRETARIS_KANTOR",
        aksiDilakukan: `Status surat diubah menjadi ${status}`,
        statusTracking: status,
        createdById: userId,
      },
    });

    return updated;
  }

  async remove(id) {
    const existing = await prisma.suratMasuk.findUnique({
      where: { id },
    });

    if (!existing) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Hanya bisa delete jika status DITERIMA
    if (existing.status !== "DITERIMA") {
      const error = new Error(
        "Hanya surat dengan status DITERIMA yang dapat dihapus"
      );
      error.statusCode = 400;
      throw error;
    }

    // Delete related data (cascade delete handled by Prisma)
    await prisma.lampiran.deleteMany({
      where: { suratMasukId: id },
    });

    await prisma.disposisi.deleteMany({
      where: { suratMasukId: id },
    });

    await prisma.trackingSurat.deleteMany({
      where: { suratMasukId: id },
    });

    await prisma.suratMasuk.delete({ where: { id } });
    return true;
  }

  // Helper method: Get surat by status untuk filtering
  async getByStatus(status, filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.suratMasuk.findMany({
        where: { status },
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
        },
        orderBy: { tanggalDiterima: "desc" },
      }),
      prisma.suratMasuk.count({ where: { status } }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  // Helper method: Get pending surat (untuk dashboard)
  async getPending(filters = {}) {
    const { page = 1, limit = 10 } = filters;
    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const pendingStatuses = [
      "DITERIMA",
      "DIPROSES",
      "DISPOSISI_KETUA",
      "DISPOSISI_SEKPENGURUS",
      "DISPOSISI_KABAG",
    ];

    const [items, total] = await Promise.all([
      prisma.suratMasuk.findMany({
        where: { status: { in: pendingStatuses } },
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
        },
        orderBy: { tanggalDiterima: "asc" },
      }),
      prisma.suratMasuk.count({ where: { status: { in: pendingStatuses } } }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  // Helper method: Get stats untuk reporting
  async getStats() {
    const stats = await prisma.suratMasuk.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const categories = await prisma.suratMasuk.groupBy({
      by: ["kategori"],
      _count: {
        id: true,
      },
    });

    return {
      byStatus: stats,
      byKategori: categories,
      total: await prisma.suratMasuk.count(),
    };
  }
}

export default SuratMasukService;
