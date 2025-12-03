import { ApiResponse } from "../utils/response.js";
import { validateRequest } from "../utils/validators.js";
import SuratMasukService from "../services/suratMasukService.js";

export class SuratMasukController {
  constructor() {
    this.suratMasukService = new SuratMasukService();
  }

  // GET /surat-masuk
  list = async (req, res) => {
    try {
      const { page, limit, search, status, kategori, prioritas } = req.query;

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
      await validateRequest(req, {
        required: [
          "nomorSurat",
          "tanggalSurat",
          "tanggalDiterima",
          "asalSurat",
          "perihal",
          "kategori",
          "namaPengirim",
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
        ],
      });

      const created = await this.suratMasukService.create(
        req.body,
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
      const updated = await this.suratMasukService.update(id, req.body);
      return ApiResponse.success(res, updated, "Surat masuk berhasil diupdate");
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
}
