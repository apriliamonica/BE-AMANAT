// src/controllers/suratMasukController.js (IMPROVED)
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import SuratMasukService from "../services/suratMasuk.service.js";

export class SuratMasukController {
  constructor() {
    this.suratMasukService = new SuratMasukService();
  }

  // GET /surat-masuk
  list = async (req, res) => {
    try {
      const { page, limit, search, status, kategori } = req.query;

      const result = await this.suratMasukService.list({
        page,
        limit,
        search,
        status,
        kategori,
      });

      return ApiResponse.success(
        res,
        result,
        "Data surat masuk berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /surat-masuk/:id
  detail = async (req, res) => {
    try {
      const { id } = req.params;
      const surat = await this.suratMasukService.getById(id);
      return ApiResponse.success(
        res,
        surat,
        "Detail surat masuk berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 404
      );
    }
  };

  // POST /surat-masuk
  create = async (req, res) => {
    try {
      // Validasi awal (file validation handled by multer)
      // Note: With FormData, integers might come as strings, let Prisma/Service handle type conversion or do it here if needed.
      
      const fileUrl = req.file ? req.file.path : null;

      const suratData = {
        ...req.body,
        fileSurat: fileUrl, // Add file URL to data
      };

      await validateRequest({ body: suratData }, { // Validate the constructed data object
        required: [
          "nomorSurat",
          "tanggalSurat",
          "tanggalDiterima",
          "asalSurat",
          "perihal",
          "kategori",
        ],
        allowed: [
          "nomorSurat",
          "tanggalSurat",
          "tanggalDiterima",
          "asalSurat",
          "perihal",
          "kategori",
          "namaPengirim",
          "status",
          "fileSurat", // Allow fileSurat
        ],
      });

      const created = await this.suratMasukService.create(
        suratData,
        req.user.id
      );
      return ApiResponse.success(
        res,
        created,
        "Surat masuk berhasil dibuat",
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

  // PUT /surat-masuk/:id
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await this.suratMasukService.update(
        id,
        req.body,
        req.user.id
      );
      return ApiResponse.success(res, updated, "Surat masuk berhasil diupdate");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // PUT /surat-masuk/:id/status
  updateStatus = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ["status"],
        allowed: ["status"],
      });

      const { id } = req.params;
      const { status } = req.body;
      const updated = await this.suratMasukService.updateStatus(
        id,
        status,
        req.user.id
      );
      return ApiResponse.success(
        res,
        updated,
        "Status surat masuk berhasil diupdate"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // DELETE /surat-masuk/:id
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.suratMasukService.remove(id);
      return ApiResponse.success(res, null, "Surat masuk berhasil dihapus");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // GET /surat-masuk/by-status/:status
  getByStatus = async (req, res) => {
    try {
      const { status } = req.params;
      const { page, limit } = req.query;

      const result = await this.suratMasukService.getByStatus(status, {
        page,
        limit,
      });

      return ApiResponse.success(
        res,
        result,
        `Data surat masuk dengan status ${status} berhasil diambil`
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /surat-masuk/pending
  getPending = async (req, res) => {
    try {
      const { page, limit } = req.query;

      const result = await this.suratMasukService.getPending({
        page,
        limit,
      });

      return ApiResponse.success(
        res,
        result,
        "Data surat masuk pending berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /surat-masuk/stats
  getStats = async (req, res) => {
    try {
      const result = await this.suratMasukService.getStats();

      return ApiResponse.success(
        res,
        result,
        "Data statistik surat masuk berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };
}
