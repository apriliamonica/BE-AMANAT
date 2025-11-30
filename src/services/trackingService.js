const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TrackingService {
  /**
   * Get tracking lengkap untuk surat
   */
  async getTrackingSurat(suratMasukId = null, suratKeluarId = null, suratLampiranId = null) {
    try {
      const where = {};

      if (suratMasukId) where.suratMasukId = suratMasukId;
      if (suratKeluarId) where.suratKeluarId = suratKeluarId;
      if (suratLampiranId) where.suratLampiranId = suratLampiranId;

      if (!suratMasukId && !suratKeluarId && !suratLampiranId) {
        throw new Error('Harus ada referensi surat');
      }

      const tracking = await prisma.trackingSurat.findMany({
        where,
        include: {
          createdBy: { select: { name: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      return {
        success: true,
        data: tracking
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tracking history dengan pagination
   */
  async getTrackingHistory(filters = {}) {
    try {
      const {
        tahapProses,
        page = 1,
        limit = 20,
        startDate,
        endDate
      } = filters;

      const skip = (page - 1) * limit;
      const where = {};

      if (tahapProses) where.tahapProses = tahapProses;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [tracking, total] = await Promise.all([
        prisma.trackingSurat.findMany({
          where,
          skip,
          take: limit,
          include: {
            suratMasuk: {
              select: { nomorSurat: true, perihal: true }
            },
            suratKeluar: {
              select: { nomorSurat: true, perihal: true }
            },
            suratLampiran: {
              select: { nomorSurat: true, perihal: true }
            },
            createdBy: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.trackingSurat.count({ where })
      ]);

      return {
        success: true,
        data: tracking,
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

