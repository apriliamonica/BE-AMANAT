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

    /**
   * Get surat masuk dengan filtering
   */
  async getSuratMasuk(filters = {}, userId, userRole) {
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

       // Build where clause
      const where = {};

      if (status) where.status = status;
      if (kategori) where.kategori = kategori;
      if (prioritas) where.prioritas = prioritas;

      if (search) {
        where.OR = [
          { nomorSurat: { contains: search, mode: 'insensitive' } },
          { asalSurat: { contains: search, mode: 'insensitive' } },
          { perihal: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [suratMasuk, total] = await Promise.all([
        prisma.suratMasuk.findMany({
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
            disposisi: {
              include: {
                toUser: { select: { name: true, role: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.suratMasuk.count({ where })
      ]);

       // Add status per role
      const suratWithRoleStatus = suratMasuk.map(surat => ({
        ...surat,
        statusForMe: this.getStatusPerRole(surat, userRole)
      }));

      return {
        success: true,
        data: suratWithRoleStatus,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get surat masuk by ID
   */
  async getSuratMasukById(suratMasukId) {
    try {
      const surat = await prisma.suratMasuk.findUnique({
        where: { id: suratMasukId },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          },
          lampiran: {
            select: {
              id: true,
              namaFile: true,
              ukuran: true,
              mimeType: true,
              uploadedAt: true
            }
          },
          tracking: {
            include: {
              createdBy: { select: { name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          disposisi: {
            include: {
              fromUser: { select: { name: true, role: true } },
              toUser: { select: { name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!surat) {
        throw new Error('Surat masuk tidak ditemukan');
      }

      return {
        success: true,
        data: surat
      };
    } catch (error) {
      throw error;
    }
  }