// src/services/trackingService.js
import { prisma } from "../config/index.js";

class TrackingService {
  async getBySuratMasuk(suratMasukId) {
    // Validasi surat masuk ada
    const surat = await prisma.suratMasuk.findUnique({
      where: { id: suratMasukId },
    });

    if (!surat) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const tracking = await prisma.trackingSurat.findMany({
      where: { suratMasukId },
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
    });

    return tracking;
  }

  async getBySuratKeluar(suratKeluarId) {
    // Validasi surat keluar ada
    const surat = await prisma.suratKeluar.findUnique({
      where: { id: suratKeluarId },
    });

    if (!surat) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const tracking = await prisma.trackingSurat.findMany({
      where: { suratKeluarId },
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
    });

    return tracking;
  }

  async getById(id) {
    const tracking = await prisma.trackingSurat.findUnique({
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
        suratMasuk: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
            status: true,
          },
        },
        suratKeluar: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
            status: true,
          },
        },
      },
    });

    if (!tracking) {
      const error = new Error("Tracking tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    return tracking;
  }

  async create(data, userId) {
    const {
      suratMasukId,
      suratKeluarId,
      tahapProses,
      posisiSaat,
      aksiDilakukan,
      statusTracking,
    } = data;

    // Validasi: minimal satu surat harus ada
    if (!suratMasukId && !suratKeluarId) {
      const error = new Error(
        "Minimal satu dari suratMasukId atau suratKeluarId harus diisi"
      );
      error.statusCode = 400;
      throw error;
    }

    // Validasi: jika suratMasukId ada, periksa keberadaannya
    if (suratMasukId) {
      const surat = await prisma.suratMasuk.findUnique({
        where: { id: suratMasukId },
      });
      if (!surat) {
        const error = new Error("Surat masuk tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }
    }

    // Validasi: jika suratKeluarId ada, periksa keberadaannya
    if (suratKeluarId) {
      const surat = await prisma.suratKeluar.findUnique({
        where: { id: suratKeluarId },
      });
      if (!surat) {
        const error = new Error("Surat keluar tidak ditemukan");
        error.statusCode = 404;
        throw error;
      }
    }

    const created = await prisma.trackingSurat.create({
      data: {
        suratMasukId: suratMasukId || null,
        suratKeluarId: suratKeluarId || null,
        tahapProses,
        posisiSaat,
        aksiDilakukan,
        statusTracking: statusTracking || "PROSES",
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

    return created;
  }

  async getStatsByTahap(tahapProses) {
    const stats = await prisma.trackingSurat.groupBy({
      by: ["tahapProses", "statusTracking"],
      where: { tahapProses },
      _count: {
        id: true,
      },
    });

    return stats;
  }
}

export default TrackingService;
