const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SuratLampiranService {
  /**
   * Buat surat lampiran (dari Kabag)
   */
  async createSuratLampiran(data, userId, userRole, kodeBagian) {
    try {
      const {
        nomorSurat,
        tanggalSurat,
        perihal,
        prioritas = 'SEDANG',
        suratKeluarRefId
      } = data;

      // Validasi user adalah Kepala Bagian
      if (!userRole.includes('KEPALA_BAGIAN')) {
        throw new Error('Hanya Kepala Bagian yang dapat membuat surat lampiran');
      }

            // Generate nomor agenda
      const nomorAgenda = await this.generateNomorAgendaLampiran(kodeBagian);

       // Validasi nomor surat tidak duplikat
      const existingNomor = await prisma.suratKeluarLampiran.findUnique({
        where: { nomorSurat }
      });

      if (existingNomor) {
        throw new Error(`Nomor surat ${nomorSurat} sudah ada di sistem`);
      }
