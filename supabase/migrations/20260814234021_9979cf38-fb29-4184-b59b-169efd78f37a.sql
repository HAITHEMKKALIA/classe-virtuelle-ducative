INSERT INTO public.user_roles (user_id, role)
VALUES ('88e67c82-9d43-4109-bbc9-a84dcff04719', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET status = 'approved', requested_role = 'super_admin', full_name = COALESCE(NULLIF(full_name,''), 'Haithem Kalia')
WHERE id = '88e67c82-9d43-4109-bbc9-a84dcff04719';