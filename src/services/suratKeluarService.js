const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SuratKeluarService {
  /**
   * Buat surat keluar baru (TAHAP 1: DRAFT)
   * Role: Sekretaris Kantor (Admin)
   */
  async createSuratKeluar(data, userId) {
    try {
      const {
        nomorSurat,
        tanggalSurat,
        tujuanSurat,
        alamatTujuan,
        kontakTujuan,
        emailTujuan,
        perihal,
        isiSurat,
        kategori,
        prioritas = 'SEDANG',
        tembusan
      } = data; 
    }
}