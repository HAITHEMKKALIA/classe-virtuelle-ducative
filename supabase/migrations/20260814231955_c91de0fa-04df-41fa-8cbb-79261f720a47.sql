create or replace function public.join_class_by_code(_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  _class_id uuid;
begin
  if auth.uid() is null then
    return false;
  end if;

  select id into _class_id
  from public.classes
  where upper(code_invitation) = upper(_code)
  limit 1;

  if _class_id is null then
    return false;
  end if;

  insert into public.class_members (class_id, student_id, status)
  values (_class_id, auth.uid(), 'pending')
  on conflict (class_id, student_id) do nothing;

  return true;
end;
$$;

grant execute on function public.join_class_by_code(text) to authenticated;