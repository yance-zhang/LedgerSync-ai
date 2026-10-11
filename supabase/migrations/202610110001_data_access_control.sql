-- Core tenant model for LedgerSync AI.
-- Storage object names are: <organization_id>/<document_id>/<filename>.
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 160),
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_id_idx on public.organization_members (user_id, organization_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete restrict,
  file_name text not null check (
    length(trim(file_name)) between 1 and 255
    and position('/' in file_name) = 0
    and position(chr(92) in file_name) = 0
  ),
  storage_path text not null unique,
  content_type text not null check (content_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 26214400),
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'needs_review', 'confirmed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_storage_path_matches_id check (storage_path = organization_id::text || '/' || id::text || '/' || file_name)
);
create index documents_organization_created_at_idx on public.documents (organization_id, created_at desc);

-- SECURITY DEFINER predicates avoid recursive RLS on organization_members.
create function public.is_organization_member(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
  );
$$;

create function public.has_organization_role(target_organization_id uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.role = any (allowed_roles)
  );
$$;
revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.has_organization_role(uuid, text[]) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, text[]) to authenticated;

create function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create function public.add_organization_creator_as_owner()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.organization_members (organization_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;
create trigger organization_creator_membership after insert on public.organizations
for each row execute function public.add_organization_creator_as_owner();

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.add_organization_creator_as_owner() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.documents enable row level security;

-- Do not rely on project-wide default privileges for application access.
revoke all on public.profiles, public.organizations, public.organization_members, public.documents
  from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.organizations to authenticated;
grant select on public.organization_members to authenticated;
grant select, insert, update, delete on public.documents to authenticated;

create policy "Users can read their own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy "Users can create their own profile" on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
create policy "Users can update their own profile" on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Members can read their organizations" on public.organizations
for select to authenticated using (public.is_organization_member(id));
create policy "Authenticated users can create organizations" on public.organizations
for insert to authenticated with check (created_by = (select auth.uid()));
create policy "Owners and admins can update organizations" on public.organizations
for update to authenticated using (public.has_organization_role(id, array['owner', 'admin']))
with check (public.has_organization_role(id, array['owner', 'admin']));
create policy "Owners can delete organizations" on public.organizations
for delete to authenticated using (public.has_organization_role(id, array['owner']));

create policy "Members can read organization membership" on public.organization_members
for select to authenticated using (public.is_organization_member(organization_id));
-- Membership writes are intentionally unavailable to clients until a controlled
-- invitation and role-management RPC is added.

create policy "Members can read organization documents" on public.documents
for select to authenticated using (public.is_organization_member(organization_id));
create policy "Editors can add organization documents" on public.documents
for insert to authenticated with check (
  uploaded_by = (select auth.uid())
  and public.has_organization_role(organization_id, array['owner', 'admin', 'member'])
);
create policy "Editors can update organization documents" on public.documents
for update to authenticated using (public.has_organization_role(organization_id, array['owner', 'admin', 'member']))
with check (public.has_organization_role(organization_id, array['owner', 'admin', 'member']));
create policy "Editors can delete organization documents" on public.documents
for delete to authenticated using (public.has_organization_role(organization_id, array['owner', 'admin', 'member']));

-- Private bucket. Create the document row before uploading its object.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 26214400, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set name = excluded.name, public = false,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Members can read files for accessible documents" on storage.objects
for select to authenticated using (
  bucket_id = 'documents' and exists (
    select 1 from public.documents document
    where document.id::text = (storage.foldername(name))[2]
      and document.organization_id::text = (storage.foldername(name))[1]
      and document.storage_path = name
      and public.is_organization_member(document.organization_id)
  )
);
create policy "Editors can upload files for their documents" on storage.objects
for insert to authenticated with check (
  bucket_id = 'documents' and exists (
    select 1 from public.documents document
    where document.id::text = (storage.foldername(name))[2]
      and document.organization_id::text = (storage.foldername(name))[1]
      and document.storage_path = name
      and document.uploaded_by = (select auth.uid())
      and public.has_organization_role(document.organization_id, array['owner', 'admin', 'member'])
  )
);
create policy "Editors can update files for their documents" on storage.objects
for update to authenticated using (
  bucket_id = 'documents' and exists (
    select 1 from public.documents document
    where document.id::text = (storage.foldername(name))[2]
      and document.organization_id::text = (storage.foldername(name))[1]
      and document.storage_path = name
      and public.has_organization_role(document.organization_id, array['owner', 'admin', 'member'])
  )
) with check (
  bucket_id = 'documents' and exists (
    select 1 from public.documents document
    where document.id::text = (storage.foldername(name))[2]
      and document.organization_id::text = (storage.foldername(name))[1]
      and document.storage_path = name
      and public.has_organization_role(document.organization_id, array['owner', 'admin', 'member'])
  )
);
create policy "Editors can delete files for their documents" on storage.objects
for delete to authenticated using (
  bucket_id = 'documents' and exists (
    select 1 from public.documents document
    where document.id::text = (storage.foldername(name))[2]
      and document.organization_id::text = (storage.foldername(name))[1]
      and document.storage_path = name
      and public.has_organization_role(document.organization_id, array['owner', 'admin', 'member'])
  )
);
