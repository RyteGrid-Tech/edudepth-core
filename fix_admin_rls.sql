-- EDUDEPTH ADMIN RLS FIX
-- Run this in the Supabase SQL Editor to grant admin users permission to manage content.

-- 1. Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on core content tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- 3. Reset existing policies for content tables to avoid conflicts
-- Courses
DROP POLICY IF EXISTS "Public courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
-- Modules
DROP POLICY IF EXISTS "Public modules are viewable by everyone" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
-- Lessons
DROP POLICY IF EXISTS "Public lessons are viewable by everyone" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
-- Quizzes
DROP POLICY IF EXISTS "Public quizzes are viewable by everyone" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
-- Questions
DROP POLICY IF EXISTS "Public questions are viewable by everyone" ON public.questions;
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;

-- 4. Create new granular policies

-- COURSES
CREATE POLICY "Courses are viewable by authenticated users"
  ON public.courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- MODULES
CREATE POLICY "Modules are viewable by authenticated users"
  ON public.modules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- LESSONS
CREATE POLICY "Lessons are viewable by authenticated users"
  ON public.lessons FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage lessons"
  ON public.lessons FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- QUIZZES
CREATE POLICY "Quizzes are viewable by authenticated users"
  ON public.quizzes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- QUESTIONS
CREATE POLICY "Questions are viewable by authenticated users"
  ON public.questions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage questions"
  ON public.questions FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 5. Ensure Profiles can be read by others but only updated by owner or admin
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile or admins can update any"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());
