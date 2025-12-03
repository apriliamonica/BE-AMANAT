// src/services/suratLampiranService.js
import { prisma } from "../config/index.js";
import cloudinary from "../config/cloudinary.js";

class LampiranService {
  async getBySuratMasuk(suratMasukId) {
    // Validasi surat masuk ada
    const surat = await prisma.suratMasuk.findUnique({
      where: { id: suratMasukId },
    });

    if (!surat) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const lampiran = await prisma.lampiran.findMany({
      where: { suratMasukId },
      orderBy: { uploadedAt: "desc" },
    });

    return lampiran;
  }

  async getBySuratKeluar(suratKeluarId) {
    // Validasi surat keluar ada
    const surat = await prisma.suratKeluar.findUnique({
      where: { id: suratKeluarId },
    });

    if (!surat) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const lampiran = await prisma.lampiran.findMany({
      where: { suratKeluarId },
      orderBy: { uploadedAt: "desc" },
    });

    return lampiran;
  }

  async getById(id) {
    const lampiran = await prisma.lampiran.findUnique({
      where: { id },
    });

    if (!lampiran) {
      const error = new Error("Lampiran tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    return lampiran;
  }

  async createSuratMasuk(suratMasukId, file, keterangan) {
    // Validasi surat masuk ada
    const surat = await prisma.suratMasuk.findUnique({
      where: { id: suratMasukId },
    });

    if (!surat) {
      const error = new Error("Surat masuk tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // File info dari multer cloudinary
    const { filename, size, mimetype, path } = file;

    const created = await prisma.lampiran.create({
      data: {
        suratMasukId,
        namaFile: file.originalname,
        namaTersimpan: filename,
        path: file.path || path,
        ukuran: size,
        mimeType: mimetype,
        keterangan: keterangan || null,
      },
    });

    return created;
  }

  async createSuratKeluar(suratKeluarId, file, keterangan) {
    // Validasi surat keluar ada
    const surat = await prisma.suratKeluar.findUnique({
      where: { id: suratKeluarId },
    });

    if (!surat) {
      const error = new Error("Surat keluar tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // File info dari multer cloudinary
    const { filename, size, mimetype, path } = file;

    const created = await prisma.lampiran.create({
      data: {
        suratKeluarId,
        namaFile: file.originalname,
        namaTersimpan: filename,
        path: file.path || path,
        ukuran: size,
        mimeType: mimetype,
        keterangan: keterangan || null,
      },
    });

    return created;
  }

  async updateKeterangan(id, keterangan) {
    const existing = await prisma.lampiran.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Lampiran tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.lampiran.update({
      where: { id },
      data: { keterangan: keterangan || null },
    });

    return updated;
  }

  async remove(id) {
    const existing = await prisma.lampiran.findUnique({ where: { id } });

    if (!existing) {
      const error = new Error("Lampiran tidak ditemukan");
      error.statusCode = 404;
      throw error;
    }

    // Delete file dari cloudinary
    try {
      if (existing.namaTersimpan) {
        const publicId = `upt-pik/documents/${existing.namaTersimpan
          .split(".")
          .slice(0, -1)
          .join(".")}`;
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }
    } catch (error) {
      console.error("Error deleting file from cloudinary:", error);
      // Lanjutkan meski gagal delete dari cloudinary
    }

    await prisma.lampiran.delete({ where: { id } });
    return true;
  }
}

export default LampiranService;
