const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DisposisiService {
  /**
   * Buat disposisi surat masuk
   * Untuk tracking & transfer surat antar role
   */
  async createDisposisi(data, userId, userRole) {
    try {
      const {
        suratMasukId,
        suratKeluarId,
        toUserId,
        instruksi,
        jenisDispo = 'TRANSFER',
        prioritas = 'SEDANG',
        tenggatWaktu
      } = data;