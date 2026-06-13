-- Admin audit log: records who did what and when in the admin panel.
-- Staff-only read; writes happen via the service_role client in server actions.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,          -- e.g. 'user.create', 'user.delete', 'payment.confirm'
  entity text,                   -- affected entity type, e.g. 'user', 'order'
  entity_id text,                -- affected entity id (free-form)
  summary text,                  -- human-readable description (Spanish)
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx
  on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

-- Staff/admin can read the log.
drop policy if exists "audit_log staff read" on public.audit_log;
create policy "audit_log staff read"
  on public.audit_log for select
  using (public.is_staff());

-- No client writes: entries are inserted by the service_role client only
-- (which bypasses RLS). We intentionally add no INSERT policy.
