-- 1. Fix faulty classes_select subquery
DROP POLICY IF EXISTS classes_select ON public.classes;
CREATE POLICY classes_select ON public.classes
FOR SELECT TO authenticated
USING (
  prof_id = (select auth.uid())
  OR public.has_role((select auth.uid()), 'super_admin')
  OR public.is_class_member(id, (select auth.uid()))
  OR EXISTS (
    SELECT 1 FROM public.class_members m
    WHERE m.class_id = classes.id AND m.student_id = (select auth.uid())
  )
);

-- 2. Restrict media bucket reads
DROP POLICY IF EXISTS media_read_auth ON storage.objects;
CREATE POLICY media_read_scoped ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'media'
  AND (
    owner = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = (select auth.uid()) AND ur.role = 'super_admin'
    )
    OR EXISTS (
      SELECT 1
      FROM public.classes c
      JOIN public.class_members m ON m.class_id = c.id
      WHERE c.prof_id::text = split_part(name, '/', 1)
        AND m.student_id = (select auth.uid())
        AND m.status = 'approved'
    )
  )
);

-- 3. Revoke direct EXECUTE on internal SECURITY DEFINER / trigger functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_take_assessment(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_take_assessment(uuid, uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.is_approved(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_super_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_class_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_class_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_assessment(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_class_by_code(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.start_assessment(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_assessment_progress(uuid, jsonb, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_assessment_event(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_assessment_questions_for_student(uuid) FROM PUBLIC, anon;
