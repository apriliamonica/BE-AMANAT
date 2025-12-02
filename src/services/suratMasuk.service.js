import { prisma } from '../config/index.js';

class SuratMasukService {
  async list(filters = {}) {
    const { status, kategori, prioritas, page = 1, limit = 10, search } = filters;

    const take = Number(limit) || 10;
    const skip = (Number(page) - 1) * take;

    const where = {};

    if (status) where.status = status;
    if (kategori) where.kategori = kategori;
    if (prioritas) where.prioritas = prioritas;

    if (search) {
      where.OR = [
        { nomorSurat: { contains: search, mode: 'insensitive' } },
        { nomorAgenda: { contains: search, mode: 'insensitive' } },
        { perihal: { contains: search, mode: 'insensitive' } },
        { asalSurat: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.suratMasuk.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.suratMasuk.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: take };
  }

  async getById(id) {
    const surat = await prisma.suratMasuk.findUnique({ where: { id } });

    if (!surat) {
      const error = new Error('Surat masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return surat;
  }

  async create(data, userId) {
    const {
      nomorSurat,
      tanggalTerima,
      asalSurat,
      perihal,
      kategori,
      prioritas,
      namaPengirim,
      kontakPengirim,
      catatan,
    } = data;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `SM-${year}${month}-`;

    const last = await prisma.suratMasuk.findFirst({
      where: { nomorAgenda: { startsWith: prefix } },
      orderBy: { nomorAgenda: 'desc' },
    });

    let nextNumber = 1;
    if (last) {
      const lastNumber = parseInt(last.nomorAgenda.split('-')[2], 10);
      if (!Number.isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const nomorAgenda = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    const created = await prisma.suratMasuk.create({
      data: {
        nomorAgenda,
        nomorSurat,
        tanggalSurat: new Date(tanggalTerima),
        tanggalDiterima: new Date(tanggalTerima),
        asalSurat,
        perihal,
        kategori,
        prioritas,
        status: 'DITERIMA',
        namaPengirim: namaPengirim || null,
        kontakPengirim: kontakPengirim || null,
        catatan: catatan || null,
        createdById: userId,
      },
    });

    return created;
  }

  async update(id, data) {
    const existing = await prisma.suratMasuk.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error('Surat masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const {
      nomorSurat,
      tanggalTerima,
      asalSurat,
      perihal,
      kategori,
      prioritas,
      status,
      namaPengirim,
      kontakPengirim,
      catatan,
    } = data;

    const updated = await prisma.suratMasuk.update({
      where: { id },
      data: {
        nomorSurat: nomorSurat ?? existing.nomorSurat,
        tanggalSurat: tanggalTerima ? new Date(tanggalTerima) : existing.tanggalSurat,
        tanggalDiterima: tanggalTerima ? new Date(tanggalTerima) : existing.tanggalDiterima,
        asalSurat: asalSurat ?? existing.asalSurat,
        perihal: perihal ?? existing.perihal,
        kategori: kategori ?? existing.kategori,
        prioritas: prioritas ?? existing.prioritas,
        status: status ?? existing.status,
        namaPengirim: namaPengirim ?? existing.namaPengirim,
        kontakPengirim: kontakPengirim ?? existing.kontakPengirim,
        catatan: catatan ?? existing.catatan,
      },
    });

    return updated;
  }

  async remove(id) {
    const existing = await prisma.suratMasuk.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error('Surat masuk tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    await prisma.suratMasuk.delete({ where: { id } });
    return true;
  }
}

export default SuratMasukService;


