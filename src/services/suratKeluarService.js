const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class SuratKeluarService {
  /**
   * Buat surat keluar baru (TAHAP 1: DRAFT)
   * Role: Sekretaris Kantor (Admin)
   */
  async createSuratKeluar(data, userId) {
    try {
      const {
        nomorSurat,
        tanggalSurat,
        tujuanSurat,
        alamatTujuan,
        kontakTujuan,
        emailTujuan,
        perihal,
        isiSurat,
        kategori,
        prioritas = "SEDANG",
        tembusan,
      } = data;
      // Generate nomor agenda otomatis
      const nomorAgenda = await this.generateNomorAgenda();
      // Validasi nomor surat tidak duplikat
      const existingNomor = await prisma.suratKeluar.findUnique({
        where: { nomorSurat },
      });

      // Create surat keluar
      const suratKeluar = await prisma.suratKeluar.create({
        data: {
          nomorAgenda,
          nomorSurat,
          tanggalSurat: new Date(tanggalSurat),
          tujuanSurat,
          alamatTujuan,
          kontakTujuan,
          perihal,
          isiSurat,
          kategori,
          prioritas,
          tembusan,
          status: "DRAFT",
          createdById: userId,
        },
      });

      // Create tracking entry
      await prisma.trackingSurat.create({
        data: {
          suratKeluarId: suratKeluar.id,
          tahapProses: "DRAFT",
          posisiSaat: "Sekretaris Kantor",
          aksiDilakukan: "Membuat draft surat keluar",
          statusTracking: "DRAFT",
          createdById: userId,
        },
      });

      return {
        success: true,
        message: "Surat keluar berhasil dibuat (draft)",
        data: suratKeluar,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get surat keluar dengan filtering
   */
  async getSuratKeluar(filters = {}, userId, userRole) {
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

      const where = {};

      if (status) where.status = status;
      if (kategori) where.kategori = kategori;
      if (prioritas) where.prioritas = prioritas;

      if (search) {
        where.OR = [
          { nomorSurat: { contains: search, mode: "insensitive" } },
          { tujuanSurat: { contains: search, mode: "insensitive" } },
          { perihal: { contains: search, mode: "insensitive" } },
        ];
      }

      const [suratKeluar, total] = await Promise.all([
        prisma.suratKeluar.findMany({
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
            lampiran: {
              select: {
                id: true,
                namaFile: true,
                ukuran: true,
                mimeType: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.suratKeluar.count({ where }),
      ]);

      // Add status per role
      const suratWithRoleStatus = suratKeluar.map((surat) => ({
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
   * Get surat keluar by ID
   */
  async getSuratKeluarById(suratKeluarId) {
    try {
      const surat = await prisma.suratKeluar.findUnique({
        where: { id: suratKeluarId },
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
        },
      });

      if (!surat) {
        throw new Error("Surat keluar tidak ditemukan");
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
   * Update status surat keluar
   */
  async updateStatusSurat(suratKeluarId, newStatus, userId, userRole) {
    try {
      const surat = await prisma.suratKeluar.findUnique({
        where: { id: suratKeluarId },
      });

      if (!surat) {
        throw new Error("Surat keluar tidak ditemukan");
      }

      const validTransitions = this.getValidStatusTransitions(
        surat.status,
        userRole
      );
      if (!validTransitions.includes(newStatus)) {
        throw new Error(
          `Transisi status tidak diperbolehkan: ${surat.status} -> ${newStatus}`
        );
      }

      const updated = await prisma.suratKeluar.update({
        where: { id: suratKeluarId },
        data: {
          status: newStatus,
          tanggalDikirim: newStatus === "TERKIRIM" ? new Date() : null,
          updatedAt: new Date(),
        },
      });

      await prisma.trackingSurat.create({
        data: {
          suratKeluarId: suratKeluarId,
          tahapProses: newStatus,
          posisiSaat: this.getPositionForStatus(newStatus),
          aksiDilakukan: `Status diubah ke ${newStatus}`,
          statusTracking: newStatus,
          createdById: userId,
        },
      });

      return {
        success: true,
        message: `Status surat diubah ke ${newStatus}`,
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Helper: Generate nomor agenda
   */
  async generateNomorAgenda() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const yearMonth = `${year}${month}`;

    const lastAgenda = await prisma.suratKeluar.findFirst({
      where: {
        nomorAgenda: {
          startsWith: `SK-${yearMonth}-`,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastAgenda) {
      const lastNumber = parseInt(lastAgenda.nomorAgenda.split("-")[2]);
      nextNumber = lastNumber + 1;
    }

    return `SK-${yearMonth}-${String(nextNumber).padStart(4, "0")}`;
  }

  /**
   * Helper: Get status per role
   */
  getStatusPerRole(surat, userRole) {
    const statusMapping = {
      ADMIN: {
        DRAFT: "DRAFT DIBUAT - MONITORING",
        REVIEW_SEKPENGURUS: "DI SEKPENGURUS - REVIEW",
        LAMPIRAN_KABAG: "DI KABAG - UPLOAD LAMPIRAN",
        REVIEW_KETUA: "DI KETUA - REVIEW & TTD",
        TERKIRIM: "TERKIRIM - SELESAI",
        REVISI: "REVISI",
        DIBATALKAN: "DIBATALKAN",
      },
      SEKRETARIS_PENGURUS: {
        DRAFT: "MENUNGGU DRAFT",
        REVIEW_SEKPENGURUS: "PERLU REVIEW",
        LAMPIRAN_KABAG: "LAMPIRAN REQUEST",
        REVIEW_KETUA: "LAMPIRAN DITERIMA - KE KETUA",
        TERKIRIM: "TERKIRIM - SELESAI",
        REVISI: "REVISI",
        DIBATALKAN: "DIBATALKAN",
      },
      KEPALA_BAGIAN_PSDM: {
        DRAFT: "BELUM TIBA",
        REVIEW_SEKPENGURUS: "BELUM TIBA",
        LAMPIRAN_KABAG: "UPLOAD LAMPIRAN DIPERLUKAN",
        REVIEW_KETUA: "UPLOAD SELESAI",
        TERKIRIM: "TERKIRIM - SELESAI",
        REVISI: "REVISI",
        DIBATALKAN: "DIBATALKAN",
      },
      KEPALA_BAGIAN_KEUANGAN: {
        DRAFT: "BELUM TIBA",
        REVIEW_SEKPENGURUS: "BELUM TIBA",
        LAMPIRAN_KABAG: "UPLOAD LAMPIRAN DIPERLUKAN",
        REVIEW_KETUA: "UPLOAD SELESAI",
        TERKIRIM: "TERKIRIM - SELESAI",
        REVISI: "REVISI",
        DIBATALKAN: "DIBATALKAN",
      },
      KEPALA_BAGIAN_UMUM: {
        DRAFT: "BELUM TIBA",
        REVIEW_SEKPENGURUS: "BELUM TIBA",
        LAMPIRAN_KABAG: "UPLOAD LAMPIRAN DIPERLUKAN",
        REVIEW_KETUA: "UPLOAD SELESAI",
        TERKIRIM: "TERKIRIM - SELESAI",
        REVISI: "REVISI",
        DIBATALKAN: "DIBATALKAN",
      },
      KETUA_PENGURUS: {
        DRAFT: "BELUM TIBA",
        REVIEW_SEKPENGURUS: "MENUNGGU GILIRAN",
        LAMPIRAN_KABAG: "MENUNGGU KELENGKAPAN",
        REVIEW_KETUA: "PERLU REVIEW & TTD",
        TERKIRIM: "TTD SELESAI - TERKIRIM",
        REVISI: "REVISI",
        DIBATALKAN: "DIBATALKAN",
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
        DRAFT: ["REVIEW_SEKPENGURUS"],
        REVIEW_SEKPENGURUS: ["LAMPIRAN_KABAG", "REVIEW_KETUA"],
        LAMPIRAN_KABAG: ["REVIEW_KETUA"],
        REVIEW_KETUA: ["TERKIRIM"],
      },
      SEKRETARIS_PENGURUS: {
        REVIEW_SEKPENGURUS: ["LAMPIRAN_KABAG", "REVIEW_KETUA", "REVISI"],
      },
      KETUA_PENGURUS: {
        REVIEW_KETUA: ["TERKIRIM", "REVISI"],
      },
      KEPALA_BAGIAN_PSDM: {
        LAMPIRAN_KABAG: ["REVIEW_KETUA"],
      },
      KEPALA_BAGIAN_KEUANGAN: {
        LAMPIRAN_KABAG: ["REVIEW_KETUA"],
      },
      KEPALA_BAGIAN_UMUM: {
        LAMPIRAN_KABAG: ["REVIEW_KETUA"],
      },
    };

    return transitions[userRole]?.[currentStatus] || [];
  }

  /**
   * Helper: Get position for status
   */
  getPositionForStatus(status) {
    const positions = {
      DRAFT: "Sekretaris Kantor",
      REVIEW_SEKPENGURUS: "Sekretaris Pengurus",
      LAMPIRAN_KABAG: "Kepala Bagian",
      REVIEW_KETUA: "Ketua Yayasan",
      TERKIRIM: "Arsip",
      REVISI: "Revisi",
      DIBATALKAN: "Dibatalkan",
    };

    return positions[status] || "Unknown";
  }
}

module.exports = new SuratKeluarService();
