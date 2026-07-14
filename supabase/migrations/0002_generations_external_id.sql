-- Üretim kayıtları artık sağlayıcı-bağımsız: replicate_prediction_id → external_id
alter table public.generations rename column replicate_prediction_id to external_id;
alter index if exists generations_prediction_idx rename to generations_external_id_idx;
