-- Görselden video üretimi (image-to-video): video, hangi görsel üretiminden
-- türetildiyse onu izler. Kaynak silinirse bağ kopar ama video kalır.
alter table public.generations
  add column source_generation_id uuid references public.generations (id) on delete set null;

create index generations_source_idx on public.generations (source_generation_id);
