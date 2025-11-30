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
