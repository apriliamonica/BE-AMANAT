// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper function untuk hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log("🌱 Mulai seeding database...");

  try {
    // ==================== DELETE EXISTING DATA ====================
    console.log("🗑️  Menghapus data existing...");

    await prisma.trackingSurat.deleteMany({});
    await prisma.disposisi.deleteMany({});
    await prisma.lampiran.deleteMany({});
    await prisma.suratKeluar.deleteMany({});
    await prisma.suratMasuk.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.settings.deleteMany({});

    console.log("✅ Data dihapus");

    // ==================== SEED USERS ====================
    console.log("👥 Membuat user...");

    const hashedPasswordAdmin = await hashPassword("admin123");
    const hashedPasswordUser = await hashPassword("user123");

    const users = await prisma.user.createMany({
      data: [
        // ADMIN
        {
          nama_lengkap: "Admin System",
          email: "admin@amanat.id",
          username: "admin",
          password: hashedPasswordAdmin,
          role: "ADMIN",
          kodeBagian: "",
          jabatan: "Sekretaris Kantor",
          phone: "0812-3456-7890",
          isActive: true,
        },

        // KETUA PENGURUS
        {
          nama_lengkap: "Budi Santoso",
          email: "ketua@amanat.id",
          username: "ketua_pengurus",
          password: hashedPasswordUser,
          role: "KETUA_PENGURUS",
          kodeBagian: "",
          jabatan: "Ketua Yayasan",
          phone: "0812-1111-1111",
          isActive: true,
        },

        // SEKRETARIS PENGURUS
        {
          nama_lengkap: "Siti Nurhaliza",
          email: "sekpengurus@amanat.id",
          username: "sekretaris_pengurus",
          password: hashedPasswordUser,
          role: "SEKRETARIS_PENGURUS",
          kodeBagian: "",
          jabatan: "Sekretaris Pengurus",
          phone: "0812-2222-2222",
          isActive: true,
        },

        // BENDAHARA
        {
          nama_lengkap: "Ahmad Wijaya",
          email: "bendahara@amanat.id",
          username: "bendahara_pengurus",
          password: hashedPasswordUser,
          role: "BENDAHARA_PENGURUS",
          kodeBagian: "KEU",
          jabatan: "Bendahara",
          phone: "0812-3333-3333",
          isActive: true,
        },

        // KEPALA BAGIAN PSDM
        {
          nama_lengkap: "Rina Handayani",
          email: "kabag.psdm@amanat.id",
          username: "kabag_psdm",
          password: hashedPasswordUser,
          role: "KEPALA_BAGIAN_PSDM",
          kodeBagian: "PSDM",
          jabatan: "Kepala Bagian PSDM",
          phone: "0812-4444-4444",
          isActive: true,
        },

        // KEPALA BAGIAN KEUANGAN
        {
          nama_lengkap: "Didi Prasetyo",
          email: "kabag.keuangan@amanat.id",
          username: "kabag_keuangan",
          password: hashedPasswordUser,
          role: "KEPALA_BAGIAN_KEUANGAN",
          kodeBagian: "KEU",
          jabatan: "Kepala Bagian Keuangan",
          phone: "0812-5555-5555",
          isActive: true,
        },

        // KEPALA BAGIAN UMUM
        {
          nama_lengkap: "Eka Sulistyo",
          email: "kabag.umum@amanat.id",
          username: "kabag_umum",
          password: hashedPasswordUser,
          role: "KEPALA_BAGIAN_UMUM",
          kodeBagian: "UMUM",
          jabatan: "Kepala Bagian Umum",
          phone: "0812-6666-6666",
          isActive: true,
        },

        // STAFF PSDM
        {
          nama_lengkap: "Bambang Suryanto",
          email: "staff.psdm@amanat.id",
          username: "staff_psdm",
          password: hashedPasswordUser,
          role: "KEPALA_BAGIAN_PSDM",
          kodeBagian: "PSDM",
          jabatan: "Staff PSDM",
          phone: "0812-7777-7777",
          isActive: true,
        },

        // STAFF UMUM
        {
          nama_lengkap: "Hendra Kusuma",
          email: "staff.umum@amanat.id",
          username: "staff_umum",
          password: hashedPasswordUser,
          role: "KEPALA_BAGIAN_UMUM",
          kodeBagian: "UMUM",
          jabatan: "Staff Umum",
          phone: "0812-8888-8888",
          isActive: true,
        },
      ],
    });

    console.log(`✅ ${users.count} user berhasil dibuat`);

    // Get user IDs untuk relasi
    const adminUser = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    const ketua = await prisma.user.findUnique({
      where: { username: "ketua_pengurus" },
    });

    const sekPengurus = await prisma.user.findUnique({
      where: { username: "sekretaris_pengurus" },
    });

    const kabagPsdm = await prisma.user.findUnique({
      where: { username: "kabag_psdm" },
    });

    // ==================== SEED SURAT MASUK ====================
    console.log("📨 Membuat surat masuk...");

    const suratMasukData = [
      {
        nomorSurat: "001/PSDM/2024",
        tanggalSurat: new Date("2024-11-15"),
        tanggalDiterima: new Date("2024-11-16"),
        asalSurat: "Dinas Pendidikan Provinsi",
        perihal: "Permintaan data siswa tahun ajaran 2024/2025",
        kategori: "PERMOHONAN",
        namaPengirim: "Kepala Dinas Pendidikan",
        status: "DIPROSES",
        createdById: adminUser.id,
      },
      {
        nomorSurat: "002/UMUM/2024",
        tanggalSurat: new Date("2024-11-18"),
        tanggalDiterima: new Date("2024-11-19"),
        asalSurat: "Kantor Walikota Manado",
        perihal: "Undangan rapat koordinasi pembangunan pendidikan",
        kategori: "UNDANGAN",
        namaPengirim: "Asisten Pembangunan Walikota",
        status: "DISPOSISI_KETUA",
        createdById: adminUser.id,
      },
      {
        nomorSurat: "003/KEU/2024",
        tanggalSurat: new Date("2024-11-20"),
        tanggalDiterima: new Date("2024-11-21"),
        asalSurat: "Bank Sulutgo",
        perihal: "Verifikasi rekening tabungan lembaga",
        kategori: "VERIFIKASI",
        namaPengirim: "Customer Service Bank",
        status: "DISPOSISI_SEKPENGURUS",
        createdById: adminUser.id,
      },
      {
        nomorSurat: "004/AUDIT/2024",
        tanggalSurat: new Date("2024-11-22"),
        tanggalDiterima: new Date("2024-11-23"),
        asalSurat: "Biro Audit Manado",
        perihal: "Jadwal audit keuangan tahun 2024",
        kategori: "AUDIT",
        namaPengirim: "Kepala Biro Audit",
        status: "DISPOSISI_KABAG",
        createdById: adminUser.id,
      },
      {
        nomorSurat: "005/PEMBERITAHUAN/2024",
        tanggalSurat: new Date("2024-11-24"),
        tanggalDiterima: new Date("2024-11-25"),
        asalSurat: "Kemendikbud RI",
        perihal: "Pemberitahuan perubahan kebijakan beasiswa 2025",
        kategori: "PEMBERITAHUAN",
        namaPengirim: "Dirjen Pendidikan",
        status: "SELESAI",
        createdById: adminUser.id,
      },
    ];

    const suratMasukCreated = await prisma.suratMasuk.createMany({
      data: suratMasukData,
    });

    console.log(`✅ ${suratMasukCreated.count} surat masuk berhasil dibuat`);

    // Get surat masuk IDs
    const suratMasukList = await prisma.suratMasuk.findMany();

    // ==================== SEED TRACKING SURAT MASUK ====================
    console.log("📍 Membuat tracking surat masuk...");

    for (const surat of suratMasukList) {
      await prisma.trackingSurat.create({
        data: {
          suratMasukId: surat.id,
          tahapProses: surat.status,
          posisiSaat: "SEKRETARIS_KANTOR",
          aksiDilakukan: `Surat ${surat.nomorSurat} dari ${surat.asalSurat} - Status: ${surat.status}`,
          statusTracking: surat.status,
          createdById: adminUser.id,
        },
      });
    }

    console.log(`✅ ${suratMasukList.length} tracking record berhasil dibuat`);

    // ==================== SEED DISPOSISI ====================
    console.log("📤 Membuat disposisi...");

    const disposisiData = [
      {
        suratMasukId: suratMasukList[0]?.id,
        suratKeluarId: null,
        fromUserId: adminUser.id,
        toUserId: ketua.id,
        instruksi: "Mohon review dan berikan persetujuan untuk surat ini",
        jenisDispo: "APPROVAL",
        tahapProses: "DISPOSISI_KETUA",
        status: "DITERIMA",
        tenggatWaktu: new Date("2024-11-30"),
      },
      {
        suratMasukId: suratMasukList[1]?.id,
        suratKeluarId: null,
        fromUserId: ketua.id,
        toUserId: sekPengurus.id,
        instruksi: "Mohon koordinasi dan lanjutkan ke bagian terkait",
        jenisDispo: "TRANSFER",
        tahapProses: "DISPOSISI_SEKPENGURUS",
        status: "DIPROSES",
        tenggatWaktu: new Date("2024-12-01"),
      },
      {
        suratMasukId: suratMasukList[3]?.id,
        suratKeluarId: null,
        fromUserId: sekPengurus.id,
        toUserId: kabagPsdm.id,
        instruksi: "Mohon proses audit dan upload hasil",
        jenisDispo: "REQUEST_LAMPIRAN",
        tahapProses: "DISPOSISI_KABAG",
        status: "PENDING",
        tenggatWaktu: new Date("2024-12-05"),
      },
    ];

    const disposisiCreated = await prisma.disposisi.createMany({
      data: disposisiData,
    });

    console.log(`✅ ${disposisiCreated.count} disposisi berhasil dibuat`);

    // ==================== SEED SURAT KELUAR ====================
    console.log("📤 Membuat surat keluar...");

    const suratKeluarData = [
      {
        nomorSurat: "001/UPT-PIK/2024",
        tanggalSurat: new Date("2024-11-20"),
        tujuanSurat: "Dinas Pendidikan Provinsi",
        perihal: "Respons permintaan data siswa",
        kategori: "PEMBERITAHUAN",
        catatan: "Mengirim data siswa sesuai permintaan",
        status: "REVIEW_KETUA",
        createdById: sekPengurus.id,
      },
      {
        nomorSurat: "002/UPT-PIK/2024",
        tanggalSurat: new Date("2024-11-25"),
        tujuanSurat: "Kantor Walikota Manado",
        perihal: "Konfirmasi kehadiran rapat koordinasi",
        kategori: "PEMBERITAHUAN",
        catatan: "Lembaga akan hadir dalam rapat koordinasi",
        status: "TERKIRIM",
        createdById: sekPengurus.id,
      },
      {
        nomorSurat: "003/UPT-PIK/2024",
        tanggalSurat: new Date("2024-11-26"),
        tujuanSurat: "Dinas Pendidikan Kabupaten",
        perihal: "Permohonan bantuan pendidikan",
        kategori: "PERMOHONAN",
        catatan: "Permohonan bantuan dana pendidikan tahun 2025",
        status: "DRAFT",
        createdById: adminUser.id,
      },
    ];

    const suratKeluarCreated = await prisma.suratKeluar.createMany({
      data: suratKeluarData,
    });

    console.log(`✅ ${suratKeluarCreated.count} surat keluar berhasil dibuat`);

    // Get surat keluar IDs
    const suratKeluarList = await prisma.suratKeluar.findMany();

    // ==================== SEED TRACKING SURAT KELUAR ====================
    console.log("📍 Membuat tracking surat keluar...");

    for (const surat of suratKeluarList) {
      await prisma.trackingSurat.create({
        data: {
          suratMasukId: null,
          suratKeluarId: surat.id,
          tahapProses: surat.status,
          posisiSaat: "SEKRETARIS_KANTOR",
          aksiDilakukan: `Membuat draft surat keluar untuk ${surat.tujuanSurat}`,
          statusTracking: surat.status,
          createdById: surat.createdById,
        },
      });
    }

    console.log(
      `✅ ${suratKeluarList.length} tracking surat keluar berhasil dibuat`
    );

    // ==================== SEED SETTINGS ====================
    console.log("⚙️  Membuat settings...");

    const settingsData = [
      {
        key: "app_name",
        value: "AMANAT - Sistem Manajemen Surat Kantor",
      },
      {
        key: "app_version",
        value: "1.0.0",
      },
      {
        key: "organization_name",
        value: "UPT Pusat Inovasi Kebijakan",
      },
      {
        key: "organization_address",
        value: "Jln. Pendidikan No. 123, Manado, Sulawesi Utara",
      },
      {
        key: "organization_phone",
        value: "(0431) 123-4567",
      },
      {
        key: "organization_email",
        value: "info@amanat.id",
      },
      {
        key: "max_upload_size",
        value: "10485760", // 10MB in bytes
      },
      {
        key: "allowed_file_types",
        value: "pdf,doc,docx,xls,xlsx,txt,jpg,jpeg,png",
      },
    ];

    const settingsCreated = await prisma.settings.createMany({
      data: settingsData,
    });

    console.log(`✅ ${settingsCreated.count} settings berhasil dibuat`);

    // ==================== SUMMARY ====================
    console.log("\n✅ ✅ ✅ Seeding Selesai! ✅ ✅ ✅\n");
    console.log("📊 Summary:");
    console.log(`   👥 ${users.count} users`);
    console.log(`   📨 ${suratMasukCreated.count} surat masuk`);
    console.log(`   📤 ${suratKeluarCreated.count} surat keluar`);
    console.log(
      `   📍 ${suratMasukList.length + suratKeluarList.length} tracking records`
    );
    console.log(`   📋 ${disposisiCreated.count} disposisi`);
    console.log(`   ⚙️  ${settingsCreated.count} settings`);
    console.log("\n🔐 Test Credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Email: admin@amanat.id\n");
    console.log("   Atau gunakan user lain:");
    console.log("   Username: ketua_pengurus");
    console.log("   Password: user123\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder
main();
