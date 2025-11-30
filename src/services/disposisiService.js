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

          // Create disposisi
      const disposisi = await prisma.disposisi.create({
        data: {
          suratMasukId: suratMasukId || null,
          suratKeluarId: suratKeluarId || null,
          fromUserId: userId,
          toUserId,
          instruksi,
          jenisDispo,
          tahapProses,
          prioritas,
          tenggatWaktu: tenggatWaktu ? new Date(tenggatWaktu) : null,
          status: 'PENDING'
        },
        include: {
          fromUser: { select: { name: true, role: true } },
          toUser: { select: { name: true, role: true } }
        }
      });

            // Update surat status menjadi disposisi
      if (suratMasukId && tahapProses === 'DIPROSES') {
        await prisma.suratMasuk.update({
          where: { id: suratMasukId },
          data: { status: 'DISPOSISI_KETUA' }
        });
      }


      // Create tracking
      await prisma.trackingSurat.create({
        data: {
          suratMasukId: suratMasukId || null,
          suratKeluarId: suratKeluarId || null,
          tahapProses: `DISPOSISI_${jenisDispo}`,
          posisiSaat: disposisi.toUser.name,
          aksiDilakukan: `Disposisi dikirim ke ${disposisi.toUser.name}: ${instruksi.substring(0, 50)}...`,
          statusTracking: 'PENDING',
          createdById: userId
        }
      });

      return {
        success: true,
        message: 'Disposisi berhasil dibuat',
        data: disposisi
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get disposisi dengan filter
   */
  async getDisposisi(filters = {}, userId, userRole) {
    try {
      const {
        status = 'PENDING',
        jenisDispo,
        page = 1,
        limit = 10,
        forMe = false
      } = filters;

      const skip = (page - 1) * limit;

      const where = {};

      if (status) where.status = status;
      if (jenisDispo) where.jenisDispo = jenisDispo;

 // Jika forMe=true, hanya disposisi untuk user ini
      if (forMe) {
        where.toUserId = userId;
      }

      const [disposisi, total] = await Promise.all([
        prisma.disposisi.findMany({
          where,
          skip,
          take: limit,
          include: {
            suratMasuk: {
              select: {
                id: true,
                nomorAgenda: true,
                nomorSurat: true,
                perihal: true,
                status: true
              }
            },
            suratKeluar: {
              select: {
                id: true,
                nomorAgenda: true,
                nomorSurat: true,
                perihal: true,
                status: true
              }
            },
            fromUser: { select: { name: true, role: true } },
            toUser: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.disposisi.count({ where })
      ]);

      return {
        success: true,
        data: disposisi,
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
   * Update status disposisi
   */
  async updateDisposisiStatus(disposisiId, newStatus, userId, catatan = '') {
    try {
      const disposisi = await prisma.disposisi.findUnique({
        where: { id: disposisiId }
      });

      if (!disposisi) {
        throw new Error('Disposisi tidak ditemukan');
      }

      const updated = await prisma.disposisi.update({
        where: { id: disposisiId },
        data: {
          status: newStatus,
          updatedAt: new Date()
        },
        include: {
          fromUser: { select: { name: true } },
          toUser: { select: { name: true } }
        }
      });
