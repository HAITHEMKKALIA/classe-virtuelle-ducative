-- Les élèves peuvent modifier uniquement leurs informations de présentation.
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, avatar_url, niveau) on public.profiles to authenticated;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_scoped_select" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or (select public.has_role((select auth.uid()), 'super_admin'))
  or exists (
    select 1
    from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.student_id = profiles.id
      and c.prof_id = (select auth.uid())
  )
);

drop policy if exists "roles_select" on public.user_roles;
create policy "roles_select" on public.user_roles
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      _user_id = (select auth.uid())
      or exists (
        select 1
        from public.user_roles caller
        where caller.user_id = (select auth.uid())
          and caller.role = 'super_admin'
      )
    )
    and exists (
      select 1
      from public.user_roles target
      where target.user_id = _user_id
        and target.role = _role
    );
$$;

create or replace function public.is_class_owner(_class_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      _user_id = (select auth.uid())
      or exists (
        select 1 from public.user_roles
        where user_id = (select auth.uid()) and role = 'super_admin'
      )
    )
    and exists (
      select 1 from public.classes
      where id = _class_id and prof_id = _user_id
    );
$$;

create or replace function public.is_class_member(_class_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      _user_id = (select auth.uid())
      or exists (
        select 1 from public.user_roles
        where user_id = (select auth.uid()) and role = 'super_admin'
      )
    )
    and exists (
      select 1 from public.class_members
      where class_id = _class_id
        and student_id = _user_id
        and status = 'approved'
    );
$$;

create or replace function public.owns_assessment(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (
      _user_id = (select auth.uid())
      or exists (
        select 1 from public.user_roles
        where user_id = (select auth.uid()) and role = 'super_admin'
      )
    )
    and exists (
      select 1 from public.assessments
      where id = _assessment_id and prof_id = _user_id
    );
$$;

create or replace function public.can_take_assessment(_assessment_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    _user_id = (select auth.uid())
    and exists (
      select 1
      from public.assessments a
      join public.class_members m on m.class_id = a.class_id
      where a.id = _assessment_id
        and a.published
        and m.student_id = _user_id
        and m.status = 'approved'
        and (a.ouvre_at is null or a.ouvre_at <= now())
        and (a.ferme_at is null or a.ferme_at >= now())
    );
$$;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.is_class_owner(uuid, uuid) from public, anon;
revoke all on function public.is_class_member(uuid, uuid) from public, anon;
revoke all on function public.owns_assessment(uuid, uuid) from public, anon;
revoke all on function public.can_take_assessment(uuid, uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.is_class_owner(uuid, uuid) to authenticated, service_role;
grant execute on function public.is_class_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.owns_assessment(uuid, uuid) to authenticated, service_role;
grant execute on function public.can_take_assessment(uuid, uuid) to authenticated, service_role;

revoke all on function public.is_approved(uuid) from public, anon, authenticated;
grant execute on function public.is_approved(uuid) to service_role;

revoke all on function public.claim_super_admin() from public, anon, authenticated;
grant execute on function public.claim_super_admin() to service_role;

create or replace function public.join_class_by_code(_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_class_id uuid;
begin
  if (select auth.uid()) is null or _code !~ '^[A-Za-z0-9]{6}$' then
    return false;
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.requested_role = 'eleve'
  ) then
    return false;
  end if;

  select c.id into v_class_id
  from public.classes c
  where upper(c.code_invitation) = upper(_code)
  limit 1;

  if v_class_id is null then
    return false;
  end if;

  insert into public.class_members (class_id, student_id, status)
  values (v_class_id, (select auth.uid()), 'pending')
  on conflict (class_id, student_id) do nothing;

  return true;
end;
$$;

revoke all on function public.join_class_by_code(text) from public, anon;
grant execute on function public.join_class_by_code(text) to authenticated, service_role;

drop policy if exists "classes_update" on public.classes;
create policy "classes_update" on public.classes
for update to authenticated
using (
  prof_id = (select auth.uid())
  or (select public.has_role((select auth.uid()), 'super_admin'))
)
with check (
  (
    prof_id = (select auth.uid())
    and (select public.has_role((select auth.uid()), 'prof'))
  )
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

drop policy if exists "members_insert" on public.class_members;
create policy "members_insert" on public.class_members
for insert to authenticated
with check (
  (select public.is_class_owner(class_id, (select auth.uid())))
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

revoke update on public.class_members from authenticated;
grant update (status) on public.class_members to authenticated;

drop policy if exists "members_update" on public.class_members;
create policy "members_update" on public.class_members
for update to authenticated
using (
  (select public.is_class_owner(class_id, (select auth.uid())))
  or (select public.has_role((select auth.uid()), 'super_admin'))
)
with check (
  (select public.is_class_owner(class_id, (select auth.uid())))
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

drop policy if exists "courses_owner_all" on public.courses;
create policy "courses_owner_all" on public.courses
for all to authenticated
using (
  prof_id = (select auth.uid())
  or (select public.has_role((select auth.uid()), 'super_admin'))
)
with check (
  (
    prof_id = (select auth.uid())
    and (class_id is null or (select public.is_class_owner(class_id, (select auth.uid()))))
  )
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

drop policy if exists "assessments_owner_all" on public.assessments;
create policy "assessments_owner_all" on public.assessments
for all to authenticated
using (
  prof_id = (select auth.uid())
  or (select public.has_role((select auth.uid()), 'super_admin'))
)
with check (
  (
    prof_id = (select auth.uid())
    and class_id is not null
    and (select public.is_class_owner(class_id, (select auth.uid())))
  )
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

drop policy if exists "questions_student_read" on public.questions;

alter table public.submissions
  add column if not exists deadline_at timestamptz;

create or replace function public.get_assessment_questions_for_student(_assessment_id uuid)
returns table (
  id uuid,
  ordre integer,
  type text,
  enonce text,
  options jsonb,
  points numeric,
  image_url text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return;
  end if;

  if not exists (
       select 1
       from public.submissions s
       where s.assessment_id = _assessment_id
         and s.student_id = (select auth.uid())
         and s.status = 'en_cours'
         and s.deadline_at is not null
         and s.deadline_at >= now()
     )
     and not exists (
       select 1
       from public.submissions s
       join public.assessments a on a.id = s.assessment_id
       where s.assessment_id = _assessment_id
         and s.student_id = (select auth.uid())
         and s.status = 'graded'
         and a.resultats_publies
     ) then
    return;
  end if;

  return query
  select q.id, q.ordre, q.type, q.enonce, q.options, q.points,
         q.image_url
  from public.questions q
  where q.assessment_id = _assessment_id
  order by q.ordre;
end;
$$;

revoke all on function public.get_assessment_questions_for_student(uuid) from public, anon;
grant execute on function public.get_assessment_questions_for_student(uuid) to authenticated;

revoke insert, update on public.submissions from authenticated;
grant update (per_question, score, total, feedback, status, graded_at)
  on public.submissions to authenticated;

drop policy if exists "submissions_student_insert" on public.submissions;
drop policy if exists "submissions_student_update" on public.submissions;
drop policy if exists "submissions_student_select" on public.submissions;
drop policy if exists "submissions_select" on public.submissions;
drop policy if exists "submissions_teacher_update" on public.submissions;

create policy "submissions_select" on public.submissions
for select to authenticated
using (
  (
    student_id = (select auth.uid())
    and status = 'graded'
    and exists (
      select 1 from public.assessments a
      where a.id = assessment_id and a.resultats_publies
    )
  )
  or (select public.owns_assessment(assessment_id, (select auth.uid())))
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

create policy "submissions_teacher_update" on public.submissions
for update to authenticated
using (
  (select public.owns_assessment(assessment_id, (select auth.uid())))
  or (select public.has_role((select auth.uid()), 'super_admin'))
)
with check (
  (select public.owns_assessment(assessment_id, (select auth.uid())))
  or (select public.has_role((select auth.uid()), 'super_admin'))
);

create or replace function public.start_assessment(_assessment_id uuid)
returns table (submission_id uuid, remaining_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_status text;
  v_started timestamptz;
  v_deadline timestamptz;
  v_duration integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentification requise.';
  end if;

  if not public.can_take_assessment(_assessment_id, (select auth.uid()))
     and not exists (
       select 1
       from public.submissions s
       where s.assessment_id = _assessment_id
         and s.student_id = (select auth.uid())
         and s.status = 'en_cours'
     ) then
    raise exception 'Épreuve indisponible.';
  end if;

  select greatest(1, least(a.duree_minutes, 360))
  into v_duration
  from public.assessments a
  where a.id = _assessment_id;

  insert into public.submissions (assessment_id, student_id, status)
  values (_assessment_id, (select auth.uid()), 'en_cours')
  on conflict (assessment_id, student_id) do nothing;

  select s.id, s.status, s.started_at,
         coalesce(s.deadline_at, s.started_at + make_interval(mins => v_duration))
  into v_id, v_status, v_started, v_deadline
  from public.submissions s
  where s.assessment_id = _assessment_id
    and s.student_id = (select auth.uid());

  if v_status <> 'en_cours' then
    raise exception 'Cette copie a déjà été rendue.';
  end if;

  update public.submissions
  set deadline_at = v_deadline,
      last_saved_at = now()
  where id = v_id;

  if v_deadline <= now() then
    update public.submissions
    set status = 'submitted', submitted_at = now()
    where id = v_id;
    return query select v_id, 0;
    return;
  end if;

  return query
  select v_id, greatest(0, floor(extract(epoch from (v_deadline - now())))::integer);
end;
$$;

create or replace function public.save_assessment_progress(
  _submission_id uuid,
  _answers jsonb,
  _submit boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deadline timestamptz;
  v_should_submit boolean;
begin
  if jsonb_typeof(_answers) <> 'object' or octet_length(_answers::text) > 2000000 then
    raise exception 'Format de réponses invalide.';
  end if;

  select s.deadline_at
  into v_deadline
  from public.submissions s
  where s.id = _submission_id
    and s.student_id = (select auth.uid())
    and s.status = 'en_cours'
  for update;

  if not found then
    raise exception 'Copie introuvable ou déjà rendue.';
  end if;

  v_should_submit := _submit or v_deadline is null or v_deadline <= now();

  update public.submissions
  set answers = _answers,
      last_saved_at = now(),
      status = case when v_should_submit then 'submitted' else status end,
      submitted_at = case when v_should_submit then now() else submitted_at end
  where id = _submission_id;

  return jsonb_build_object(
    'submitted', v_should_submit,
    'remaining_seconds', greatest(0, floor(extract(epoch from (v_deadline - now())))::integer),
    'saved_at', now()
  );
end;
$$;

create or replace function public.log_assessment_event(
  _submission_id uuid,
  _event_type text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if _event_type not in (
    'sortie_page', 'copie', 'capture_ecran', 'raccourci_interdit',
    'plein_ecran_quitte', 'deconnexion', 'reconnexion'
  ) then
    return false;
  end if;

  update public.submissions s
  set cheat_events = case
        when jsonb_array_length(s.cheat_events) < 100
          then s.cheat_events || jsonb_build_array(
            jsonb_build_object('type', _event_type, 'at', now())
          )
        else s.cheat_events
      end,
      last_saved_at = now()
  where s.id = _submission_id
    and s.student_id = (select auth.uid())
    and s.status = 'en_cours';

  return found;
end;
$$;

revoke all on function public.start_assessment(uuid) from public, anon;
revoke all on function public.save_assessment_progress(uuid, jsonb, boolean) from public, anon;
revoke all on function public.log_assessment_event(uuid, text) from public, anon;
grant execute on function public.start_assessment(uuid) to authenticated;
grant execute on function public.save_assessment_progress(uuid, jsonb, boolean) to authenticated;
grant execute on function public.log_assessment_event(uuid, text) to authenticated;

drop policy if exists "lesson_steps_read" on public.lesson_steps;
drop policy if exists "lesson_steps_insert" on public.lesson_steps;
drop policy if exists "lesson_steps_update" on public.lesson_steps;
drop policy if exists "lesson_steps_delete" on public.lesson_steps;
drop policy if exists "lesson_steps_admin_insert" on public.lesson_steps;
drop policy if exists "lesson_steps_admin_update" on public.lesson_steps;
drop policy if exists "lesson_steps_admin_delete" on public.lesson_steps;

create policy "lesson_steps_read" on public.lesson_steps
for select to authenticated
using (
  (select public.has_role((select auth.uid()), 'super_admin'))
  or (
    published
    and exists (
      select 1
      from public.curriculum_lessons l
      join public.curriculum_modules m on m.id = l.module_id
      join public.curriculum_levels cl on cl.id = m.level_id
      join public.curricula c on c.id = cl.curriculum_id
      where l.id = lesson_id
        and l.published
        and m.published
        and c.status = 'published'
    )
  )
);

create policy "lesson_steps_admin_insert" on public.lesson_steps
for insert to authenticated
with check ((select public.has_role((select auth.uid()), 'super_admin')));
create policy "lesson_steps_admin_update" on public.lesson_steps
for update to authenticated
using ((select public.has_role((select auth.uid()), 'super_admin')))
with check ((select public.has_role((select auth.uid()), 'super_admin')));
create policy "lesson_steps_admin_delete" on public.lesson_steps
for delete to authenticated
using ((select public.has_role((select auth.uid()), 'super_admin')));

drop policy if exists "lsp_own_read" on public.lesson_step_progress;
drop policy if exists "lsp_scoped_read" on public.lesson_step_progress;
create policy "lsp_scoped_read" on public.lesson_step_progress
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select public.has_role((select auth.uid()), 'super_admin'))
  or exists (
    select 1
    from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.student_id = lesson_step_progress.user_id
      and cm.status = 'approved'
      and c.prof_id = (select auth.uid())
  )
);

drop policy if exists "media_update_own" on storage.objects;
create policy "media_update_own" on storage.objects
for update to authenticated
using (bucket_id = 'media' and owner = (select auth.uid()))
with check (bucket_id = 'media' and owner = (select auth.uid()));

create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_user_roles_role_user on public.user_roles(role, user_id);
create index if not exists idx_classes_prof_id on public.classes(prof_id);
create index if not exists idx_class_members_student_status on public.class_members(student_id, status);
create index if not exists idx_class_members_class_status on public.class_members(class_id, status);
create index if not exists idx_courses_prof_id on public.courses(prof_id);
create index if not exists idx_courses_class_id on public.courses(class_id);
create index if not exists idx_courses_catalog on public.courses(niveau, trimestre, published);
create index if not exists idx_assessments_prof_id on public.assessments(prof_id);
create index if not exists idx_assessments_class_published on public.assessments(class_id, published);
create index if not exists idx_questions_assessment_order on public.questions(assessment_id, ordre);
create index if not exists idx_submissions_assessment_status on public.submissions(assessment_id, status);
create index if not exists idx_submissions_student_status on public.submissions(student_id, status);
create index if not exists idx_submissions_deadline on public.submissions(deadline_at) where status = 'en_cours';
create index if not exists idx_class_messages_class_created on public.class_messages(class_id, created_at desc);