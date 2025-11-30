// src/services/suratMasukService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SuratMasukService {
      /**
   * Buat surat masuk baru (TAHAP 1: DITERIMA)
   * Role: Sekretaris Kantor (Admin)
   */
  async createSuratMasuk(data, userId) {
    try {
      const {
        nomorSurat,
        tanggalSurat,
        asalSurat,
        namaPengirim,
        kontakPengirim,
        perihal,
        kategori,
        prioritas = 'SEDANG'
      } = data;

       // Generate nomor agenda otomatis
      const nomorAgenda = await this.generateNomorAgenda();

      // Validasi nomor surat tidak duplikat
      const existingNomor = await prisma.suratMasuk.findUnique({
        where: { nomorSurat }
      });

      if (existingNomor) {
        throw new Error(`Nomor surat ${nomorSurat} sudah ada di sistem`);
      }