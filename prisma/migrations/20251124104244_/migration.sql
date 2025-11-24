-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SEKRETARIS_KANTOR', 'KETUA_PENGURUS', 'SEKRETARIS_PENGURUS', 'BENDAHARA_PENGURUS', 'KEPALA_BAGIAN');

-- CreateEnum
CREATE TYPE "StatusSurat" AS ENUM ('BARU', 'DIPROSES', 'SELESAI', 'DITOLAK', 'PENDING');

-- CreateEnum
CREATE TYPE "Prioritas" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "bagian" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_masuk" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "asalSurat" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "prioritas" "Prioritas" NOT NULL,
    "status" "StatusSurat" NOT NULL DEFAULT 'BARU',
    "filePath" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_masuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surat_keluar" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "tanggalSurat" TIMESTAMP(3) NOT NULL,
    "tujuanSurat" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "isiSurat" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "status" "StatusSurat" NOT NULL DEFAULT 'PENDING',
    "filePath" TEXT,
    "lampiranPath" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_keluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposisi" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "perihal" TEXT NOT NULL,
    "instruksi" TEXT NOT NULL,
    "tenggatWaktu" TIMESTAMP(3) NOT NULL,
    "prioritas" "Prioritas" NOT NULL DEFAULT 'SEDANG',
    "status" "StatusSurat" NOT NULL DEFAULT 'PENDING',
    "catatan" TEXT,
    "suratMasukId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disposisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracking_surat" (
    "id" TEXT NOT NULL,
    "nomorSurat" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "oleh" TEXT NOT NULL,
    "suratMasukId" TEXT,
    "suratKeluarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_surat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "surat_masuk_nomorSurat_key" ON "surat_masuk"("nomorSurat");

-- CreateIndex
CREATE UNIQUE INDEX "surat_keluar_nomorSurat_key" ON "surat_keluar"("nomorSurat");

-- AddForeignKey
ALTER TABLE "surat_masuk" ADD CONSTRAINT "surat_masuk_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surat_keluar" ADD CONSTRAINT "surat_keluar_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disposisi" ADD CONSTRAINT "disposisi_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratMasukId_fkey" FOREIGN KEY ("suratMasukId") REFERENCES "surat_masuk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracking_surat" ADD CONSTRAINT "tracking_surat_suratKeluarId_fkey" FOREIGN KEY ("suratKeluarId") REFERENCES "surat_keluar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
