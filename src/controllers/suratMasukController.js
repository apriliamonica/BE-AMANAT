// src/controllers/suratMasukController.js
const prisma = require('../config/database');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');
const { generateNomorAgenda, isCurrentMonth, extractNumber } = require('../utils/generateNomor');

/**
 * Get all surat masuk with pagination and filters
 */
const getAllSuratMasuk = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      prioritas,
      startDate,
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      ...(search && {
        OR: [
          { nomorSurat: { contains: search, mode: 'insensitive' } },
          { nomorAgenda: { contains: search, mode: 'insensitive' } },
          { perihal: { contains: search, mode: 'insensitive' } },
          { asalSurat: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status && { status }),
      ...(prioritas && { prioritas }),
      ...(startDate && endDate && {
        tanggalDiterima: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    // Get total count
    const total = await prisma.suratMasuk.count({ where });

    // Get data
    const data = await prisma.suratMasuk.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        lampiran: {
          select: {
            id: true,
            namaFile: true,
            ukuran: true,
            mimeType: true
          }
        },
        _count: {
          select: {
            disposisi: true,
            tracking: true
          }
        }
      }
    });

    return paginationResponse(
      res,
      data,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Data surat masuk berhasil diambil'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get surat masuk by ID
 */
const getSuratMasukById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const surat = await prisma.suratMasuk.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
            bagian: true
          }
        },
        lampiran: true,
        disposisi: {
          include: {
            fromUser: {
              select: { id: true, name: true, role: true }
            },
            toUser: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        tracking: {
          include: {
            createdBy: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!surat) {
      return errorResponse(res, 'Surat tidak ditemukan', 404);
    }

    return successResponse(res, surat, 'Detail surat berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Create new surat masuk
 */
const createSuratMasuk = async (req, res, next) => {
  try {
    const {
      nomorSurat,
      tanggalSurat,
      asalSurat,
      namaPengirim,
      kontakPengirim,
      perihal,
      jenisSurat,
      prioritas,
      catatan
    } = req.body;

    // Generate nomor agenda
    const lastSurat = await prisma.suratMasuk.findFirst({
      orderBy: { nomorAgenda: 'desc' }
    });

    let nomorAgenda;
    if (lastSurat && isCurrentMonth(lastSurat.nomorAgenda)) {
      const lastNumber = extractNumber(lastSurat.nomorAgenda);
      nomorAgenda = generateNomorAgenda('SM', lastNumber);
    } else {
      nomorAgenda = generateNomorAgenda('SM', 0);
    }

    // Create surat masuk
    const surat = await prisma.suratMasuk.create({
      data: {
        nomorAgenda,
        nomorSurat,
        tanggalSurat: new Date(tanggalSurat),
        asalSurat,
        namaPengirim,
        kontakPengirim,
        perihal,
        jenisSurat,
        prioritas: prioritas || 'BIASA',
        catatan,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Create tracking
    await prisma.trackingSurat.create({
      data: {
        suratMasukId: surat.id,
        status: 'Surat Diterima',
        keterangan: 'Surat masuk diterima dan diregistrasi',
        createdById: req.user.id
      }
    });

    return successResponse(res, surat, 'Surat masuk berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update surat masuk
 */
const updateSuratMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nomorSurat,
      tanggalSurat,
      asalSurat,
      namaPengirim,
      kontakPengirim,
      perihal,
      jenisSurat,
      prioritas,
      status,
      catatan
    } = req.body;

    // Check if exists
    const existing = await prisma.suratMasuk.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Surat tidak ditemukan', 404);
    }

    // Update
    const surat = await prisma.suratMasuk.update({
      where: { id },
      data: {
        nomorSurat,
        tanggalSurat: tanggalSurat ? new Date(tanggalSurat) : undefined,
        asalSurat,
        namaPengirim,
        kontakPengirim,
        perihal,
        jenisSurat,
        prioritas,
        status,
        catatan
      },
      include: {
        createdBy: {
          select: { id: true, name: true }
        }
      }
    });

    // Create tracking if status changed
    if (status && status !== existing.status) {
      await prisma.trackingSurat.create({
        data: {
          suratMasukId: id,
          status: `Status diubah menjadi ${status}`,
          keterangan: `Status surat diubah dari ${existing.status} menjadi ${status}`,
          createdById: req.user.id
        }
      });
    }

    return successResponse(res, surat, 'Surat masuk berhasil diupdate');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete surat masuk
 */
const deleteSuratMasuk = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if exists
    const surat = await prisma.suratMasuk.findUnique({ 
      where: { id },
      include: { lampiran: true }
    });

    if (!surat) {
      return errorResponse(res, 'Surat tidak ditemukan', 404);
    }

    // Delete files
    const { deleteFile } = require('../middleware/upload');
    surat.lampiran.forEach(file => {
      deleteFile(file.path);
    });

    // Delete surat (cascade will delete lampiran, disposisi, tracking)
    await prisma.suratMasuk.delete({ where: { id } });

    return successResponse(res, null, 'Surat masuk berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const total = await prisma.suratMasuk.count();
    const belumDiproses = await prisma.suratMasuk.count({ 
      where: { status: 'BELUM_DIPROSES' } 
    });
    const sedangDiproses = await prisma.suratMasuk.count({ 
      where: { status: 'SEDANG_DIPROSES' } 
    });
    const selesai = await prisma.suratMasuk.count({ 
      where: { status: 'SELESAI' } 
    });

    const stats = {
      total,
      belumDiproses,
      sedangDiproses,
      selesai,
      byPrioritas: await prisma.suratMasuk.groupBy({
        by: ['prioritas'],
        _count: true
      }),
      byJenis: await prisma.suratMasuk.groupBy({
        by: ['jenisSurat'],
        _count: true
      })
    };

    return successResponse(res, stats, 'Statistik berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuratMasuk,
  getSuratMasukById,
  createSuratMasuk,
  updateSuratMasuk,
  deleteSuratMasuk,
  getStatistics
};