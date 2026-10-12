alter table public.documents
  add column parsed_data jsonb,
  add column reviewed_data jsonb,
  add column processing_error text;

alter table public.documents
  add constraint documents_parsed_data_is_object
    check (parsed_data is null or jsonb_typeof(parsed_data) = 'object'),
  add constraint documents_reviewed_data_is_object
    check (reviewed_data is null or jsonb_typeof(reviewed_data) = 'object');

comment on column public.documents.parsed_data is
  'AI-extracted invoice fields awaiting human review.';
comment on column public.documents.reviewed_data is
  'Human-reviewed invoice fields approved for downstream use.';
comment on column public.documents.processing_error is
  'Safe user-facing extraction failure detail.';
