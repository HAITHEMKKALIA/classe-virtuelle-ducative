CREATE TABLE public.manual_programs (
  id uuid primary key default gen_random_uuid(),
  prof_id uuid not null,
  class_id uuid references public.classes(id) on delete cascade,
  titre text not null,
  description text,
  niveau integer,
  trimestre integer,
  contenu text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.program_files (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.manual_programs(id) on delete cascade,
  prof_id uuid not null,
  nom text not null,
  path text not null,
  mime text,
  taille bigint,
  created_at timestamptz not null default now()
);

CREATE INDEX manual_programs_prof_idx ON public.manual_programs(prof_id);
CREATE INDEX manual_programs_class_idx ON public.manual_programs(class_id);
CREATE INDEX program_files_program_idx ON public.program_files(program_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.manual_programs TO authenticated;
GRANT ALL ON public.manual_programs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_files TO authenticated;
GRANT ALL ON public.program_files TO service_role;

ALTER TABLE public.manual_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_files ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_program(_program_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.manual_programs p
    where p.id = _program_id
      and (
        p.prof_id = (select auth.uid())
        or exists (
          select 1 from public.user_roles ur
          where ur.user_id = (select auth.uid()) and ur.role = 'super_admin'
        )
        or (
          p.published
          and (
            (p.class_id is not null and public.is_class_member(p.class_id, (select auth.uid())))
            or (
              p.class_id is null
              and exists (
                select 1
                from public.classes c
                join public.class_members m on m.class_id = c.id
                where c.prof_id = p.prof_id
                  and m.student_id = (select auth.uid())
                  and m.status = 'approved'
              )
            )
          )
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_view_program(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_program(uuid) TO authenticated, service_role;

CREATE POLICY manual_programs_select ON public.manual_programs
FOR SELECT TO authenticated
USING (public.can_view_program(id));

CREATE POLICY manual_programs_insert ON public.manual_programs
FOR INSERT TO authenticated
WITH CHECK (
  prof_id = (select auth.uid())
  AND (public.has_role((select auth.uid()), 'prof') OR public.has_role((select auth.uid()), 'super_admin'))
);

CREATE POLICY manual_programs_update ON public.manual_programs
FOR UPDATE TO authenticated
USING (prof_id = (select auth.uid()) OR public.has_role((select auth.uid()), 'super_admin'))
WITH CHECK (prof_id = (select auth.uid()) OR public.has_role((select auth.uid()), 'super_admin'));

CREATE POLICY manual_programs_delete ON public.manual_programs
FOR DELETE TO authenticated
USING (prof_id = (select auth.uid()) OR public.has_role((select auth.uid()), 'super_admin'));

CREATE POLICY program_files_select ON public.program_files
FOR SELECT TO authenticated
USING (public.can_view_program(program_id));

CREATE POLICY program_files_insert ON public.program_files
FOR INSERT TO authenticated
WITH CHECK (
  prof_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.manual_programs p
    WHERE p.id = program_id AND p.prof_id = (select auth.uid())
  )
);

CREATE POLICY program_files_delete ON public.program_files
FOR DELETE TO authenticated
USING (prof_id = (select auth.uid()) OR public.has_role((select auth.uid()), 'super_admin'));

CREATE TRIGGER manual_programs_updated_at
BEFORE UPDATE ON public.manual_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
