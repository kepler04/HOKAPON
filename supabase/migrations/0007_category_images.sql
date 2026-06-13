-- =============================================================
-- 0007_category_images.sql
-- Category images: add image_url column + a public Storage bucket.
--
--   • categories.image_url : path inside the category-images bucket.
--   • category-images      : PUBLIC read, staff-only write (mirrors product-images).
-- =============================================================

-- 1) Column on categories (stores the Storage object path, e.g. "<id>/<uuid>.webp")
alter table public.categories
  add column if not exists image_url text;

-- 2) Public bucket for category images
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- ---------------- category-images policies ----------------
drop policy if exists "category_images_public_read" on storage.objects;
create policy "category_images_public_read"
  on storage.objects for select
  using (bucket_id = 'category-images');

drop policy if exists "category_images_staff_insert" on storage.objects;
create policy "category_images_staff_insert"
  on storage.objects for insert
  with check (bucket_id = 'category-images' and public.is_staff());

drop policy if exists "category_images_staff_update" on storage.objects;
create policy "category_images_staff_update"
  on storage.objects for update
  using (bucket_id = 'category-images' and public.is_staff());

drop policy if exists "category_images_staff_delete" on storage.objects;
create policy "category_images_staff_delete"
  on storage.objects for delete
  using (bucket_id = 'category-images' and public.is_staff());
