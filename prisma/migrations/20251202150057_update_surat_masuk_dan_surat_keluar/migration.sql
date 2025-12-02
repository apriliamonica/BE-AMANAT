/*
  Warnings:

  - The values [REVISI,DIBATALKAN] on the enum `StatusSuratKeluar` will be removed. If these variants are still used in the database, this will fail.
  - The values [DITOLAK] on the enum `StatusSuratMasuk` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `prioritas` on the `disposisi` table. All the data in the column will be lost.
  - You are about to drop the column `alamatTujuan` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `emailTujuan` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `isiSurat` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `kontakTujuan` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `nomorAgenda` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `prioritas` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalDikirim` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `tembusan` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `surat_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `kontakPengirim` on the `surat_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `nomorAgenda` on the `surat_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `prioritas` on the `surat_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `suratLampiranId` on the `tracking_surat` table. All the data in the column will be lost.
  - You are about to drop the `arsip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lampiran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `surat_keluar_lampiran` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusSuratKeluar_new" AS ENUM ('DRAFT', 'REVIEW_SEKPENGURUS', 'LAMPIRAN_KABAG', 'REVIEW_KETUA', 'TERKIRIM');
ALTER TABLE "surat_keluar_lampiran" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat_keluar" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat_keluar" ALTER COLUMN "status" TYPE "StatusSuratKeluar_new" USING ("status"::text::"StatusSuratKeluar_new");
ALTER TYPE "StatusSuratKeluar" RENAME TO "StatusSuratKeluar_old";
ALTER TYPE "StatusSuratKeluar_new" RENAME TO "StatusSuratKeluar";
DROP TYPE "StatusSuratKeluar_old" CASCADE;
ALTER TABLE "surat_keluar" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StatusSuratMasuk_new" AS ENUM ('DITERIMA', 'DIPROSES', 'DISPOSISI_KETUA', 'DISPOSISI_SEKPENGURUS', 'DISPOSISI_KABAG', 'SELESAI');
ALTER TABLE "surat_masuk" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat_masuk" ALTER COLUMN "status" TYPE "StatusSuratMasuk_new" USING ("status"::text::"StatusSuratMasuk_new");
ALTER TYPE "StatusSuratMasuk" RENAME TO "StatusSuratMasuk_old";
ALTER TYPE "StatusSuratMasuk_new" RENAME TO "StatusSuratMasuk";
DROP TYPE "StatusSuratMasuk_old";
ALTER TABLE "surat_masuk" ALTER COLUMN "status" SET DEFAULT 'DITERIMA';
COMMIT;

-- DropForeignKey
ALTER TABLE "lampiran" DROP CONSTRAINT "lampiran_suratKeluarId_fkey";

-- DropForeignKey
ALTER TABLE "lampiran" DROP CONSTRAINT "lampiran_suratLampiranId_fkey";

-- DropForeignKey
ALTER TABLE "lampiran" DROP CONSTRAINT "lampiran_suratMasukId_fkey";

-- DropForeignKey
ALTER TABLE "surat_keluar_lampiran" DROP CONSTRAINT "surat_keluar_lampiran_kepalaKabagId_fkey";

-- DropForeignKey
ALTER TABLE "tracking_surat" DROP CONSTRAINT "tracking_surat_suratLampiranId_fkey";

-- DropIndex
DROP INDEX "surat_keluar_nomorAgenda_idx";

-- DropIndex
DROP INDEX "surat_keluar_nomorAgenda_key";

-- DropIndex
DROP INDEX "surat_masuk_nomorAgenda_idx";

-- DropIndex
DROP INDEX "surat_masuk_nomorAgenda_key";

-- DropIndex
DROP INDEX "tracking_surat_suratLampiranId_idx";

-- AlterTable
ALTER TABLE "disposisi" DROP COLUMN "prioritas";

-- AlterTable
ALTER TABLE "surat_keluar" DROP COLUMN "alamatTujuan",
DROP COLUMN "emailTujuan",
DROP COLUMN "isiSurat",
DROP COLUMN "kontakTujuan",
DROP COLUMN "nomorAgenda",
DROP COLUMN "prioritas",
DROP COLUMN "tanggalDikirim",
DROP COLUMN "tembusan";

-- AlterTable
ALTER TABLE "surat_masuk" DROP COLUMN "catatan",
DROP COLUMN "kontakPengirim",
DROP COLUMN "nomorAgenda",
DROP COLUMN "prioritas";

-- AlterTable
ALTER TABLE "tracking_surat" DROP COLUMN "suratLampiranId";

-- DropTable
DROP TABLE "arsip";

-- DropTable
DROP TABLE "lampiran";

-- DropTable
DROP TABLE "surat_keluar_lampiran";

-- DropEnum
DROP TYPE "Prioritas";

-- CreateTable
CREATE TABLE "Lampiran" (
    "id" TEXT NOT NULL,
    "suratMasukId" TEXT,
    "suratKeluarId" TEXT,
    "namaFile" TEXT NOT NULL,
    "namaTersimpan" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ukuran" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "keterangan" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lampiran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lampiran_suratMasukId_idx" ON "Lampiran"("suratMasukId");

-- CreateIndex
CREATE INDEX "Lampiran_suratKeluarId_idx" ON "Lampiran"("suratKeluarId");

-- AddForeignKey
ALTER TABLE "Lampiran" ADD CONSTRAINT "Lampiran_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lampiran" ADD CONSTRAINT "Lampiran_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
