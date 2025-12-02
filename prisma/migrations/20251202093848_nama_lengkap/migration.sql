/*
  Warnings:

  - You are about to drop the column `name_lengkap` on the `users` table. All the data in the column will be lost.
  - Added the required column `nama_lengkap` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "name_lengkap",
ADD COLUMN     "nama_lengkap" TEXT NOT NULL;
