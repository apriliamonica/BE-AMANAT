// src/controllers/trackingController.js
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import TrackingService from "../services/trackingService.js";

export class TrackingController {
  constructor() {
    this.trackingService = new TrackingService();
  }

  // GET /tracking/surat-masuk/:suratMasukId
  getBySuratMasuk = async (req, res) => {
    try {
      const { suratMasukId } = req.params;

      const result = await this.trackingService.getBySuratMasuk(suratMasukId);
      return ApiResponse.success(
        res,
        result,
        "Tracking surat masuk berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /tracking/surat-keluar/:suratKeluarId
  getBySuratKeluar = async (req, res) => {
    try {
      const { suratKeluarId } = req.params;

      const result = await this.trackingService.getBySuratKeluar(suratKeluarId);
      return ApiResponse.success(
        res,
        result,
        "Tracking surat keluar berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /tracking/:id
  detail = async (req, res) => {
    try {
      const { id } = req.params;
      const tracking = await this.trackingService.getById(id);
      return ApiResponse.success(
        res,
        tracking,
        "Detail tracking berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 404
      );
    }
  };

  // POST /tracking
  create = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ["tahapProses", "posisiSaat", "aksiDilakukan"],
        allowed: [
          "suratMasukId",
          "suratKeluarId",
          "tahapProses",
          "posisiSaat",
          "aksiDilakukan",
          "statusTracking",
        ],
      });

      const created = await this.trackingService.create(req.body, req.user.id);
      return ApiResponse.success(res, created, "Tracking berhasil dibuat", 201);
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // GET /tracking/stats/by-tahap/:tahapProses
  getStatsByTahap = async (req, res) => {
    try {
      const { tahapProses } = req.params;

      const stats = await this.trackingService.getStatsByTahap(tahapProses);
      return ApiResponse.success(res, stats, "Stats tracking berhasil diambil");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };
}
