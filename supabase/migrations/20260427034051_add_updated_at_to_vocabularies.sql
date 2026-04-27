-- Timestamps: created_at, updated_at (with auto-update trigger), deleted_at (soft delete)

alter table vocabularies
  add column created_at  timestamptz not null default now(),
  add column updated_at  timestamptz not null default now(),
  add column deleted_at  timestamptz;

-- Auto-refresh updated_at on every UPDATE
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vocabularies_set_updated_at
  before update on vocabularies
  for each row execute procedure set_updated_at();

-- Index to efficiently filter out soft-deleted rows
create index vocabularies_deleted_at_idx on vocabularies (deleted_at)
  where deleted_at is null;
