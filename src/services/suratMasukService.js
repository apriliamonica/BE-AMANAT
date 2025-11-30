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

      // Create surat masuk
      const suratMasuk = await prisma.suratMasuk.create({
        data: {
          nomorAgenda,
          nomorSurat,
          tanggalSurat: new Date(tanggalSurat),
          asalSurat,
          namaPengirim,
          kontakPengirim,
          perihal,
          kategori,
          prioritas,
          status: 'DITERIMA',
          createdById: userId
        }
      });

            // Create tracking entry
      await this.createTracking({
        suratMasukId: suratMasuk.id,
        tahapProses: 'DITERIMA',
        posisiSaat: 'Sekretaris Kantor',
        aksiDilakukan: 'Menerima dan input surat ke sistem',
        statusTracking: 'DITERIMA'
      }, userId);

      return {
        success: true,
        message: 'Surat masuk berhasil dibuat',
        data: suratMasuk
      };
    } catch (error) {
      throw error;
    }
  }