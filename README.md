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

```bash
npm run dev
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
