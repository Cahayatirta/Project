# CogniCare Backend Setup

Setup awal backend menggunakan Express.js, PostgreSQL, dan JWT authentication.

## 1. Install dependency

```bash
npm install
```

## 2. Siapkan environment

Salin `.env.example` menjadi `.env`, lalu isi sesuai PostgreSQL lokal Anda.

## 3. Buat database PostgreSQL

Buat database bernama `cognicare`, lalu jalankan file SQL berikut:

```sql
database/init.sql
```

## 4. Jalankan server

Jalankan backend saja:

```bash
npm run dev
```

Atau jalankan backend dan frontend secara bersamaan:

```bash
npm run dev:all
```

Frontend akan berjalan di `http://localhost:5173` (atau port berikutnya jika ada yang terpakai) dan backend di `http://localhost:5001`.

## Integrasi model AI activity

Endpoint `POST /api/activities` dan `PATCH /api/activities/:activityId` sekarang memakai model AI dari folder `Model Ai/model` untuk menghasilkan `stressStatus` secara otomatis.

Jika command Python lokal Anda bukan `python`, atur di `.env`:

```bash
AI_PYTHON_COMMAND=python
```

## Utility database

Reset schema database:

```bash
npm run db:reset
```

Reset lalu migrate dan seed ulang:

```bash
npm run db:refresh
```

## Struktur folder utama

- `src/config`: environment dan database
- `src/middlewares`: auth dan error handling
- `src/modules`: dipisah per fitur
- `src/routes`: registry semua route API
- `src/utils`: helper umum
- `database`: schema SQL awal

## Endpoint auth awal

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
