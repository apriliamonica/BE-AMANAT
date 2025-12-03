import { prisma } from "../config/index.js";

class SuratMasukService {
  async list(filters = {}) {
    const {
      status,
      kategori,
      prioritas,
      page = 1,
      limit = 10,
      search,
    } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (status) where.status = status;
    if (kategori) where.kategori = kategori;
    if (prioritas) where.prioritas = prioritas;

    if (search) {
      where.OR = [
        { nomorSurat: { contains: search, mode: "insensitive" } },
        { nomorAgenda: { contains: search, mode: "insensitive" } },
        { perihal: { contains: search, mode: "insensitive" } },
        { asalSurat: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.suratMasuk.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.suratMasuk.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getById(id) {
    const surat = await prisma.suratMasuk.findUnique({ where: { id } });

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

    // Validasi nomor surat tidak duplikat
    const existingNomor = await prisma.suratMasuk.findFirst({
      where: { nomorSurat },
    });
    if (existingNomor) {
      const error = new Error("Nomor surat sudah digunakan");
      error.statusCode = 400;
      throw error;
    }

    const created = await prisma.suratMasuk.create({
      data: {
        nomorSurat,
        tanggalSurat: new Date(tanggalSurat),
        tanggalDiterima: new Date(tanggalDiterima),
        asalSurat,
        perihal,
        kategori,
        status: "DITERIMA",
        namaPengirim,
        createdById: userId,
      },
    });

    return created;
  }

  async update(id, data) {
    const existing = await prisma.suratMasuk.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const { status } = data;

    const updated = await prisma.suratMasuk.update({
      where: { id },
      data: {
        status,
      },
    });

    return updated;
  }

  async remove(id) {
    const existing = await prisma.suratMasuk.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    await prisma.suratMasuk.delete({ where: { id } });
    return true;
  }
}

export default SuratMasukService;
