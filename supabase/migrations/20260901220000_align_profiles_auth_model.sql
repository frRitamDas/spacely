-- Spacely auth/profile hardening: one auth trigger and user_id-based RLS.
drop trigger if exists auth_user_profile on auth.users;
drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare base text; candidate text;
begin
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', 'user'), '[^a-z0-9_]', '', 'g'));
  if char_length(base) < 3 then base := 'user'; end if;
  base := left(base, 20);
  candidate := left(base, 11) || '_' || substr(replace(new.id::text, '-', ''), 1, 8);
  insert into public.profiles (user_id, username, display_name)
  values (new.id, candidate, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'New Explorer'))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

drop policy if exists "Users can delete their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "profiles_select_any" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "profiles_delete_self" on public.profiles;

create policy "profiles_select_any" on public.profiles for select to anon, authenticated using (true);
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy "profiles_update_self" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles_delete_self" on public.profiles for delete to authenticated using (user_id = auth.uid());
