// src/controllers/lampiranController.js
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { deleteFile } = require('../middleware/upload');
const path = require('path');

/**
 * Upload lampiran untuk surat masuk
 */
const uploadLampiranSuratMasuk = async (req, res, next) => {
  try {
    const { suratMasukId } = req.params;
    const { keterangan } = req.body;

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Tidak ada file yang diupload', 400);
    }

    // Check if surat exists
    const surat = await prisma.suratMasuk.findUnique({
      where: { id: suratMasukId }
    });

    if (!surat) {
      // Delete uploaded files
      req.files.forEach(file => deleteFile(file.path));
      return errorResponse(res, 'Surat tidak ditemukan', 404);
    }

    // Create lampiran records
    const lampiran = await Promise.all(
      req.files.map(file => 
        prisma.lampiran.create({
          data: {
            suratMasukId,
            namaFile: file.originalname,
            namaTersimpan: file.filename,
            path: file.path,
            ukuran: file.size,
            mimeType: file.mimetype,
            keterangan
          }
        })
      )
    );

    return successResponse(res, lampiran, 'File berhasil diupload', 201);
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    next(error);
  }
};

/**
 * Upload lampiran untuk surat keluar
 */
const uploadLampiranSuratKeluar = async (req, res, next) => {
  try {
    const { suratKeluarId } = req.params;
    const { keterangan } = req.body;

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Tidak ada file yang diupload', 400);
    }

    const surat = await prisma.suratKeluar.findUnique({
      where: { id: suratKeluarId }
    });

    if (!surat) {
      req.files.forEach(file => deleteFile(file.path));
      return errorResponse(res, 'Surat tidak ditemukan', 404);
    }

    const lampiran = await Promise.all(
      req.files.map(file => 
        prisma.lampiran.create({
          data: {
            suratKeluarId,
            namaFile: file.originalname,
            namaTersimpan: file.filename,
            path: file.path,
            ukuran: file.size,
            mimeType: file.mimetype,
            keterangan
          }
        })
      )
    );

    return successResponse(res, lampiran, 'File berhasil diupload', 201);
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFile(file.path));
    }
    next(error);
  }
};

/**
 * Get lampiran by ID
 */
const getLampiranById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lampiran = await prisma.lampiran.findUnique({
      where: { id }
    });

    if (!lampiran) {
      return errorResponse(res, 'Lampiran tidak ditemukan', 404);
    }

    return successResponse(res, lampiran, 'Lampiran berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Download lampiran
 */
const downloadLampiran = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lampiran = await prisma.lampiran.findUnique({
      where: { id }
    });

    if (!lampiran) {
      return errorResponse(res, 'Lampiran tidak ditemukan', 404);
    }

    // Send file
    res.download(lampiran.path, lampiran.namaFile, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        return errorResponse(res, 'Error saat download file', 500);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete lampiran
 */
const deleteLampiran = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lampiran = await prisma.lampiran.findUnique({
      where: { id }
    });

    if (!lampiran) {
      return errorResponse(res, 'Lampiran tidak ditemukan', 404);
    }

    // Delete file from disk
    deleteFile(lampiran.path);

    // Delete from database
    await prisma.lampiran.delete({ where: { id } });

    return successResponse(res, null, 'Lampiran berhasil dihapus');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all lampiran for surat masuk
 */
const getLampiranSuratMasuk = async (req, res, next) => {
  try {
    const { suratMasukId } = req.params;

    const lampiran = await prisma.lampiran.findMany({
      where: { suratMasukId },
      orderBy: { uploadedAt: 'desc' }
    });

    return successResponse(res, lampiran, 'Lampiran berhasil diambil');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all lampiran for surat keluar
 */
const getLampiranSuratKeluar = async (req, res, next) => {
  try {
    const { suratKeluarId } = req.params;

    const lampiran = await prisma.lampiran.findMany({
      where: { suratKeluarId },
      orderBy: { uploadedAt: 'desc' }
    });

    return successResponse(res, lampiran, 'Lampiran berhasil diambil');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadLampiranSuratMasuk,
  uploadLampiranSuratKeluar,
  getLampiranById,
  downloadLampiran,
  deleteLampiran,
  getLampiranSuratMasuk,
  getLampiranSuratKeluar
};