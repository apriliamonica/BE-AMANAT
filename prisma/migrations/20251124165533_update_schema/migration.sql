/*
  Warnings:

  - The values [RENDAH,SEDANG,TINGGI,URGENT] on the enum `Prioritas` will be removed. If these variants are still used in the database, this will fail.
  - The values [BARU,DIPROSES,PENDING] on the enum `StatusSurat` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `nomorSurat` on the `disposisi` table. All the data in the column will be lost.
  - You are about to drop the column `perihal` on the `disposisi` table. All the data in the column will be lost.
  - The `status` column on the `disposisi` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `filePath` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `lampiranPath` on the `surat_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `surat_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `surat_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `nomorSurat` on the `tracking_surat` table. All the data in the column will be lost.
  - You are about to drop the column `oleh` on the `tracking_surat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nomorAgenda]` on the table `surat_keluar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nomorAgenda]` on the table `surat_masuk` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jenisSurat` to the `surat_keluar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorAgenda` to the `surat_keluar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenisSurat` to the `surat_masuk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomorAgenda` to the `surat_masuk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `tracking_surat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JenisSurat" AS ENUM ('SURAT_DINAS', 'SURAT_UNDANGAN', 'SURAT_EDARAN', 'SURAT_TUGAS', 'SURAT_KETERANGAN', 'SURAT_PERMOHONAN', 'SURAT_PEMBERITAHUAN', 'SURAT_KEPUTUSAN', 'NOTA_DINAS', 'MEMORANDUM', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusDisposisi" AS ENUM ('PENDING', 'DIBACA', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- AlterEnum
BEGIN;
CREATE TYPE "Prioritas_new" AS ENUM ('BIASA', 'PENTING', 'SEGERA', 'SANGAT_SEGERA');
ALTER TABLE "disposisi" ALTER COLUMN "prioritas" DROP DEFAULT;
ALTER TABLE "surat_masuk" ALTER COLUMN "prioritas" TYPE "Prioritas_new" USING ("prioritas"::text::"Prioritas_new");
ALTER TABLE "surat_keluar" ALTER COLUMN "prioritas" TYPE "Prioritas_new" USING ("prioritas"::text::"Prioritas_new");
ALTER TABLE "disposisi" ALTER COLUMN "prioritas" TYPE "Prioritas_new" USING ("prioritas"::text::"Prioritas_new");
ALTER TYPE "Prioritas" RENAME TO "Prioritas_old";
ALTER TYPE "Prioritas_new" RENAME TO "Prioritas";
DROP TYPE "Prioritas_old";
ALTER TABLE "disposisi" ALTER COLUMN "prioritas" SET DEFAULT 'BIASA';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ADMIN';
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- AlterEnum
BEGIN;
CREATE TYPE "StatusSurat_new" AS ENUM ('BELUM_DIPROSES', 'SEDANG_DIPROSES', 'SUDAH_DISPOSISI', 'SELESAI', 'DITOLAK', 'DRAFT', 'MENUNGGU_PERSETUJUAN', 'DISETUJUI', 'TERKIRIM', 'DIBATALKAN');
ALTER TABLE "disposisi" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat_keluar" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat_masuk" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "surat_masuk" ALTER COLUMN "status" TYPE "StatusSurat_new" USING ("status"::text::"StatusSurat_new");
ALTER TABLE "surat_keluar" ALTER COLUMN "status" TYPE "StatusSurat_new" USING ("status"::text::"StatusSurat_new");
ALTER TYPE "StatusSurat" RENAME TO "StatusSurat_old";
ALTER TYPE "StatusSurat_new" RENAME TO "StatusSurat";
DROP TYPE "StatusSurat_old";
ALTER TABLE "surat_keluar" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "surat_masuk" ALTER COLUMN "status" SET DEFAULT 'BELUM_DIPROSES';
COMMIT;

-- DropForeignKey
ALTER TABLE "disposisi" DROP CONSTRAINT "disposisi_suratMasukId_fkey";

-- DropForeignKey
ALTER TABLE "tracking_surat" DROP CONSTRAINT "tracking_surat_suratKeluarId_fkey";

-- DropForeignKey
ALTER TABLE "tracking_surat" DROP CONSTRAINT "tracking_surat_suratMasukId_fkey";

-- DropIndex
DROP INDEX "surat_keluar_nomorSurat_key";

-- DropIndex
DROP INDEX "surat_masuk_nomorSurat_key";

-- AlterTable
ALTER TABLE "disposisi" DROP COLUMN "nomorSurat",
DROP COLUMN "perihal",
ADD COLUMN     "selesaiAt" TIMESTAMP(3),
ALTER COLUMN "tenggatWaktu" DROP NOT NULL,
ALTER COLUMN "prioritas" SET DEFAULT 'BIASA',
DROP COLUMN "status",
ADD COLUMN     "status" "StatusDisposisi" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "surat_keluar" DROP COLUMN "filePath",
DROP COLUMN "kategori",
DROP COLUMN "lampiranPath",
ADD COLUMN     "alamatTujuan" TEXT,
ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "emailTujuan" TEXT,
ADD COLUMN     "jenisSurat" "JenisSurat" NOT NULL,
ADD COLUMN     "kontakTujuan" TEXT,
ADD COLUMN     "nomorAgenda" TEXT NOT NULL,
ADD COLUMN     "prioritas" "Prioritas" NOT NULL DEFAULT 'BIASA',
ADD COLUMN     "tanggalDikirim" TIMESTAMP(3),
ADD COLUMN     "tembusan" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "surat_masuk" DROP COLUMN "filePath",
DROP COLUMN "kategori",
ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "jenisSurat" "JenisSurat" NOT NULL,
ADD COLUMN     "kontakPengirim" TEXT,
ADD COLUMN     "namaPengirim" TEXT,
ADD COLUMN     "nomorAgenda" TEXT NOT NULL,
ADD COLUMN     "tanggalDiterima" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "prioritas" SET DEFAULT 'BIASA',
ALTER COLUMN "status" SET DEFAULT 'BELUM_DIPROSES';

-- AlterTable
ALTER TABLE "tracking_surat" DROP COLUMN "nomorSurat",
DROP COLUMN "oleh",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "jabatan" TEXT,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- CreateTable
CREATE TABLE "lampiran" (
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

    CONSTRAINT "lampiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arsip" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "kategori" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "filePath" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arsip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lampiran_suratMasukId_idx" ON "lampiran"("suratMasukId");

-- CreateIndex
CREATE INDEX "lampiran_suratKeluarId_idx" ON "lampiran"("suratKeluarId");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "arsip_tahun_idx" ON "arsip"("tahun");

-- CreateIndex
CREATE INDEX "arsip_kategori_idx" ON "arsip"("kategori");

-- CreateIndex
CREATE INDEX "disposisi_suratMasukId_idx" ON "disposisi"("suratMasukId");

-- CreateIndex
CREATE INDEX "disposisi_toUserId_idx" ON "disposisi"("toUserId");

-- CreateIndex
CREATE INDEX "disposisi_status_idx" ON "disposisi"("status");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_nomorAgenda_key" ON "surat_keluar"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_keluar_nomorAgenda_idx" ON "surat_keluar"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_keluar_nomorSurat_idx" ON "surat_keluar"("nomorSurat");

-- CreateIndex
CREATE INDEX "surat_keluar_status_idx" ON "surat_keluar"("status");

-- CreateIndex
CREATE INDEX "surat_keluar_tanggalSurat_idx" ON "surat_keluar"("tanggalSurat");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_nomorAgenda_key" ON "surat_masuk"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_masuk_nomorAgenda_idx" ON "surat_masuk"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_masuk_nomorSurat_idx" ON "surat_masuk"("nomorSurat");

-- CreateIndex
CREATE INDEX "surat_masuk_status_idx" ON "surat_masuk"("status");

-- CreateIndex
CREATE INDEX "surat_masuk_tanggalDiterima_idx" ON "surat_masuk"("tanggalDiterima");

-- CreateIndex
CREATE INDEX "tracking_surat_suratMasukId_idx" ON "tracking_surat"("suratMasukId");

-- CreateIndex
CREATE INDEX "tracking_surat_suratKeluarId_idx" ON "tracking_surat"("suratKeluarId");

-- CreateIndex
CREATE INDEX "tracking_surat_createdAt_idx" ON "tracking_surat"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
