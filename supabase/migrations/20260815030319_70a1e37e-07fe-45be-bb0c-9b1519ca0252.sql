
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  prof_id uuid not null references auth.users(id) on delete cascade,
  titre text not null default 'Classe virtuelle',
  lesson_id uuid references public.curriculum_lessons(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  current_step integer not null default 0,
  activity jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.live_sessions to authenticated;
grant all on public.live_sessions to service_role;
alter table public.live_sessions enable row level security;

create policy "live_sessions_owner_all" on public.live_sessions
  for all to authenticated
  using (public.is_class_owner(class_id, prof_id) and prof_id = (select auth.uid()))
  with check (public.is_class_owner(class_id, prof_id) and prof_id = (select auth.uid()));

create policy "live_sessions_member_select" on public.live_sessions
  for select to authenticated
  using (public.is_class_member(class_id, (select auth.uid())));

create trigger live_sessions_updated_at before update on public.live_sessions
  for each row execute function public.update_updated_at_column();

create table public.live_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  left_at timestamptz,
  present boolean not null default true,
  exits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, student_id)
);

grant select, insert, update on public.live_attendance to authenticated;
grant all on public.live_attendance to service_role;
alter table public.live_attendance enable row level security;

create policy "live_attendance_self_insert" on public.live_attendance
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.live_sessions s
      where s.id = session_id and public.is_class_member(s.class_id, (select auth.uid()))
    )
  );

create policy "live_attendance_self_update" on public.live_attendance
  for update to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

create policy "live_attendance_select" on public.live_attendance
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.live_sessions s
      where s.id = session_id and s.prof_id = (select auth.uid())
    )
  );

create trigger live_attendance_updated_at before update on public.live_attendance
  for each row execute function public.update_updated_at_column();

alter table public.class_messages
  add column if not exists attachment_path text,
  add column if not exists attachment_mime text,
  add column if not exists attachment_name text,
  add column if not exists kind text not null default 'texte',
  add column if not exists reply_to uuid references public.class_messages(id) on delete set null;

alter publication supabase_realtime add table public.live_sessions;
alter publication supabase_realtime add table public.live_attendance;
