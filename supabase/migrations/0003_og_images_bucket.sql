insert into storage.buckets (id, name, public)
values ('og-images', 'og-images', true)
on conflict (id) do nothing;

create policy "og-images public read"
  on storage.objects for select
  using (bucket_id = 'og-images');
