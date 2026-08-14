
-- ROLES
CREATE TYPE public.app_role AS ENUM ('super_admin','prof','eleve');
CREATE TYPE public.account_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  avatar_url text,
  niveau int,
  requested_role public.app_role NOT NULL DEFAULT 'eleve',
  status public.account_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'approved');
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.app_role;
BEGIN
  r := COALESCE((NEW.raw_user_meta_data->>'requested_role')::public.app_role, 'eleve');
  INSERT INTO public.profiles (id, full_name, email, avatar_url, requested_role)
  VALUES (NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email,''),
    NEW.raw_user_meta_data->>'avatar_url', r)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'prof'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'))
WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'prof'));

-- CLASSES
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prof_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  niveau int NOT NULL DEFAULT 5,
  annee_scolaire text NOT NULL DEFAULT '2025-2026',
  code_invitation text NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text),1,6)),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.account_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_members TO authenticated;
GRANT ALL ON public.class_members TO service_role;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_class_owner(_class_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = _class_id AND prof_id = _user_id);
$$;
CREATE OR REPLACE FUNCTION public.is_class_member(_class_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.class_members WHERE class_id = _class_id AND student_id = _user_id AND status = 'approved');
$$;

CREATE POLICY "classes_select" ON public.classes FOR SELECT TO authenticated
USING (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin') OR public.is_class_member(id, auth.uid())
  OR EXISTS (SELECT 1 FROM public.class_members m WHERE m.class_id = id AND m.student_id = auth.uid()));
CREATE POLICY "classes_insert" ON public.classes FOR INSERT TO authenticated
WITH CHECK (prof_id = auth.uid() AND (public.has_role(auth.uid(),'prof') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "classes_update" ON public.classes FOR UPDATE TO authenticated
USING (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "classes_delete" ON public.classes FOR DELETE TO authenticated
USING (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "members_select" ON public.class_members FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_class_owner(class_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "members_insert" ON public.class_members FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() OR public.is_class_owner(class_id, auth.uid()));
CREATE POLICY "members_update" ON public.class_members FOR UPDATE TO authenticated
USING (public.is_class_owner(class_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "members_delete" ON public.class_members FOR DELETE TO authenticated
USING (public.is_class_owner(class_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));

-- COURS
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prof_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  niveau int NOT NULL DEFAULT 5,
  trimestre int NOT NULL DEFAULT 1,
  matiere text NOT NULL DEFAULT 'grammaire',
  titre text NOT NULL,
  resume text,
  contenu text NOT NULL DEFAULT '',
  cover_image_url text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "courses_owner_all" ON public.courses FOR ALL TO authenticated
USING (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'))
WITH CHECK (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "courses_student_read" ON public.courses FOR SELECT TO authenticated
USING (published AND (class_id IS NULL OR public.is_class_member(class_id, auth.uid())));

-- EVALUATIONS
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prof_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'devoir',
  titre text NOT NULL,
  consignes text,
  niveau int NOT NULL DEFAULT 5,
  trimestre int NOT NULL DEFAULT 1,
  matiere text NOT NULL DEFAULT 'grammaire',
  duree_minutes int NOT NULL DEFAULT 30,
  ouvre_at timestamptz,
  ferme_at timestamptz,
  anti_cheat jsonb NOT NULL DEFAULT '{"fullscreen":true,"blockCopy":true,"blockScreenshot":true,"tabSwitchLimit":3,"shuffle":true}'::jsonb,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER assessments_updated_at BEFORE UPDATE ON public.assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "assessments_owner_all" ON public.assessments FOR ALL TO authenticated
USING (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'))
WITH CHECK (prof_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "assessments_student_read" ON public.assessments FOR SELECT TO authenticated
USING (published AND class_id IS NOT NULL AND public.is_class_member(class_id, auth.uid()));

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  ordre int NOT NULL DEFAULT 1,
  type text NOT NULL DEFAULT 'qcm',
  enonce text NOT NULL,
  image_url text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  reponse_correcte text,
  points numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_assessment(_assessment_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.assessments WHERE id = _assessment_id AND prof_id = _user_id);
$$;
CREATE OR REPLACE FUNCTION public.can_take_assessment(_assessment_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assessments a
    JOIN public.class_members m ON m.class_id = a.class_id
    WHERE a.id = _assessment_id AND a.published AND m.student_id = _user_id AND m.status = 'approved'
  );
$$;

CREATE POLICY "questions_owner_all" ON public.questions FOR ALL TO authenticated
USING (public.owns_assessment(assessment_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'))
WITH CHECK (public.owns_assessment(assessment_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "questions_student_read" ON public.questions FOR SELECT TO authenticated
USING (public.can_take_assessment(assessment_id, auth.uid()));

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'en_cours',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score numeric,
  total numeric,
  feedback text,
  per_question jsonb NOT NULL DEFAULT '{}'::jsonb,
  cheat_events jsonb NOT NULL DEFAULT '[]'::jsonb,
  graded_at timestamptz,
  UNIQUE (assessment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_student_select" ON public.submissions FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.owns_assessment(assessment_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "submissions_student_insert" ON public.submissions FOR INSERT TO authenticated
WITH CHECK (student_id = auth.uid() AND public.can_take_assessment(assessment_id, auth.uid()));
CREATE POLICY "submissions_student_update" ON public.submissions FOR UPDATE TO authenticated
USING ((student_id = auth.uid() AND status = 'en_cours') OR public.owns_assessment(assessment_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "submissions_prof_delete" ON public.submissions FOR DELETE TO authenticated
USING (public.owns_assessment(assessment_id, auth.uid()) OR public.has_role(auth.uid(),'super_admin'));

-- MESSAGES CLASSE
CREATE TABLE public.class_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_messages TO authenticated;
GRANT ALL ON public.class_messages TO service_role;
ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select" ON public.class_messages FOR SELECT TO authenticated
USING (public.is_class_owner(class_id, auth.uid()) OR public.is_class_member(class_id, auth.uid()));
CREATE POLICY "msg_insert" ON public.class_messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND (public.is_class_owner(class_id, auth.uid()) OR public.is_class_member(class_id, auth.uid())));
CREATE POLICY "msg_delete" ON public.class_messages FOR DELETE TO authenticated
USING (sender_id = auth.uid() OR public.is_class_owner(class_id, auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.class_messages;
