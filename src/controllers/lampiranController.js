// src/controllers/lampiranController.js
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import LampiranService from "../services/suratLampiranService.js";
import { uploadMultiple } from "../config/cloudinary.js";

export class LampiranController {
  constructor() {
    this.lampiranService = new LampiranService();
  }

  // GET /lampiran/surat-masuk/:suratMasukId
  getBySuratMasuk = async (req, res) => {
    try {
      const { suratMasukId } = req.params;

      const result = await this.lampiranService.getBySuratMasuk(suratMasukId);
      return ApiResponse.success(
        res,
        result,
        "Lampiran surat masuk berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /lampiran/surat-keluar/:suratKeluarId
  getBySuratKeluar = async (req, res) => {
    try {
      const { suratKeluarId } = req.params;

      const result = await this.lampiranService.getBySuratKeluar(suratKeluarId);
      return ApiResponse.success(
        res,
        result,
        "Lampiran surat keluar berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /lampiran/:id
  detail = async (req, res) => {
    try {
      const { id } = req.params;
      const lampiran = await this.lampiranService.getById(id);
      return ApiResponse.success(
        res,
        lampiran,
        "Detail lampiran berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 404
      );
    }
  };

  // POST /lampiran/surat-masuk/:suratMasukId
  uploadSuratMasuk = async (req, res) => {
    try {
      const { suratMasukId } = req.params;
      const { keterangan } = req.body;

      if (!req.file) {
        return ApiResponse.error(res, "File harus diupload", 400);
      }

      const created = await this.lampiranService.createSuratMasuk(
        suratMasukId,
        req.file,
        keterangan
      );

      return ApiResponse.success(
        res,
        created,
        "Lampiran surat masuk berhasil diupload",
        201
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // POST /lampiran/surat-keluar/:suratKeluarId
  uploadSuratKeluar = async (req, res) => {
    try {
      const { suratKeluarId } = req.params;
      const { keterangan } = req.body;

      if (!req.file) {
        return ApiResponse.error(res, "File harus diupload", 400);
      }

      const created = await this.lampiranService.createSuratKeluar(
        suratKeluarId,
        req.file,
        keterangan
      );

      return ApiResponse.success(
        res,
        created,
        "Lampiran surat keluar berhasil diupload",
        201
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // DELETE /lampiran/:id
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.lampiranService.remove(id);
      return ApiResponse.success(res, null, "Lampiran berhasil dihapus");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // PUT /lampiran/:id
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const { keterangan } = req.body;

      const updated = await this.lampiranService.updateKeterangan(
        id,
        keterangan
      );
      return ApiResponse.success(res, updated, "Lampiran berhasil diupdate");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };
}
