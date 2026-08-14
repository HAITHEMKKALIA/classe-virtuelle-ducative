
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_approved(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_class_owner(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_class_member(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owns_assessment(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.can_take_assessment(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'super_admin')
  ON CONFLICT DO NOTHING;
  UPDATE public.profiles SET status = 'approved', requested_role = 'super_admin' WHERE id = auth.uid();
  RETURN true;
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_super_admin() FROM anon;
