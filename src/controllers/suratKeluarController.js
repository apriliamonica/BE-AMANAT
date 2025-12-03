// src/controllers/suratKeluarController.js
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import SuratKeluarService from "../services/suratKeluarService.js";

export class SuratKeluarController {
  constructor() {
    this.suratKeluarService = new SuratKeluarService();
  }

  // GET /surat-keluar
  list = async (req, res) => {
    try {
      const { page, limit, search, status, kategori } = req.query;

      const result = await this.suratKeluarService.list({
        page,
        limit,
        search,
        status,
        kategori,
      });

      return ApiResponse.success(
        res,
        result,
        "Data surat keluar berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /surat-keluar/:id
  detail = async (req, res) => {
    try {
      const { id } = req.params;
      const surat = await this.suratKeluarService.getById(id);
      return ApiResponse.success(
        res,
        surat,
        "Detail surat keluar berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 404
      );
    }
  };

  // POST /surat-keluar
  create = async (req, res) => {
    try {
      await validateRequest(req, {
        required: [
          "nomorSurat",
          "tanggalSurat",
          "tujuanSurat",
          "perihal",
          "kategori",
        ],
        allowed: [
          "nomorSurat",
          "tanggalSurat",
          "tujuanSurat",
          "perihal",
          "kategori",
          "catatan",
          "status",
        ],
      });

      const created = await this.suratKeluarService.create(
        req.body,
        req.user.id
      );
      return ApiResponse.success(
        res,
        created,
        "Surat keluar berhasil dibuat",
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

  // PUT /surat-keluar/:id
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await this.suratKeluarService.update(id, req.body);
      return ApiResponse.success(
        res,
        updated,
        "Surat keluar berhasil diupdate"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // PUT /surat-keluar/:id/status
  updateStatus = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ["status"],
        allowed: ["status"],
      });

      const { id } = req.params;
      const { status } = req.body;
      const updated = await this.suratKeluarService.updateStatus(id, status);
      return ApiResponse.success(
        res,
        updated,
        "Status surat keluar berhasil diupdate"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // DELETE /surat-keluar/:id
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.suratKeluarService.remove(id);
      return ApiResponse.success(res, null, "Surat keluar berhasil dihapus");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };
}
