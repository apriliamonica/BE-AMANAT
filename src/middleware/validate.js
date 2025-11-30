// src/middleware/validate.js
import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.js";

/**
 * Validation Middleware - Handle validation errors
 * Usage: router.post('/endpoint', validateRequest, controller)
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, "Validasi gagal", errors.array());
  }
  next();
};

/**
 * Validasi Role untuk Surat
 * Cek apakah user punya role yang sesuai untuk handle surat masuk/keluar
 */
export const validateSuratRole = (requiredAction) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      // Define role permissions per tahap surat masuk
      const suratMasukPermissions = {
        DITERIMA: ["ADMIN"], // Hanya Sekretaris Kantor (ADMIN)
        DIPROSES: ["ADMIN"], // Hanya Sekretaris Kantor (ADMIN)
        DISPOSISI_KETUA: ["KETUA_PENGURUS"], // Hanya Ketua
        DISPOSISI_SEKPENGURUS: ["SEKRETARIS_PENGURUS", "BENDAHARA_PENGURUS"], // Sekpengurus/Bendahara
        DISPOSISI_KABAG: [
          "KEPALA_BAGIAN_PSDM",
          "KEPALA_BAGIAN_KEUANGAN",
          "KEPALA_BAGIAN_UMUM",
        ], // Kepala Bagian
      };

      // Define role permissions per tahap surat keluar
      const suratKeluarPermissions = {
        DRAFT: ["ADMIN"], // Hanya Sekretaris Kantor (ADMIN)
        REVIEW_SEKPENGURUS: ["SEKRETARIS_PENGURUS"], // Hanya Sekpengurus
        LAMPIRAN_KABAG: [
          "KEPALA_BAGIAN_PSDM",
          "KEPALA_BAGIAN_KEUANGAN",
          "KEPALA_BAGIAN_UMUM",
        ], // Kepala Bagian
        REVIEW_KETUA: ["KETUA_PENGURUS"], // Hanya Ketua
      };

      // Tentukan permission set berdasarkan tipe surat
      const permissionSet = requiredAction.includes("SURAT_MASUK")
        ? suratMasukPermissions
        : suratKeluarPermissions;

      // Extract aksi dari requiredAction (e.g., "SURAT_MASUK:DISPOSISI_KETUA" -> "DISPOSISI_KETUA")
      const [, tahap] = requiredAction.split(":");
      const allowedRoles = permissionSet[tahap] || [];

      if (!allowedRoles.includes(userRole)) {
        return errorResponse(
          res,
          403,
          `Akses denied. Hanya ${allowedRoles.join(
            ", "
          )} yang bisa melakukan action ini`
        );
      }

      next();
    } catch (error) {
      return errorResponse(res, 500, `Validation error: ${error.message}`);
    }
  };
};
