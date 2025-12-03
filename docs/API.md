# Dokumentasi API AMANAT System

## Base URL

```
http://localhost:5001/api
```

## Authentication

Semua endpoint (kecuali login) memerlukan Bearer Token di header:

```
Authorization: Bearer <token>
```

---

## 📋 Daftar Endpoint

### 1. Authentication (`/auth`)

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}

Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

#### Register (Admin Only)

```
POST /auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama_lengkap": "Nama User",
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "role": "ADMIN|KETUA_PENGURUS|SEKRETARIS_PENGURUS|BENDAHARA_PENGURUS|KEPALA_BAGIAN_PSDM|KEPALA_BAGIAN_KEUANGAN|KEPALA_BAGIAN_UMUM",
  "kodeBagian": "PSDM",
  "jabatan": "Kepala Bagian",
  "phone": "08123456789",
  "isActive": true
}
```

#### Get Current User

```
GET /auth/me
Authorization: Bearer <token>
```

#### Change Password

```
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "oldpass",
  "newPassword": "newpass"
}
```

#### Update Profile

```
PUT /auth/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "id": "user-id",
  "nama_lengkap": "Nama Baru",
  "email": "email@baru.com",
  "phone": "08987654321"
}
```

---

### 2. User Management (`/users`)

#### List Users (Admin Only)

```
GET /users?page=1&limit=10&search=nama&role=ADMIN&isActive=true
Authorization: Bearer <token>
```

#### Get User by ID

```
GET /users/:id
Authorization: Bearer <token>
```

#### Get Users by Role

```
GET /users/by-role/ADMIN?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Users by Bagian

```
GET /users/by-bagian/PSDM?page=1&limit=10
Authorization: Bearer <token>
```

#### Update User (Admin Only)

```
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nama_lengkap": "Nama Baru",
  "email": "email@baru.com",
  "role": "SEKRETARIS_PENGURUS",
  "phone": "08123456789"
}
```

#### Update User Status (Admin Only)

```
PUT /users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": true
}
```

#### Delete User (Admin Only)

```
DELETE /users/:id
Authorization: Bearer <token>
```

---

### 3. Surat Masuk (`/surat-masuk`)

#### List Surat Masuk

```
GET /surat-masuk?page=1&limit=10&search=nomor&status=DITERIMA&kategori=UNDANGAN
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10)
- `search`: Cari berdasarkan nomorSurat, perihal, asalSurat
- `status`: DITERIMA, DIPROSES, DISPOSISI_KETUA, DISPOSISI_SEKPENGURUS, DISPOSISI_KABAG, SELESAI
- `kategori`: UNDANGAN, PERMOHONAN, PEMBERITAHUAN, VERIFIKASI, AUDIT, LAINNYA

#### Get Detail Surat Masuk

```
GET /surat-masuk/:id
Authorization: Bearer <token>
```

#### Create Surat Masuk

```
POST /surat-masuk
Authorization: Bearer <token>
Content-Type: application/json

{
  "nomorSurat": "001/PSDM/2024",
  "tanggalSurat": "2024-12-01T10:00:00Z",
  "tanggalDiterima": "2024-12-02T14:30:00Z",
  "asalSurat": "Dinas Pendidikan",
  "perihal": "Permintaan data siswa",
  "kategori": "PERMOHONAN",
  "namaPengirim": "Budi Santoso",
  "status": "DITERIMA"
}
```

#### Update Surat Masuk

```
PUT /surat-masuk/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "DIPROSES"
}
```

#### Delete Surat Masuk

```
DELETE /surat-masuk/:id
Authorization: Bearer <token>
```

---

### 4. Surat Keluar (`/surat-keluar`)

#### List Surat Keluar

```
GET /surat-keluar?page=1&limit=10&search=nomor&status=DRAFT
Authorization: Bearer <token>
```

#### Get Detail Surat Keluar

```
GET /surat-keluar/:id
Authorization: Bearer <token>
```

#### Create Surat Keluar

```
POST /surat-keluar
Authorization: Bearer <token>
Content-Type: application/json

{
  "nomorSurat": "001/UPT-PIK/2024",
  "tanggalSurat": "2024-12-01T10:00:00Z",
  "tujuanSurat": "Dinas Kesehatan",
  "perihal": "Permintaan kerjasama",
  "kategori": "UNDANGAN",
  "catatan": "Catatan penting"
}
```

**Status Workflow:**

- DRAFT → REVIEW_SEKPENGURUS → LAMPIRAN_KABAG → REVIEW_KETUA → TERKIRIM

#### Update Surat Keluar

```
PUT /surat-keluar/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "perihal": "Perihal baru",
  "tujuanSurat": "Tujuan baru"
}
```

#### Update Status Surat Keluar

```
PUT /surat-keluar/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "REVIEW_SEKPENGURUS"
}
```

#### Delete Surat Keluar (Hanya DRAFT)

```
DELETE /surat-keluar/:id
Authorization: Bearer <token>
```

---

### 5. Disposisi (`/disposisi`)

#### List Disposisi

```
GET /disposisi?page=1&limit=10&status=PENDING&toUserId=user-id
Authorization: Bearer <token>
```

#### Get Disposisi by ID

```
GET /disposisi/:id
Authorization: Bearer <token>
```

#### Get Disposisi for User

```
GET /disposisi/user/:userId?page=1&limit=10&status=PENDING
Authorization: Bearer <token>
```

#### Create Disposisi

```
POST /disposisi
Authorization: Bearer <token>
Content-Type: application/json

{
  "suratMasukId": "surat-id",
  "suratKeluarId": null,
  "toUserId": "user-id",
  "instruksi": "Mohon proses dan berikan hasil",
  "jenisDispo": "TRANSFER|REQUEST_LAMPIRAN|APPROVAL|REVISI",
  "tahapProses": "DIPROSES",
  "tenggatWaktu": "2024-12-10T17:00:00Z"
}
```

#### Update Disposisi

```
PUT /disposisi/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "instruksi": "Instruksi diperbarui",
  "tenggatWaktu": "2024-12-15T17:00:00Z"
}
```

#### Update Status Disposisi

```
PUT /disposisi/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "DITERIMA|DIPROSES|SELESAI|DITOLAK"
}
```

#### Delete Disposisi (Hanya PENDING)

```
DELETE /disposisi/:id
Authorization: Bearer <token>
```

---

### 6. Lampiran (`/lampiran`)

#### Get Lampiran Surat Masuk

```
GET /lampiran/surat-masuk/:suratMasukId
Authorization: Bearer <token>
```

#### Get Lampiran Surat Keluar

```
GET /lampiran/surat-keluar/:suratKeluarId
Authorization: Bearer <token>
```

#### Get Lampiran by ID

```
GET /lampiran/:id
Authorization: Bearer <token>
```

#### Upload Lampiran Surat Masuk

```
POST /lampiran/surat-masuk/:suratMasukId
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [file_object]
- keterangan: "Keterangan lampiran (optional)"
```

#### Upload Lampiran Surat Keluar

```
POST /lampiran/surat-keluar/:suratKeluarId
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: [file_object]
- keterangan: "Keterangan lampiran (optional)"
```

#### Update Keterangan Lampiran

```
PUT /lampiran/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "keterangan": "Keterangan baru"
}
```

#### Delete Lampiran

```
DELETE /lampiran/:id
Authorization: Bearer <token>
```

---

### 7. Tracking Surat (`/tracking`)

#### Get Tracking Surat Masuk

```
GET /tracking/surat-masuk/:suratMasukId
Authorization: Bearer <token>
```

#### Get Tracking Surat Keluar

```
GET /tracking/surat-keluar/:suratKeluarId
Authorization: Bearer <token>
```

#### Get Tracking by ID

```
GET /tracking/:id
Authorization: Bearer <token>
```

#### Create Tracking Record

```
POST /tracking
Authorization: Bearer <token>
Content-Type: application/json

{
  "suratMasukId": "surat-id",
  "suratKeluarId": null,
  "tahapProses": "DIPROSES",
  "posisiSaat": "SEKRETARIS_KANTOR",
  "aksiDilakukan": "Melakukan verifikasi dokumen",
  "statusTracking": "PROSES"
}
```

#### Get Tracking Stats by Tahap

```
GET /tracking/stats/:tahapProses
Authorization: Bearer <token>
```

---

## 🔐 Role dan Akses

### Available Roles:

- `ADMIN` - Admin sistem (Sekretaris Kantor)
- `KETUA_PENGURUS` - Ketua Yayasan
- `SEKRETARIS_PENGURUS` - Sekretaris Pengurus
- `BENDAHARA_PENGURUS` - Bendahara
- `KEPALA_BAGIAN_PSDM` - Kepala Bagian PSDM
- `KEPALA_BAGIAN_KEUANGAN` - Kepala Bagian Keuangan
- `KEPALA_BAGIAN_UMUM` - Kepala Bagian Umum

### Role-based Access Control:

| Endpoint           | ADMIN | KETUA | SEKPENGURUS | BENDAHARA | KABAG |
| ------------------ | ----- | ----- | ----------- | --------- | ----- |
| POST /surat-keluar | ✅    | ❌    | ✅          | ❌        | ❌    |
| POST /disposisi    | ✅    | ✅    | ✅          | ❌        | ❌    |
| PUT /users         | ✅    | ❌    | ❌          | ❌        | ❌    |
| DELETE /users      | ✅    | ❌    | ❌          | ❌        | ❌    |

---

## 📝 Workflow Surat Masuk (6 Tahap)

1. **DITERIMA** - Sekretaris Kantor menerima surat
2. **DIPROSES** - Sekretaris Kantor verifikasi & data entry
3. **DISPOSISI_KETUA** - Ketua review & buat disposisi
4. **DISPOSISI_SEKPENGURUS** - Sekpengurus koordinasi & disposisi
5. **DISPOSISI_KABAG** - Kabag proses & upload hasil
6. **SELESAI** - Diarsipkan

---

## 📝 Workflow Surat Keluar (5 Tahap)

1. **DRAFT** - Sekretaris Kantor buat draft
2. **REVIEW_SEKPENGURUS** - Sekpengurus review
3. **LAMPIRAN_KABAG** - Kabag upload lampiran (opsional)
4. **REVIEW_KETUA** - Ketua review & TTD
5. **TERKIRIM** - Final & diarsipkan

---

## 📊 Status Disposisi

- `PENDING` - Belum dibaca/diproses
- `DITERIMA` - Sudah diterima
- `DIPROSES` - Sedang diproses
- `SELESAI` - Selesai
- `DITOLAK` - Ditolak/dikembalikan

---

## ✅ Health Check

```
GET /health
```

Response:

```json
{
  "success": true,
  "status": "healthy",
  "message": "API is running",
  "timestamp": "2024-12-01T10:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## 🚀 Error Handling

Semua error response mengikuti format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email sudah digunakan"
    }
  ]
}
```

### Common HTTP Status Codes:

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## 💡 Tips

1. Selalu sertakan `Authorization: Bearer <token>` untuk request yang memerlukan autentikasi
2. Gunakan `multipart/form-data` untuk upload file
3. Tanggal menggunakan format ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`
4. Pagination default: `page=1, limit=10`
5. Gunakan endpoint `/health` untuk mengecek status API
