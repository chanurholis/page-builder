# Page Builder MVP

Public page builder — Nuxt 4 + PostgreSQL + Drizzle ORM.  
Signup → buat halaman → publish → track kunjungan & klik.

## Quickstart

### 1. Install dependencies

```bash
yarn install
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env — isi DATABASE_URL dan NUXT_SESSION_PASSWORD (min 32 chars)
```

### 3. PostgreSQL Docker (opsional)

```bash
docker compose up -d
```

### 4. Migration

```bash
yarn db:generate
yarn db:migrate
```

### 5. Dev server

```bash
yarn dev
# → http://localhost:3000
```

---

## User flow

```
/ (landing)
  → /signup          daftar email + password + username
  → /login           masuk
  → /dashboard       list halaman
  → /dashboard/pages/:id/editor    edit profil + link, publish
  → /dashboard/pages/:id/analytics total visits, clicks, CTR, tabel
  → /:username       halaman publik (akses tanpa login)
  → /r/:linkId       redirect + catat klik
```

## Scripts

| Script | Keterangan |
|---|---|
| `yarn dev` | Dev server |
| `yarn build` | Production build |
| `yarn db:generate` | Generate SQL migration dari schema |
| `yarn db:migrate` | Jalankan migration |
| `yarn db:studio` | Drizzle Studio (DB GUI) |

## Tech Stack

- **Nuxt 4** + TypeScript strict
- **Nitro** server routes
- **PostgreSQL** + **Drizzle ORM**
- **nuxt-auth-utils** — sealed cookie session + password hashing
- **Zod** — validasi semua request body
- **Tailwind CSS**
