drop policy if exists "Members can read their organizations" on public.organizations;

create policy "Members can read their organizations" on public.organizations
for select to authenticated
using (
  public.is_organization_member(id)
  or created_by = (select auth.uid())
);
