-- Étapes de leçon interactives
CREATE TABLE public.lesson_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,
  step_no smallint NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  media_url text,
  media_kind text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, step_no)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_steps TO authenticated;
GRANT ALL ON public.lesson_steps TO service_role;
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_steps_read" ON public.lesson_steps FOR SELECT TO authenticated
  USING (published OR public.has_role(auth.uid(), 'prof') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "lesson_steps_insert" ON public.lesson_steps FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'prof') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "lesson_steps_update" ON public.lesson_steps FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'prof') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "lesson_steps_delete" ON public.lesson_steps FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'prof') OR public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER lesson_steps_updated_at BEFORE UPDATE ON public.lesson_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Progression étape par étape
CREATE TABLE public.lesson_step_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.lesson_steps(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  score numeric,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 1,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, step_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_step_progress TO authenticated;
GRANT ALL ON public.lesson_step_progress TO service_role;
ALTER TABLE public.lesson_step_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lsp_own_read" ON public.lesson_step_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'prof') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "lsp_own_insert" ON public.lesson_step_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lsp_own_update" ON public.lesson_step_progress FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lsp_own_delete" ON public.lesson_step_progress FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE TRIGGER lesson_step_progress_updated_at BEFORE UPDATE ON public.lesson_step_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Paramètres avancés des devoirs et examens
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS tentatives_max integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ordre_aleatoire boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS correction_immediate boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retard_accepte boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS resultats_publies boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS competences jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Enrichissement des questions
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS explication text,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Suivi des tentatives et brouillons
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS attempt integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_saved_at timestamp with time zone;