-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'KETUA_PENGURUS', 'SEKRETARIS_PENGURUS', 'BENDAHARA_PENGURUS', 'KEPALA_BAGIAN_PSDM', 'KEPALA_BAGIAN_KEUANGAN', 'KEPALA_BAGIAN_UMUM');

-- CreateEnum
CREATE TYPE "JenisSurat" AS ENUM ('MASUK', 'KELUAR', 'LAMPIRAN');

-- CreateEnum
CREATE TYPE "StatusSuratMasuk" AS ENUM ('DITERIMA', 'DIPROSES', 'DISPOSISI_KETUA', 'DISPOSISI_SEKPENGURUS', 'DISPOSISI_KABAG', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusSuratKeluar" AS ENUM ('DRAFT', 'REVIEW_SEKPENGURUS', 'LAMPIRAN_KABAG', 'REVIEW_KETUA', 'TERKIRIM', 'REVISI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusDisposisi" AS ENUM ('PENDING', 'DITERIMA', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "Prioritas" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');

-- CreateEnum
CREATE TYPE "JenisKategori" AS ENUM ('UNDANGAN', 'PERMOHONAN', 'PEMBERITAHUAN', 'VERIFIKASI', 'AUDIT', 'LAINNYA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "kodeBagian" TEXT,
    "jabatan" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_masuk" (
    "id" TEXT NOT NULL,
    "nomorAgenda" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "tanggalDiterima" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asalSurat" TEXT NOT NULL,
    "namaPengirim" TEXT,
    "kontakPengirim" TEXT,
    "perihal" TEXT NOT NULL,
    "kategori" "JenisKategori" NOT NULL,
    "prioritas" "Prioritas" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusSuratMasuk" NOT NULL DEFAULT 'DITERIMA',
    "catatan" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keluar" (
    "id" TEXT NOT NULL,
    "nomorAgenda" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "tanggalDikirim" TIMESTAMP(3),
    "tujuanSurat" TEXT NOT NULL,
    "alamatTujuan" TEXT,
    "kontakTujuan" TEXT,
    "emailTujuan" TEXT,
    "perihal" TEXT NOT NULL,
    "isiSurat" TEXT NOT NULL,
    "kategori" "JenisKategori" NOT NULL,
    "prioritas" "Prioritas" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusSuratKeluar" NOT NULL DEFAULT 'DRAFT',
    "tembusan" TEXT,
    "catatan" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keluar_lampiran" (
    "id" TEXT NOT NULL,
    "nomorAgenda" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "kepalaKabagId" TEXT NOT NULL,
    "suratKeluarRefId" TEXT,
    "perihal" TEXT NOT NULL,
    "kodeBagian" TEXT NOT NULL,
    "prioritas" "Prioritas" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusSuratKeluar" NOT NULL DEFAULT 'DRAFT',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_keluar_lampiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposisi" (
    "id" TEXT NOT NULL,
    "suratMasukId" TEXT,
    "suratKeluarId" TEXT,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "instruksi" TEXT NOT NULL,
    "jenisDispo" TEXT NOT NULL,
    "tahapProses" TEXT NOT NULL,
    "prioritas" "Prioritas" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusDisposisi" NOT NULL DEFAULT 'PENDING',
    "tenggatWaktu" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "selesaiAt" TIMESTAMP(3),

    CONSTRAINT "disposisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lampiran" (
    "id" TEXT NOT NULL,
    "suratMasukId" TEXT,
    "suratKeluarId" TEXT,
    "suratLampiranId" TEXT,
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
CREATE TABLE "tracking_surat" (
    "id" TEXT NOT NULL,
    "suratMasukId" TEXT,
    "suratKeluarId" TEXT,
    "suratLampiranId" TEXT,
    "tahapProses" TEXT NOT NULL,
    "posisiSaat" TEXT NOT NULL,
    "aksiDilakukan" TEXT NOT NULL,
    "statusTracking" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_surat_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_nomorAgenda_key" ON "surat_masuk"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_masuk_nomorAgenda_idx" ON "surat_masuk"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_masuk_status_idx" ON "surat_masuk"("status");

-- CreateIndex
CREATE INDEX "surat_masuk_tanggalDiterima_idx" ON "surat_masuk"("tanggalDiterima");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_nomorAgenda_key" ON "surat_keluar"("nomorAgenda");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_nomorSurat_key" ON "surat_keluar"("nomorSurat");

-- CreateIndex
CREATE INDEX "surat_keluar_nomorAgenda_idx" ON "surat_keluar"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_keluar_nomorSurat_idx" ON "surat_keluar"("nomorSurat");

-- CreateIndex
CREATE INDEX "surat_keluar_status_idx" ON "surat_keluar"("status");

-- CreateIndex
CREATE INDEX "surat_keluar_tanggalSurat_idx" ON "surat_keluar"("tanggalSurat");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_lampiran_nomorAgenda_key" ON "surat_keluar_lampiran"("nomorAgenda");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_lampiran_nomorSurat_key" ON "surat_keluar_lampiran"("nomorSurat");

-- CreateIndex
CREATE INDEX "surat_keluar_lampiran_nomorAgenda_idx" ON "surat_keluar_lampiran"("nomorAgenda");

-- CreateIndex
CREATE INDEX "surat_keluar_lampiran_nomorSurat_idx" ON "surat_keluar_lampiran"("nomorSurat");

-- CreateIndex
CREATE INDEX "surat_keluar_lampiran_kodeBagian_idx" ON "surat_keluar_lampiran"("kodeBagian");

-- CreateIndex
CREATE INDEX "surat_keluar_lampiran_status_idx" ON "surat_keluar_lampiran"("status");

-- CreateIndex
CREATE INDEX "disposisi_suratMasukId_idx" ON "disposisi"("suratMasukId");

-- CreateIndex
CREATE INDEX "disposisi_suratKeluarId_idx" ON "disposisi"("suratKeluarId");

-- CreateIndex
CREATE INDEX "disposisi_toUserId_idx" ON "disposisi"("toUserId");

-- CreateIndex
CREATE INDEX "disposisi_status_idx" ON "disposisi"("status");

-- CreateIndex
CREATE INDEX "lampiran_suratMasukId_idx" ON "lampiran"("suratMasukId");

-- CreateIndex
CREATE INDEX "lampiran_suratKeluarId_idx" ON "lampiran"("suratKeluarId");

-- CreateIndex
CREATE INDEX "lampiran_suratLampiranId_idx" ON "lampiran"("suratLampiranId");

-- CreateIndex
CREATE INDEX "tracking_surat_suratMasukId_idx" ON "tracking_surat"("suratMasukId");

-- CreateIndex
CREATE INDEX "tracking_surat_suratKeluarId_idx" ON "tracking_surat"("suratKeluarId");

-- CreateIndex
CREATE INDEX "tracking_surat_suratLampiranId_idx" ON "tracking_surat"("suratLampiranId");

-- CreateIndex
CREATE INDEX "tracking_surat_tahapProses_idx" ON "tracking_surat"("tahapProses");

-- CreateIndex
CREATE INDEX "tracking_surat_createdAt_idx" ON "tracking_surat"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "arsip_tahun_idx" ON "arsip"("tahun");

-- CreateIndex
CREATE INDEX "arsip_kategori_idx" ON "arsip"("kategori");

-- AddForeignKey
ALTER TABLE "surat_masuk" ADD CONSTRAINT "surat_masuk_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_keluar" ADD CONSTRAINT "surat_keluar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_keluar_lampiran" ADD CONSTRAINT "surat_keluar_lampiran_kepalaKabagId_fkey" FOREIGN KEY ("kepalaKabagId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_suratLampiranId_fkey" FOREIGN KEY ("suratLampiranId") REFERENCES "surat_keluar_lampiran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratLampiranId_fkey" FOREIGN KEY ("suratLampiranId") REFERENCES "surat_keluar_lampiran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
