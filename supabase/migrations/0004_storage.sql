-- =============================================================
-- 0004_storage.sql
-- Storage buckets + policies
--
--   • product-images : PUBLIC read, staff-only write.
--   • payment-proofs : PRIVATE (no public read), staff-only access.
-- =============================================================

-- Create buckets (id, name, public)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- ---------------- product-images policies ----------------
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_staff_insert" on storage.objects;
create policy "product_images_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "product_images_staff_update" on storage.objects;
create policy "product_images_staff_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "product_images_staff_delete" on storage.objects;
create policy "product_images_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_staff());

-- ---------------- payment-proofs policies (private) ----------------
-- Only staff may read/write proofs. Customers upload via WhatsApp instead,
-- so no public/anon access is granted here.
drop policy if exists "payment_proofs_staff_all" on storage.objects;
create policy "payment_proofs_staff_all"
  on storage.objects for all
  using (bucket_id = 'payment-proofs' and public.is_staff())
  with check (bucket_id = 'payment-proofs' and public.is_staff());
