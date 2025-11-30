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


  /**
   * Get surat keluar dengan filtering
   */
  async getSuratKeluar(filters = {}, userId, userRole) {
    try {
      const {
        status,
        kategori,
        prioritas,
        page = 1,
        limit = 10,
        search
      } = filters;

      const skip = (page - 1) * limit;

      const where = {};

      if (status) where.status = status;
      if (kategori) where.kategori = kategori;
      if (prioritas) where.prioritas = prioritas;

      if (search) {
        where.OR = [
          { nomorSurat: { contains: search, mode: 'insensitive' } },
          { tujuanSurat: { contains: search, mode: 'insensitive' } },
          { perihal: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [suratKeluar, total] = await Promise.all([
        prisma.suratKeluar.findMany({
          where,
          skip,
          take: limit,
          include: {
            createdBy: {
              select: { id: true, name: true, role: true }
            },
            tracking: {
              orderBy: { createdAt: 'desc' }
            },
            lampiran: {
              select: {
                id: true,
                namaFile: true,
                ukuran: true,
                mimeType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.suratKeluar.count({ where })
      ]);
