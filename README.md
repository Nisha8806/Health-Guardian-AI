# Backend (Node.js + Express + PostgreSQL)

Real, standalone backend — replaces Supabase entirely. Handles auth (JWT + bcrypt),
all CRUD APIs, and file uploads (avatars, prescription images) saved to local disk.

## Setup

```bash
cd backend
npm install
cp .env.example .env      # edit DATABASE_URL and JWT_SECRET
npm run dev                # starts on http://localhost:4000
```

Make sure the `database/schema.sql` has been applied to your Postgres instance first
(see `../database/README.md`).

## API overview

| Method | Route                              | Auth | Description                        |
|--------|-------------------------------------|------|-------------------------------------|
| POST   | /api/auth/signup                    | no   | Create account                      |
| POST   | /api/auth/login                     | no   | Login, returns JWT                  |
| GET    | /api/auth/me                        | yes  | Current user + profile              |
| PUT    | /api/profile                        | yes  | Update profile                      |
| POST   | /api/profile/avatar                 | yes  | Upload avatar (multipart)           |
| GET    | /api/family-members                 | yes  | List family members                 |
| POST   | /api/family-members                 | yes  | Add family member                   |
| DELETE | /api/family-members/:id             | yes  | Remove family member                |
| GET    | /api/family-members/:id/stats       | yes  | Active meds + scheduled checkups    |
| GET    | /api/family-members/:id/medicines   | yes  | Active medicines for member         |
| GET    | /api/family-members/:id/checkups    | yes  | Scheduled checkups for member       |
| GET    | /api/medicines?reminders=today      | yes  | List medicines (+today's reminders) |
| POST   | /api/medicines                      | yes  | Add medicine                        |
| PUT    | /api/medicines/:id                  | yes  | Update medicine                     |
| DELETE | /api/medicines/:id                  | yes  | Delete medicine                     |
| GET    | /api/health-checkups?upcoming=true  | yes  | List checkups                       |
| POST   | /api/health-checkups                | yes  | Add checkup                         |
| PATCH  | /api/health-checkups/:id/status     | yes  | Update status                       |
| DELETE | /api/health-checkups/:id            | yes  | Delete checkup                      |
| GET    | /api/prescriptions                  | yes  | List prescriptions                  |
| POST   | /api/prescriptions                  | yes  | Add prescription (multipart)        |
| DELETE | /api/prescriptions/:id              | yes  | Delete prescription                 |
| GET    | /api/chat-history                   | yes  | List chat messages                  |
| POST   | /api/chat-history                   | yes  | Add chat message                    |
| DELETE | /api/chat-history                   | yes  | Clear chat history                  |
| GET    | /api/dashboard                      | yes  | Aggregated dashboard stats           |

All authenticated routes need header: `Authorization: Bearer <token>`.

Uploaded files are served back at `http://localhost:4000/uploads/...`.

# Database (PostgreSQL)

Plain PostgreSQL schema — no Supabase dependency.

## Setup

1. Install PostgreSQL (or use Docker):
   ```bash
   docker run --name health-guardian-db -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=health_guardian -p 5432:5432 -d postgres:16
   ```

2. Create the schema:
   ```bash
   psql -h localhost -U postgres -d health_guardian -f schema.sql
   ```
   (with Docker: `docker exec -i health-guardian-db psql -U postgres -d health_guardian < schema.sql`)

3. Point the backend at it — set `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/health_guardian
   ```

## Tables
`users`, `profiles`, `family_members`, `medicines`, `medicine_reminders`,
`prescriptions`, `health_checkups`, `chat_history`.

Auth is handled entirely by the backend (bcrypt password hashing + JWT) — there is
no `auth.users` magic table like Supabase; the `users` table here is a normal table
owned by your own backend.

# Health Guardian AI — Frontend / Backend / Database

Supabase-ah remove pannitu, **real, separate 3-tier architecture** create panniyaachu:

```
frontend/   → React + Vite + TypeScript + Tailwind (UI only, no direct DB access)
backend/    → Node.js + Express REST API (auth, business logic, file uploads)
database/   → Plain PostgreSQL schema (no Supabase-specific features)
```

Frontend ippo directly database-ah touch pannadhu — everything goes through
`backend/`'s REST API over HTTP, JWT token vachu authenticate pannudhu.

## Quick start (order matters)

### 1. Database
```bash
cd database
# start Postgres (Docker example)
docker run --name health-guardian-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=health_guardian -p 5432:5432 -d postgres:16
# apply schema
docker exec -i health-guardian-db psql -U postgres -d health_guardian < schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # set DATABASE_URL + JWT_SECRET
npm run dev                # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:4000
npm run dev                # http://localhost:5173
```

## What changed vs. the Supabase version
- **Auth**: bcrypt password hashing + JWT, handled entirely in `backend/src/routes/auth.js`
  (previously Supabase Auth).
- **Data access**: every page (`Dashboard`, `MedicineReminder`, `FamilyHealth`,
  `HealthCheckupReminder`, `PrescriptionScanner`, `Profile`, `AIChatbot`) now calls
  `frontend/src/lib/api.ts` → REST endpoints, instead of `supabase.from(...)`.
- **File storage**: avatar + prescription images are uploaded via `multipart/form-data`
  to the backend (`multer`), stored on local disk under `backend/uploads/`, and served
  back at `/uploads/...` — instead of Supabase Storage buckets.
- **Database**: `supabase/migrations/*.sql` (which relied on `auth.users` and Row Level
  Security) was rewritten into a standalone `database/schema.sql` with its own `users`
  table, since RLS + `auth.users` are Supabase-specific and don't exist in plain Postgres.

Each folder has its own `README.md` with more detail — see `frontend/README.md` (if
present), `backend/README.md`, and `database/README.md`.

## Note on production readiness
This is a solid, working starting point (JWT auth, password hashing, file uploads,
full CRUD matching the original app's features). Before shipping to real users you'd
still want to add things like: refresh tokens, rate limiting, input validation
(e.g. zod), stricter file-type checks on uploads, and moving file storage to something
like S3 instead of local disk.
