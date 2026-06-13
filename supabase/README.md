# Supabase — Tienda YienKid

SQL migrations and config for the database layer (Fase 1).

## Migration order

| File | Purpose |
|------|---------|
| `0001_init_schema.sql` | Tables, indexes, foreign keys |
| `0002_functions_triggers.sql` | Order-number sequence, `handle_new_user`, `updated_at`, `is_staff()` |
| `0003_rls_policies.sql` | Row Level Security on every table |
| `0004_storage.sql` | Storage buckets (`product-images` public, `payment-proofs` private) + policies |
| `0005_seed.sql` | Demo categories & products |

## How to apply

### Option A — Supabase Dashboard (fastest for a hosted project)
1. Create a project at https://supabase.com → copy the **Project URL**, **anon key**, **service_role key** into `.env.local`.
2. Open **SQL Editor** and run each file **in order** (0001 → 0005).
3. Done. Verify in **Table Editor** that the 7 tables and 2 buckets exist.

### Option B — Supabase CLI (recommended for versioning)
```bash
npm i -g supabase            # or: npx supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push             # applies everything in migrations/
```

### Generate TypeScript types (after applying)
```bash
supabase gen types typescript --project-id <your-project-ref> > src/types/database.types.ts
```
> Until you run this, `src/types/database.types.ts` is the hand-written placeholder
> that already mirrors the schema, so the app compiles fine.

## Create the admin user
Auth self-signup is disabled. Create the admin manually:

```bash
# Dashboard: Authentication → Users → Add user (email + password)
# Then promote them in SQL Editor:
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@tu-dominio.com');
```

The `handle_new_user` trigger auto-creates the `profiles` row on signup; you only
need to bump the role to `admin`.
