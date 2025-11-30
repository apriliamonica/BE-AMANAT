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

      // Validasi: salah satu suratMasukId atau suratKeluarId harus ada
      if (!suratMasukId && !suratKeluarId) {
        throw new Error('Harus ada referensi surat masuk atau surat keluar');
      }
            // Ambil surat untuk validasi
      let surat = null;
      let tahapProses = '';

      if (suratMasukId) {
        surat = await prisma.suratMasuk.findUnique({
          where: { id: suratMasukId }
        });
        tahapProses = surat?.status || 'UNKNOWN';
      } else if (suratKeluarId) {
        surat = await prisma.suratKeluar.findUnique({
          where: { id: suratKeluarId }
        });
        tahapProses = surat?.status || 'UNKNOWN';
      }

      if (!surat) {
        throw new Error('Surat tidak ditemukan');
      }
