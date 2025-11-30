/**
 * Authentication Validation Schemas
 * Menggunakan Zod untuk validasi input yang type-safe
 */
import { z } from "zod";

// Register Validation
export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email harus diisi" })
      .email("Format email tidak valid")
      .min(1, "Email tidak boleh kosong")
      .max(255, "Email terlalu panjang"),
    password: z
      .string({ required_error: "Password harus diisi" })
      .min(6, "Password minimal 6 karakter")
      .max(100, "Password terlalu panjang"),
    nama: z
      .string({ required_error: "Nama harus diisi" })
      .min(1, "Nama tidak boleh kosong")
      .max(255, "Nama terlalu panjang")
      .trim(),
  }),
});

// Login Validation
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email harus diisi" })
      .email("Format email tidak valid")
      .min(1, "Email tidak boleh kosong"),
    password: z
      .string({ required_error: "Password harus diisi" })
      .min(1, "Password tidak boleh kosong"),
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
    nama: z
      .string()
      .min(1, "Nama tidak boleh kosong")
      .max(255, "Nama terlalu panjang")
      .trim()
      .optional(),
    fakultas: z.string().max(255, "Fakultas terlalu panjang").optional(),
    prodi: z.string().max(255, "Program studi terlalu panjang").optional(),
  }),
});
