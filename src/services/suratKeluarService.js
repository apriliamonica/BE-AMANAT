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
      // Generate nomor agenda otomatis
      const nomorAgenda = await this.generateNomorAgenda();
           // Validasi nomor surat tidak duplikat
      const existingNomor = await prisma.suratKeluar.findUnique({
        where: { nomorSurat }
      });

           // Create surat keluar
      const suratKeluar = await prisma.suratKeluar.create({
        data: {
          nomorAgenda,
          nomorSurat,
          tanggalSurat: new Date(tanggalSurat),
          tujuanSurat,
          alamatTujuan,
          kontakTujuan,
          perihal,
          isiSurat,
          kategori,
          prioritas,
          tembusan,
          status: 'DRAFT',
          createdById: userId
        }
      });


      // Create tracking entry
      await prisma.trackingSurat.create({
        data: {
          suratKeluarId: suratKeluar.id,
          tahapProses: 'DRAFT',
          posisiSaat: 'Sekretaris Kantor',
          aksiDilakukan: 'Membuat draft surat keluar',
          statusTracking: 'DRAFT',
          createdById: userId
        }
      });

      return {
        success: true,
        message: 'Surat keluar berhasil dibuat (draft)',
        data: suratKeluar
      };
    } catch (error) {
      throw error;
    }
  }