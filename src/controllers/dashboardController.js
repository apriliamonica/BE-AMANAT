// src/controllers/dashboardController.js
import { ApiResponse } from "../utils/response.js";
import DashboardService from "../services/dashboardService.js";

export class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  // GET /dashboard/stats
  getStats = async (req, res) => {
    try {
      const stats = await this.dashboardService.getStats();
      return ApiResponse.success(res, stats, "Dashboard stats berhasil diambil");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /dashboard/surat-masuk
  getRecentSuratMasuk = async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      const items = await this.dashboardService.getRecentSuratMasuk(
        Number(limit)
      );
      return ApiResponse.success(
        res,
        items,
        "Recent surat masuk berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /dashboard/surat-keluar
  getRecentSuratKeluar = async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      const items = await this.dashboardService.getRecentSuratKeluar(
        Number(limit)
      );
      return ApiResponse.success(
        res,
        items,
        "Recent surat keluar berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /dashboard/disposisi
  getMyDisposisi = async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const userId = req.user.id;
      const items = await this.dashboardService.getDisposisiForUser(
        userId,
        Number(limit)
      );
      return ApiResponse.success(res, items, "Disposisi berhasil diambil");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };
}
