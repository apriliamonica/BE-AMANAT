// src/utils/generateNomor.js
import { prisma } from "../config/index.js";

/**
 * Generate nomor surat otomatis
 * Format untuk Surat Masuk: [NOMOR]/[KODE_BAGIAN]/[TAHUN]
 * Format untuk Surat Keluar: [NOMOR]/UPT-PIK/[TAHUN]
 * Contoh: 001/PSDM/2024 atau 001/UPT-PIK/2024
 */

export const generateNomorSuratMasuk = async (kodeBagian = "UMUM") => {
  try {
    const currentYear = new Date().getFullYear();
    const lastSurat = await prisma.suratMasuk.findMany({
      where: {
        tanggalDiterima: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
      orderBy: { nomorSurat: "desc" },
      take: 1,
    });

    let nextNumber = 1;
    if (lastSurat.length > 0) {
      const lastNomor = lastSurat[0].nomorSurat;
      const nomorArray = lastNomor.split("/");
      nextNumber = parseInt(nomorArray[0]) + 1;
    }

    const nomorSurat = `${String(nextNumber).padStart(
      3,
      "0"
    )}/${kodeBagian}/${currentYear}`;
    return nomorSurat;
  } catch (error) {
    console.error("Error generating nomor surat masuk:", error);
    // Return fallback nomor
    return `${Date.now()}`;
  }
};

export const generateNomorSuratKeluar = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const lastSurat = await prisma.suratKeluar.findMany({
      where: {
        tanggalSurat: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
      orderBy: { nomorSurat: "desc" },
      take: 1,
    });

    let nextNumber = 1;
    if (lastSurat.length > 0) {
      const lastNomor = lastSurat[0].nomorSurat;
      const nomorArray = lastNomor.split("/");
      nextNumber = parseInt(nomorArray[0]) + 1;
    }

    const nomorSurat = `${String(nextNumber).padStart(
      3,
      "0"
    )}/UPT-PIK/${currentYear}`;
    return nomorSurat;
  } catch (error) {
    console.error("Error generating nomor surat keluar:", error);
    // Return fallback nomor
    return `${Date.now()}`;
  }
};

/**
 * Generate nomor agenda (optional, untuk tracking)
 * Format: [TAHUN][BULAN][NOMOR]
 * Contoh: 20240001
 */
export const generateNomorAgenda = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const nomorAgenda = `${year}${month}${String(Math.random())
      .slice(2, 6)
      .padStart(4, "0")}`;
    return nomorAgenda;
  } catch (error) {
    console.error("Error generating nomor agenda:", error);
    return `${Date.now()}`;
  }
};

/**
 * Validasi format nomor surat
 */
export const validateNomorSurat = (nomor, tipe = "masuk") => {
  try {
    // Format regex: XXX/KODE-BAGIAN/TAHUN
    const regex = /^\d{3}\/[A-Z0-9\-]+\/\d{4}$/;
    return regex.test(nomor);
  } catch (error) {
    return false;
  }
};

// src/utils/errorHandler.js
/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource tidak ditemukan") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}
