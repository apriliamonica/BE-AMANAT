// src/services/disposisiService.js
import { prisma } from "../config/index.js";

class DisposisiService {
  async list(filters = {}) {
    const { status, toUserId, page = 1, limit = 10 } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (status) where.status = status;
    if (toUserId) where.toUserId = toUserId;

    const [items, total] = await Promise.all([
      prisma.disposisi.findMany({
        where,
        skip,
        take,
        include: {
          fromUser: {
            select: {
              id: true,
              nama_lengkap: true,
              email: true,
              role: true,
            },
          },
          toUser: {
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.disposisi.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getById(id) {
    const disposisi = await prisma.disposisi.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
        suratMasuk: true,
        suratKeluar: true,
      },
    });

    if (!disposisi) {
      const error = new Error("Disposisi tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    return disposisi;
  }

  async create(data, userId) {
    const {
      suratMasukId,
      suratKeluarId,
      toUserId,
      instruksi,
      jenisDispo,
      tahapProses,
      tenggatWaktu,
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

    // Validasi: toUser harus ada
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });
    if (!toUser) {
      const error = new Error("User penerima disposisi tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Validasi jenis disposisi
    const validJenis = ["TRANSFER", "REQUEST_LAMPIRAN", "APPROVAL", "REVISI"];
    if (!validJenis.includes(jenisDispo)) {
      const error = new Error("Jenis disposisi tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const created = await prisma.disposisi.create({
      data: {
        suratMasukId: suratMasukId || null,
        suratKeluarId: suratKeluarId || null,
        fromUserId: userId,
        toUserId,
        instruksi,
        jenisDispo,
        tahapProses: tahapProses || "PENDING",
        status: "PENDING",
        tenggatWaktu: tenggatWaktu ? new Date(tenggatWaktu) : null,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
        toUser: {
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

  async update(id, data) {
    const existing = await prisma.disposisi.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Disposisi tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const { instruksi, jenisDispo, tahapProses, tenggatWaktu } = data;

    const updateData = {};
    if (instruksi) updateData.instruksi = instruksi;
    if (jenisDispo) updateData.jenisDispo = jenisDispo;
    if (tahapProses) updateData.tahapProses = tahapProses;
    if (tenggatWaktu) updateData.tenggatWaktu = new Date(tenggatWaktu);

    const updated = await prisma.disposisi.update({
      where: { id },
      data: updateData,
      include: {
        fromUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updated;
  }

  async updateStatus(id, status, userId) {
    const existing = await prisma.disposisi.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Disposisi tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Validasi: user yang update harus penerima disposisi
    if (existing.toUserId !== userId) {
      const error = new Error(
        "Hanya penerima disposisi yang dapat mengubah status"
      );
      error.statusCode = 403;
      throw error;
    }

    const validStatuses = [
      "PENDING",
      "DITERIMA",
      "DIPROSES",
      "SELESAI",
      "DITOLAK",
    ];
    if (!validStatuses.includes(status)) {
      const error = new Error("Status tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.disposisi.update({
      where: { id },
      data: {
        status,
        selesaiAt: status === "SELESAI" ? new Date() : null,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
        toUser: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id) {
    const existing = await prisma.disposisi.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Disposisi tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Hanya bisa delete jika status PENDING
    if (existing.status !== "PENDING") {
      const error = new Error(
        "Hanya disposisi dengan status PENDING yang dapat dihapus"
      );
      error.statusCode = 400;
      throw error;
    }

    await prisma.disposisi.delete({ where: { id } });
    return true;
  }

  async getByUser(userId, filters = {}) {
    const { status, page = 1, limit = 10 } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = { toUserId: userId };

    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.disposisi.findMany({
        where,
        skip,
        take,
        include: {
          fromUser: {
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.disposisi.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }
}

export default DisposisiService;
