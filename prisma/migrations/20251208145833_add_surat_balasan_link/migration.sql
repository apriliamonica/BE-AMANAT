-- AlterTable
ALTER TABLE "surat_keluar" ADD COLUMN     "balasanDariSuratMasukId" TEXT;

-- AddForeignKey
ALTER TABLE "surat_keluar" ADD CONSTRAINT "surat_keluar_balasanDariSuratMasukId_fkey" FOREIGN KEY ("balasanDariSuratMasukId") REFERENCES "surat_masuk"("id") ON DELETE SET NULL ON UPDATE CASCADE;
