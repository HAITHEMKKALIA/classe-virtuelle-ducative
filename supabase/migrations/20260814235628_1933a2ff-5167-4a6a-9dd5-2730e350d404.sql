CREATE TABLE public.curricula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  locale text NOT NULL DEFAULT 'fr-TN',
  version text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.curricula TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.curricula TO authenticated;
GRANT ALL ON public.curricula TO service_role;
ALTER TABLE public.curricula ENABLE ROW LEVEL SECURITY;
CREATE POLICY curricula_read_published ON public.curricula FOR SELECT TO authenticated USING (status = 'published' OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curricula_admin_insert ON public.curricula FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curricula_admin_update ON public.curricula FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curricula_admin_delete ON public.curricula FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER curricula_updated_at BEFORE UPDATE ON public.curricula FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.curriculum_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id uuid NOT NULL REFERENCES public.curricula(id) ON DELETE CASCADE,
  grade smallint NOT NULL CHECK (grade IN (5, 6)),
  title text NOT NULL,
  terminal_performance jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (curriculum_id, grade)
);
GRANT SELECT ON public.curriculum_levels TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.curriculum_levels TO authenticated;
GRANT ALL ON public.curriculum_levels TO service_role;
ALTER TABLE public.curriculum_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY curriculum_levels_read ON public.curriculum_levels FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.curricula c WHERE c.id = curriculum_id AND (c.status = 'published' OR public.has_role(auth.uid(), 'super_admin'))));
CREATE POLICY curriculum_levels_admin_insert ON public.curriculum_levels FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curriculum_levels_admin_update ON public.curriculum_levels FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curriculum_levels_admin_delete ON public.curriculum_levels FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER curriculum_levels_updated_at BEFORE UPDATE ON public.curriculum_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.curriculum_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES public.curriculum_levels(id) ON DELETE CASCADE,
  module_no smallint NOT NULL CHECK (module_no BETWEEN 1 AND 8),
  trimester smallint NOT NULL CHECK (trimester BETWEEN 1 AND 3),
  unit_no smallint NOT NULL CHECK (unit_no BETWEEN 1 AND 4),
  title text NOT NULL,
  theme text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  position smallint NOT NULL,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level_id, module_no)
);
GRANT SELECT ON public.curriculum_modules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.curriculum_modules TO authenticated;
GRANT ALL ON public.curriculum_modules TO service_role;
ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY curriculum_modules_read ON public.curriculum_modules FOR SELECT TO authenticated USING ((published OR public.has_role(auth.uid(), 'super_admin')) AND EXISTS (SELECT 1 FROM public.curriculum_levels l JOIN public.curricula c ON c.id = l.curriculum_id WHERE l.id = level_id AND (c.status = 'published' OR public.has_role(auth.uid(), 'super_admin'))));
CREATE POLICY curriculum_modules_admin_insert ON public.curriculum_modules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curriculum_modules_admin_update ON public.curriculum_modules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curriculum_modules_admin_delete ON public.curriculum_modules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER curriculum_modules_updated_at BEFORE UPDATE ON public.curriculum_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_curriculum_modules_level_position ON public.curriculum_modules(level_id, position);

CREATE TABLE public.curriculum_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.curriculum_modules(id) ON DELETE CASCADE,
  lesson_no smallint NOT NULL CHECK (lesson_no BETWEEN 1 AND 8),
  title text NOT NULL,
  lesson_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  estimated_minutes integer NOT NULL DEFAULT 120 CHECK (estimated_minutes > 0),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, lesson_no)
);
GRANT SELECT ON public.curriculum_lessons TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.curriculum_lessons TO authenticated;
GRANT ALL ON public.curriculum_lessons TO service_role;
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY curriculum_lessons_read ON public.curriculum_lessons FOR SELECT TO authenticated USING ((published OR public.has_role(auth.uid(), 'super_admin')) AND EXISTS (SELECT 1 FROM public.curriculum_modules m JOIN public.curriculum_levels l ON l.id = m.level_id JOIN public.curricula c ON c.id = l.curriculum_id WHERE m.id = module_id AND (m.published OR public.has_role(auth.uid(), 'super_admin')) AND (c.status = 'published' OR public.has_role(auth.uid(), 'super_admin'))));
CREATE POLICY curriculum_lessons_admin_insert ON public.curriculum_lessons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curriculum_lessons_admin_update ON public.curriculum_lessons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY curriculum_lessons_admin_delete ON public.curriculum_lessons FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER curriculum_lessons_updated_at BEFORE UPDATE ON public.curriculum_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_curriculum_lessons_module_no ON public.curriculum_lessons(module_id, lesson_no);

CREATE TABLE public.learner_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score numeric(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  mastery jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learner_progress TO authenticated;
GRANT ALL ON public.learner_progress TO service_role;
ALTER TABLE public.learner_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY learner_progress_read ON public.learner_progress FOR SELECT TO authenticated USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'super_admin')
  OR EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes cl ON cl.id = cm.class_id
    WHERE cm.student_id = learner_progress.user_id
      AND cm.status = 'approved'
      AND cl.prof_id = auth.uid()
  )
);
CREATE POLICY learner_progress_insert_own ON public.learner_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY learner_progress_update_own ON public.learner_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY learner_progress_delete_own ON public.learner_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER learner_progress_updated_at BEFORE UPDATE ON public.learner_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_learner_progress_user_status ON public.learner_progress(user_id, status);