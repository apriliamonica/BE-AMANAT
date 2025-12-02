// src/controllers/suratKeluarController.js
const prisma = require("../config/database");
const {
  successResponse,
  errorResponse,
  paginationResponse,
} = require("../utils/response");

/**
 * Get all surat keluar with pagination and filters
 */
const getAllSuratKeluar = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      prioritas,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { nomorSurat: { contains: search, mode: "insensitive" } },
          { perihal: { contains: search, mode: "insensitive" } },
          { tujuanSurat: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
      ...(prioritas && { prioritas }),
      ...(startDate &&
        endDate && {
          tanggalSurat: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const total = await prisma.suratKeluar.count({ where });

    const data = await prisma.suratKeluar.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        lampiran: {
          select: {
            id: true,
            namaFile: true,
            ukuran: true,
            mimeType: true,
          },
        },
        _count: {
          select: {
            tracking: true,
          },
        },
      },
    });

    return paginationResponse(
      res,
      data,
      { page: parseInt(page), limit: parseInt(limit), total },
      "Data surat keluar berhasil diambil"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get surat keluar by ID
 */
const getSuratKeluarById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const surat = await prisma.suratKeluar.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
            bagian: true,
          },
        },
        lampiran: true,
        tracking: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!surat) {
      return errorResponse(res, "Surat tidak ditemukan", 404);
    }

    return successResponse(res, surat, "Detail surat berhasil diambil");
  } catch (error) {
    next(error);
  }
};

/**
 * Create new surat keluar
 */
const createSuratKeluar = async (req, res, next) => {
  try {
    const {
      nomorSurat,
      tanggalSurat,
      tanggalDikirim,
      tujuanSurat,
      alamatTujuan,
      kontakTujuan,
      emailTujuan,
      perihal,
      isiSurat,
      jenisSurat,
      prioritas,
      tembusan,
      catatan,
    } = req.body;

    // // Generate nomor agenda
    // const lastSurat = await prisma.suratKeluar.findFirst({
    //   orderBy: { nomorAgenda: "desc" },
    // });

    // let nomorAgenda;
    // if (lastSurat && isCurrentMonth(lastSurat.nomorAgenda)) {
    //   const lastNumber = extractNumber(lastSurat.nomorAgenda);
    //   nomorAgenda = generateNomorAgenda("SK", lastNumber);
    // } else {
    //   nomorAgenda = generateNomorAgenda("SK", 0);
    // }

    // Determine status based on tanggalDikirim
    const status = tanggalDikirim ? "TERKIRIM" : "DRAFT";

    // Create surat keluar
    const surat = await prisma.suratKeluar.create({
      data: {
        nomorSurat,
        tanggalSurat: new Date(tanggalSurat),
        tanggalDikirim: tanggalDikirim ? new Date(tanggalDikirim) : null,
        tujuanSurat,
        perihal,
        isiSurat,
        jenisSurat,
        status,
        catatan,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Create tracking
    await prisma.trackingSurat.create({
      data: {
        suratKeluarId: surat.id,
        status: status === "DRAFT" ? "Draft Dibuat" : "Surat Terkirim",
        keterangan:
          status === "DRAFT"
            ? "Surat keluar dibuat sebagai draft"
            : "Surat keluar telah dikirim",
        createdById: req.user.id,
      },
    });

    return successResponse(res, surat, "Surat keluar berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update surat keluar
 */
const updateSuratKeluar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nomorSurat,
      tanggalSurat,
      tanggalDikirim,
      tujuanSurat,
      alamatTujuan,
      kontakTujuan,
      emailTujuan,
      perihal,
      isiSurat,
      jenisSurat,
      status,
      catatan,
    } = req.body;

    const existing = await prisma.suratKeluar.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, "Surat tidak ditemukan", 404);
    }

    const surat = await prisma.suratKeluar.update({
      where: { id },
      data: {
        nomorSurat,
        tanggalSurat: tanggalSurat ? new Date(tanggalSurat) : undefined,
        tanggalDikirim: tanggalDikirim ? new Date(tanggalDikirim) : undefined,
        tujuanSurat,
        perihal,
        isiSurat,
        jenisSurat,
        prioritas,
        status,
        catatan,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Create tracking if status changed
    if (status && status !== existing.status) {
      await prisma.trackingSurat.create({
        data: {
          suratKeluarId: id,
          status: `Status diubah menjadi ${status}`,
          keterangan: `Status surat diubah dari ${existing.status} menjadi ${status}`,
          createdById: req.user.id,
        },
      });
    }

    return successResponse(res, surat, "Surat keluar berhasil diupdate");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete surat keluar
 */
const deleteSuratKeluar = async (req, res, next) => {
  try {
    const { id } = req.params;

    const surat = await prisma.suratKeluar.findUnique({
      where: { id },
      include: { lampiran: true },
    });

    if (!surat) {
      return errorResponse(res, "Surat tidak ditemukan", 404);
    }

    // Delete files
    const { deleteFile } = require("../middleware/upload");
    surat.lampiran.forEach((file) => {
      deleteFile(file.path);
    });

    await prisma.suratKeluar.delete({ where: { id } });

    return successResponse(res, null, "Surat keluar berhasil dihapus");
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const total = await prisma.suratKeluar.count();
    const draft = await prisma.suratKeluar.count({
      where: { status: "DRAFT" },
    });
    const terkirim = await prisma.suratKeluar.count({
      where: { status: "TERKIRIM" },
    });

    const stats = {
      total,
      draft,
      terkirim,
      byPrioritas: await prisma.suratKeluar.groupBy({
        by: ["prioritas"],
        _count: true,
      }),
      byJenis: await prisma.suratKeluar.groupBy({
        by: ["jenisSurat"],
        _count: true,
      }),
    };

    return successResponse(res, stats, "Statistik berhasil diambil");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuratKeluar,
  getSuratKeluarById,
  createSuratKeluar,
  updateSuratKeluar,
  deleteSuratKeluar,
  getStatistics,
};
