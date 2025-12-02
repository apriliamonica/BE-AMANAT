/**
 * Authentication Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from "zod";

export const roleEnum = z.enum(["ADMIN", "KETUA_PENGURUS", "SEKRETARIS_PENGURUS", "BENDAHARA_PENGURUS", "KEPALA_BAGIAN_PSDM", "KEPALA_BAGIAN_KEUANGAN", "KEPALA_BAGIAN_UMUM"]);

// Register Validation
export const registerSchema = z.object({
  body: z.object({
    nama_lengkap: z
      .string({ required_error: "Nama lengkap harus diisi" })
      .min(1, "Nama lengkap tidak boleh kosong")
      .max(255, "Nama lengkap terlalu panjang")
      .trim(),
    email: z
      .string({ required_error: "Email harus diisi" })
      .email("Format email tidak valid")
      .min(1, "Email tidak boleh kosong")
      .max(255, "Email terlalu panjang"),
    username: z
      .string({ required_error: "Username harus diisi" })
      .min(1, "Username tidak boleh kosong")
      .max(255, "Username terlalu panjang")
      .trim(),
    password: z
      .string({ required_error: "Password harus diisi" })
      .min(6, "Password minimal 6 karakter")
      .max(100, "Password terlalu panjang"),
    role: roleEnum,
    kodeBagian: z
      .string()
      .max(255, "Kode bagian terlalu panjang")
      .trim().optional(),
    jabatan: z
      .string({ required_error: "Jabatan harus diisi" })
      .min(1, "Jabatan tidak boleh kosong")
      .max(255, "Jabatan terlalu panjang")
      .trim(),
    phone: z
      .string({ required_error: "Phone harus diisi" })
      .min(1, "Phone tidak boleh kosong")
      .max(255, "Phone terlalu panjang")
      .trim(),
    isActive: z
      .boolean({ required_error: "Status harus diisi" })
      .default(true),
  }),
});

// Login Validation
export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username harus diisi" })
      .min(1, "Username tidak boleh kosong")
      .max(255, "Username terlalu panjang")
      .trim(),
    password: z
      .string({ required_error: "Password harus diisi" })
      .min(1, "Password tidak boleh kosong")
      .max(255, "Password terlalu panjang")
      .trim(),
  }),
});

// Change Password Validation
export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z
      .string({ required_error: "Password lama harus diisi" })
      .min(1, "Password lama tidak boleh kosong"),
    newPassword: z
      .string({ required_error: "Password baru harus diisi" })
      .min(6, "Password baru minimal 6 karakter")
      .max(100, "Password baru terlalu panjang"),
  }),
});

// Update Profile Validation
export const updateProfileSchema = z.object({
  body: z.object({
    id: z.string(),
    nama_lengkap: z
      .string()
      .min(1, "Nama lengkap tidak boleh kosong")
      .max(255, "Nama lengkap terlalu panjang")
      .trim()
      .optional(),
    email: z.string().email("Format email tidak valid").max(255, "Email terlalu panjang").optional(),
    username: z.string().max(255, "Username terlalu panjang").optional(),
    password: z.string().min(6, "Password minimal 6 karakter").max(100, "Password terlalu panjang").optional(),
    role: roleEnum.optional(),
    kodeBagian: z.string().max(255, "Kode bagian terlalu panjang").optional(),
    jabatan: z.string().max(255, "Jabatan terlalu panjang").optional(),
    phone: z.string().max(255, "Phone terlalu panjang").optional(),
    isActive: z.boolean().optional(),
  }),
});
