// src/controllers/disposisiController.js
import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import DisposisiService from "../services/disposisiService.js";

export class DisposisiController {
  constructor() {
    this.disposisiService = new DisposisiService();
  }

  // GET /disposisi
  list = async (req, res) => {
    try {
      const { page, limit, status, toUserId } = req.query;

      const result = await this.disposisiService.list({
        page,
        limit,
        status,
        toUserId,
      });

      return ApiResponse.success(
        res,
        result,
        "Data disposisi berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 500
      );
    }
  };

  // GET /disposisi/:id
  detail = async (req, res) => {
    try {
      const { id } = req.params;
      const disposisi = await this.disposisiService.getById(id);
      return ApiResponse.success(
        res,
        disposisi,
        "Detail disposisi berhasil diambil"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 404
      );
    }
  };

  // POST /disposisi
  create = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ["toUserId", "instruksi", "jenisDispo"],
        allowed: [
          "suratMasukId",
          "suratKeluarId",
          "toUserId",
          "instruksi",
          "jenisDispo",
          "tahapProses",
          "tenggatWaktu",
        ],
      });

      const created = await this.disposisiService.create(req.body, req.user.id);
      return ApiResponse.success(
        res,
        created,
        "Disposisi berhasil dibuat",
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

  // PUT /disposisi/:id
  update = async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await this.disposisiService.update(id, req.body);
      return ApiResponse.success(res, updated, "Disposisi berhasil diupdate");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // PUT /disposisi/:id/status
  updateStatus = async (req, res) => {
    try {
      await validateRequest(req, {
        required: ["status"],
        allowed: ["status"],
      });

      const { id } = req.params;
      const { status } = req.body;
      const updated = await this.disposisiService.updateStatus(
        id,
        status,
        req.user.id
      );
      return ApiResponse.success(
        res,
        updated,
        "Status disposisi berhasil diupdate"
      );
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // DELETE /disposisi/:id
  delete = async (req, res) => {
    try {
      const { id } = req.params;
      await this.disposisiService.remove(id);
      return ApiResponse.success(res, null, "Disposisi berhasil dihapus");
    } catch (error) {
      return ApiResponse.error(
        res,
        error.message || "Terjadi kesalahan",
        error.statusCode || 400
      );
    }
  };

  // GET /disposisi/user/:userId
  getByUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const { page, limit, status } = req.query;

      const result = await this.disposisiService.getByUser(userId, {
        page,
        limit,
        status,
      });

      return ApiResponse.success(
        res,
        result,
        "Data disposisi user berhasil diambil"
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
