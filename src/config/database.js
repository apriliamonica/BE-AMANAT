// src/config/database.js (Versi ES Module)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tambahkan kode lifecycle hooks jika diperlukan (ini opsional tapi disarankan)
prisma
  .$connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

// Gunakan export default
export default prisma;

// Hapus baris lama: module.exports = prisma;
