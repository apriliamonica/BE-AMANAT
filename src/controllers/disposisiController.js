// src/controllers/disposisiController.js
const prisma = require('../config/database');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');

/**
 * Get all disposisi (with filters)
 */
const getAllDisposisi = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      toUserId,
      fromUserId,
      suratMasukId 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(toUserId && { toUserId }),
      ...(fromUserId && { fromUserId }),
      ...(suratMasukId && { suratMasukId })
    };

    const total = await prisma.disposisi.count({ where });

    const data = await prisma.disposisi.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: { id: true, name: true, role: true, bagian: true }
        },
        toUser: {
          select: { id: true, name: true, role: true, bagian: true }
        },
        suratMasuk: {
          select: {
            id: true,
            nomorAgenda: true,
            nomorSurat: true,
            perihal: true,
            asalSurat: true
          }
        }
      }
    });

    return paginationResponse(
      res,
      data,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Data disposisi berhasil diambil'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get disposisi by ID
 */
const getDisposisiById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disposisi = await prisma.disposisi.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: { id: true, name: true, role: true, bagian: true }
        },
        toUser: {
          select: { id: true, name: true, role: true, bagian: true }
        },
        suratMasuk: {
          include: {
            createdBy: {
              select: { id: true, name: true }
            },
            lampiran: true
          }
        }
      }
    });

    if (!disposisi) {
      return errorResponse(res, 'Disposisi tidak ditemukan', 404);
    }

    return successResponse(res, disposisi, 'Detail disposisi berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Get disposisi untuk user yang login (inbox)
 */
const getMyDisposisi = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      toUserId: req.user.id,
      ...(status && { status })
    };

    const total = await prisma.disposisi.count({ where });

    const data = await prisma.disposisi.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: {
          select: { id: true, name: true, role: true, bagian: true }
        },
        suratMasuk: {
          select: {
            id: true,
            nomorAgenda: true,
            nomorSurat: true,
            perihal: true,
            asalSurat: true,
            prioritas: true
          }
        }
      }
    });

    return paginationResponse(
      res,
      data,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Disposisi Anda berhasil diambil'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new disposisi
 */
const createDisposisi = async (req, res, next) => {
  try {
    const {
      suratMasukId,
      toUserId,
      instruksi,
      catatan,
      tenggatWaktu,
      prioritas
    } = req.body;

    // Check if surat exists
    const surat = await prisma.suratMasuk.findUnique({
      where: { id: suratMasukId }
    });

    if (!surat) {
      return errorResponse(res, 'Surat tidak ditemukan', 404);
    }

    // Check if toUser exists
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId }
    });

    if (!toUser) {
      return errorResponse(res, 'User tujuan tidak ditemukan', 404);
    }

    // Create disposisi
    const disposisi = await prisma.disposisi.create({
      data: {
        suratMasukId,
        fromUserId: req.user.id,
        toUserId,
        instruksi,
        catatan,
        tenggatWaktu: tenggatWaktu ? new Date(tenggatWaktu) : null,
        prioritas: prioritas || 'BIASA'
      },
      include: {
        fromUser: {
          select: { id: true, name: true, role: true }
        },
        toUser: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    // Update surat status
    await prisma.suratMasuk.update({
      where: { id: suratMasukId },
      data: { status: 'SUDAH_DISPOSISI' }
    });

    // Create tracking
    await prisma.trackingSurat.create({
      data: {
        suratMasukId,
        status: 'Disposisi',
        keterangan: `Surat didisposisikan kepada ${toUser.name} - ${instruksi}`,
        createdById: req.user.id
      }
    });

    return successResponse(res, disposisi, 'Disposisi berhasil dibuat', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update disposisi status
 */
const updateDisposisi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, catatan } = req.body;

    const existing = await prisma.disposisi.findUnique({
      where: { id },
      include: { suratMasuk: true }
    });

    if (!existing) {
      return errorResponse(res, 'Disposisi tidak ditemukan', 404);
    }

    // Only toUser can update the disposisi
    if (existing.toUserId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk mengubah disposisi ini', 403);
    }

    const disposisi = await prisma.disposisi.update({
      where: { id },
      data: {
        status,
        catatan,
        selesaiAt: status === 'SELESAI' ? new Date() : undefined
      },
      include: {
        fromUser: {
          select: { id: true, name: true }
        },
        toUser: {
          select: { id: true, name: true }
        }
      }
    });

    // Create tracking
    await prisma.trackingSurat.create({
      data: {
        suratMasukId: existing.suratMasukId,
        status: `Disposisi ${status}`,
        keterangan: catatan || `Status disposisi diubah menjadi ${status}`,
        createdById: req.user.id
      }
    });

    return successResponse(res, disposisi, 'Disposisi berhasil diupdate');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete disposisi
 */
const deleteDisposisi = async (req, res, next) => {
  try {
    const { id } = req.params;

    const disposisi = await prisma.disposisi.findUnique({ where: { id } });

    if (!disposisi) {
      return errorResponse(res, 'Disposisi tidak ditemukan', 404);
    }

    // Only fromUser (creator) can delete
    if (disposisi.fromUserId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki akses untuk menghapus disposisi ini', 403);
    }

    await prisma.disposisi.delete({ where: { id } });

    return successResponse(res, null, 'Disposisi berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

/**
 * Get disposisi statistics
 */
const getStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sent = await prisma.disposisi.count({
      where: { fromUserId: userId }
    });

    const received = await prisma.disposisi.count({
      where: { toUserId: userId }
    });

    const pending = await prisma.disposisi.count({
      where: { toUserId: userId, status: 'PENDING' }
    });

    const selesai = await prisma.disposisi.count({
      where: { toUserId: userId, status: 'SELESAI' }
    });

    return successResponse(res, { sent, received, pending, selesai }, 'Statistik disposisi berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDisposisi,
  getDisposisiById,
  getMyDisposisi,
  createDisposisi,
  updateDisposisi,
  deleteDisposisi,
  getStatistics
};