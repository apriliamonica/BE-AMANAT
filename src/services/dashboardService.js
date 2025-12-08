// src/services/dashboardService.js
import { prisma } from "../config/index.js";

class DashboardService {
  // Get dashboard stats untuk semua role
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Count surat masuk hari ini
    const suratMasukHariIni = await prisma.suratMasuk.count({
      where: {
        tanggalDiterima: {
          gte: today,
        },
      },
    });

    // Count surat keluar hari ini
    const suratKeluarHariIni = await prisma.suratKeluar.count({
      where: {
        tanggalSurat: {
          gte: today,
        },
      },
    });

    // Count disposisi pending
    const disposisiPending = await prisma.disposisi.count({
      where: {
        status: "PENDING",
      },
    });

    // Count surat selesai bulan ini (arsip)
    const arsipBulanIni = await prisma.suratMasuk.count({
      where: {
        status: "SELESAI",
        updatedAt: {
          gte: startOfMonth,
        },
      },
    });

    // Total surat masuk
    const totalSuratMasuk = await prisma.suratMasuk.count();

    // Total surat keluar
    const totalSuratKeluar = await prisma.suratKeluar.count();

    return {
      suratMasukHariIni,
      suratKeluarHariIni,
      disposisiPending,
      arsipBulanIni,
      totalSuratMasuk,
      totalSuratKeluar,
    };
  }

  // Get recent surat masuk untuk tracking
  async getRecentSuratMasuk(limit = 5) {
    const items = await prisma.suratMasuk.findMany({
      where: {
        status: {
          not: "SELESAI",
        },
      },
      take: limit,
      orderBy: { tanggalDiterima: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            role: true,
          },
        },
        disposisi: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            toUser: {
              select: {
                id: true,
                nama_lengkap: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return items;
  }

  // Get recent surat keluar untuk tracking
  async getRecentSuratKeluar(limit = 5) {
    const items = await prisma.suratKeluar.findMany({
      where: {
        status: {
          not: "TERKIRIM",
        },
      },
      take: limit,
      orderBy: { tanggalSurat: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            nama_lengkap: true,
            role: true,
          },
        },
        disposisi: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            toUser: {
              select: {
                id: true,
                nama_lengkap: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return items;
  }

  // Get disposisi untuk user tertentu
  async getDisposisiForUser(userId, limit = 10) {
    const items = await prisma.disposisi.findMany({
      where: {
        toUserId: userId,
        status: { in: ["PENDING", "DITERIMA", "DIPROSES"] },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        fromUser: {
          select: {
            id: true,
            nama_lengkap: true,
            role: true,
          },
        },
        suratMasuk: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
            asalSurat: true,
          },
        },
        suratKeluar: {
          select: {
            id: true,
            nomorSurat: true,
            perihal: true,
            tujuanSurat: true,
          },
        },
      },
    });

    return items;
  }
}

export default DashboardService;
