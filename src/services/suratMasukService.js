// src/services/suratMasukService.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SuratMasukService {
  /**
   * Buat surat masuk baru (TAHAP 1: DITERIMA)
   * Role: Sekretaris Kantor (Admin)
   */
  async createSuratMasuk(data, userId) {
    try {
      const {
        nomorSurat,
        tanggalSurat,
        asalSurat,
        namaPengirim,
        kontakPengirim,
        perihal,
        kategori,
        prioritas = "SEDANG",
      } = data;

      // Generate nomor agenda otomatis
      const nomorAgenda = await this.generateNomorAgenda();

      // Validasi nomor surat tidak duplikat
      const existingNomor = await prisma.suratMasuk.findUnique({
        where: { nomorSurat },
      });

      if (existingNomor) {
        throw new Error(`Nomor surat ${nomorSurat} sudah ada di sistem`);
      }

      // Create surat masuk
      const suratMasuk = await prisma.suratMasuk.create({
        data: {
          nomorAgenda,
          nomorSurat,
          tanggalSurat: new Date(tanggalSurat),
          asalSurat,
          namaPengirim,
          kontakPengirim,
          perihal,
          kategori,
          prioritas,
          status: "DITERIMA",
          createdById: userId,
        },
      });

      // Create tracking entry
      await this.createTracking(
        {
          suratMasukId: suratMasuk.id,
          tahapProses: "DITERIMA",
          posisiSaat: "Sekretaris Kantor",
          aksiDilakukan: "Menerima dan input surat ke sistem",
          statusTracking: "DITERIMA",
        },
        userId
      );

      return {
        success: true,
        message: "Surat masuk berhasil dibuat",
        data: suratMasuk,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get surat masuk dengan filtering
   */
  async getSuratMasuk(filters = {}, userId, userRole) {
    try {
      const {
        status,
        kategori,
        prioritas,
        page = 1,
        limit = 10,
        search,
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = {};

      if (status) where.status = status;
      if (kategori) where.kategori = kategori;
      if (prioritas) where.prioritas = prioritas;

      if (search) {
        where.OR = [
          { nomorSurat: { contains: search, mode: "insensitive" } },
          { asalSurat: { contains: search, mode: "insensitive" } },
          { perihal: { contains: search, mode: "insensitive" } },
        ];
      }

      const [suratMasuk, total] = await Promise.all([
        prisma.suratMasuk.findMany({
          where,
          skip,
          take: limit,
          include: {
            createdBy: {
              select: { id: true, name: true, role: true },
            },
            tracking: {
              orderBy: { createdAt: "desc" },
            },
            disposisi: {
              include: {
                toUser: { select: { name: true, role: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.suratMasuk.count({ where }),
      ]);

      // Add status per role
      const suratWithRoleStatus = suratMasuk.map((surat) => ({
        ...surat,
        statusForMe: this.getStatusPerRole(surat, userRole),
      }));

      return {
        success: true,
        data: suratWithRoleStatus,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get surat masuk by ID
   */
  async getSuratMasukById(suratMasukId) {
    try {
      const surat = await prisma.suratMasuk.findUnique({
        where: { id: suratMasukId },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          lampiran: {
            select: {
              id: true,
              namaFile: true,
              ukuran: true,
              mimeType: true,
              uploadedAt: true,
            },
          },
          tracking: {
            include: {
              createdBy: { select: { name: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          disposisi: {
            include: {
              fromUser: { select: { name: true, role: true } },
              toUser: { select: { name: true, role: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!surat) {
        throw new Error("Surat masuk tidak ditemukan");
      }

      return {
        success: true,
        data: surat,
      };
    } catch (error) {
      throw error;
    }
  }
  /**
   * Update status surat masuk (ke tahap berikutnya)
   * Sekretaris Kantor: DITERIMA -> DIPROSES
   * Ketua: DIPROSES -> DISPOSISI_KETUA
   * Sekpengurus: DISPOSISI_KETUA -> DISPOSISI_SEKPENGURUS
   * Kabag: DISPOSISI_SEKPENGURUS -> DISPOSISI_KABAG
   */
  async updateStatusSurat(suratMasukId, newStatus, userId, userRole) {
    try {
      const surat = await prisma.suratMasuk.findUnique({
        where: { id: suratMasukId },
      });

      if (!surat) {
        throw new Error("Surat masuk tidak ditemukan");
      }
      // Validasi transisi status
      const validTransitions = this.getValidStatusTransitions(
        surat.status,
        userRole
      );
      if (!validTransitions.includes(newStatus)) {
        throw new Error(
          `Transisi status dari ${surat.status} ke ${newStatus} tidak diperbolehkan`
        );
      }
      // Update status
      const updated = await prisma.suratMasuk.update({
        where: { id: suratMasukId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });
      // Create tracking
      const posisiMapping = {
        DITERIMA: "Sekretaris Kantor",
        DIPROSES: "Sekretaris Kantor",
        DISPOSISI_KETUA: "Ketua Yayasan",
        DISPOSISI_SEKPENGURUS: "Sekretaris Pengurus",
        DISPOSISI_KABAG: "Kepala Bagian",
        SELESAI: "Arsip",
      };

      await this.createTracking(
        {
          suratMasukId: suratMasukId,
          tahapProses: newStatus,
          posisiSaat: posisiMapping[newStatus],
          aksiDilakukan: `Surat dipindahkan ke status ${newStatus}`,
          statusTracking: newStatus,
        },
        userId
      );

      return {
        success: true,
        message: `Status surat diubah menjadi ${newStatus}`,
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Generate nomor agenda
   * Format: SM-YYYYMM-0001
   */
  async generateNomorAgenda() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    const lastAgenda = await prisma.suratMasuk.findFirst({
      where: {
        nomorAgenda: {
          startsWith: `SM-${yearMonth}-`,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastAgenda) {
      const lastNumber = parseInt(lastAgenda.nomorAgenda.split("-")[2]);
      nextNumber = lastNumber + 1;
    }

    return `SM-${yearMonth}-${String(nextNumber).padStart(4, "0")}`;
  }
  /**
   * Helper: Create tracking entry
   */
  async createTracking(trackingData, userId) {
    return await prisma.trackingSurat.create({
      data: {
        ...trackingData,
        createdById: userId,
      },
    });
  }
  /**
   * Helper: Get status per role
   * Return status yang relevan untuk role user
   */
  getStatusPerRole(surat, userRole) {
    const statusMapping = {
      ADMIN: {
        DITERIMA: "SELESAI INPUT",
        DIPROSES: "SEDANG VERIFIKASI",
        DISPOSISI_KETUA: "DI KETUA (MONITORING)",
        DISPOSISI_SEKPENGURUS: "DI SEKPENGURUS (MONITORING)",
        DISPOSISI_KABAG: "DI KABAG (MONITORING)",
        SELESAI: "SELESAI",
      },
      KETUA_PENGURUS: {
        DITERIMA: "MENUNGGU VERIFIKASI",
        DIPROSES: "PERLU DISPOSISI",
        DISPOSISI_KETUA: "SELESAI DISPOSISI",
        DISPOSISI_SEKPENGURUS: "SELESAI",
        DISPOSISI_KABAG: "SELESAI",
        SELESAI: "SELESAI",
      },
      SEKRETARIS_PENGURUS: {
        DITERIMA: "BELUM TIBA",
        DIPROSES: "MENUNGGU GILIRAN",
        DISPOSISI_KETUA: "MENUNGGU GILIRAN",
        DISPOSISI_SEKPENGURUS: "PERLU KOORDINASI",
        DISPOSISI_KABAG: "SELESAI KOORDINASI",
        SELESAI: "SELESAI",
      },
      KEPALA_BAGIAN_PSDM: {
        DITERIMA: "BELUM TIBA",
        DIPROSES: "BELUM TIBA",
        DISPOSISI_KETUA: "BELUM TIBA",
        DISPOSISI_SEKPENGURUS: "MENUNGGU GILIRAN",
        DISPOSISI_KABAG: "TINDAKAN DIPERLUKAN",
        SELESAI: "SELESAI PROSES",
      },
      KEPALA_BAGIAN_KEUANGAN: {
        DITERIMA: "BELUM TIBA",
        DIPROSES: "BELUM TIBA",
        DISPOSISI_KETUA: "BELUM TIBA",
        DISPOSISI_SEKPENGURUS: "MENUNGGU GILIRAN",
        DISPOSISI_KABAG: "TINDAKAN DIPERLUKAN",
        SELESAI: "SELESAI PROSES",
      },
      KEPALA_BAGIAN_UMUM: {
        DITERIMA: "BELUM TIBA",
        DIPROSES: "BELUM TIBA",
        DISPOSISI_KETUA: "BELUM TIBA",
        DISPOSISI_SEKPENGURUS: "MENUNGGU GILIRAN",
        DISPOSISI_KABAG: "TINDAKAN DIPERLUKAN",
        SELESAI: "SELESAI PROSES",
      },
    };

    return statusMapping[userRole]?.[surat.status] || "UNKNOWN";
  }

  /**
   * Helper: Get valid status transitions
   */
  getValidStatusTransitions(currentStatus, userRole) {
    const transitions = {
      ADMIN: {
        DITERIMA: ["DIPROSES"],
        DIPROSES: ["DISPOSISI_KETUA"],
      },
      KETUA_PENGURUS: {
        DIPROSES: ["DISPOSISI_KETUA"],
        DISPOSISI_KETUA: ["DISPOSISI_SEKPENGURUS"],
      },
      SEKRETARIS_PENGURUS: {
        DISPOSISI_KETUA: ["DISPOSISI_SEKPENGURUS"],
        DISPOSISI_SEKPENGURUS: ["DISPOSISI_KABAG"],
      },
      KEPALA_BAGIAN_PSDM: {
        DISPOSISI_KABAG: ["SELESAI"],
      },
      KEPALA_BAGIAN_KEUANGAN: {
        DISPOSISI_KABAG: ["SELESAI"],
      },
      KEPALA_BAGIAN_UMUM: {
        DISPOSISI_KABAG: ["SELESAI"],
      },
    };

    return transitions[userRole]?.[currentStatus] || [];
  }
}

module.exports = new SuratMasukService();
