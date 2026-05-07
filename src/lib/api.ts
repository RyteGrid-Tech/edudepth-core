import { supabase } from "./supabase";

export type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  class_levels: string[] | null;
  is_published: boolean;
};

export type Module = { id: string; course_id: string; title: string; position: number };

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  notes_text: string | null;
  notes_pdf_url: string | null;
  position: number;
};

export type Quiz = { id: string; lesson_id: string; title: string | null };

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "a" | "b" | "c" | "d";
  position: number;
};

// ---------- Catalog ----------
export async function listCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("code");
  if (error) throw error;
  return (data ?? []) as Course[];
}

export async function listEnrollments(userId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.course_id as string);
}

export async function enroll(userId: string, courseId: string) {
  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId });
  if (error && !error.message.includes("duplicate")) throw error;
}

// ---------- Course detail ----------
export async function getCourseByCode(code: string) {
  const { data, error } = await supabase.from("courses").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  return data as Course | null;
}

export async function getCourseTree(courseId: string) {
  const { data: modules, error: mErr } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("position");
  if (mErr) throw mErr;
  const modIds = (modules ?? []).map((m) => m.id);
  let lessons: Lesson[] = [];
  if (modIds.length) {
    const { data: ls, error: lErr } = await supabase
      .from("lessons")
      .select("*")
      .in("module_id", modIds)
      .order("position");
    if (lErr) throw lErr;
    lessons = (ls ?? []) as Lesson[];
  }
  return { modules: (modules ?? []) as Module[], lessons };
}

// ---------- Lesson ----------
export async function getLesson(lessonId: string) {
  const { data, error } = await supabase
    .from("lessons")
    .select("*, modules!inner(id, title, position, course_id, courses!inner(id, code, title))")
    .eq("id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getQuizForLesson(lessonId: string) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (error) throw error;
  return data as Quiz | null;
}

// ---------- Progress ----------
export async function listProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("lesson_id, completed, completed_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

export async function markLessonComplete(userId: string, lessonId: string) {
  const { error } = await supabase
    .from("user_progress")
    .upsert(
      { user_id: userId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );
  if (error) throw error;
}

// ---------- Quiz ----------
export async function getQuizWithQuestions(quizId: string) {
  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .select("*, lessons!inner(id, title, modules!inner(course_id, courses!inner(code, title)))")
    .eq("id", quizId)
    .maybeSingle();
  if (qErr) throw qErr;
  const { data: questions, error: queErr } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");
  if (queErr) throw queErr;
  return { quiz, questions: (questions ?? []) as Question[] };
}

export async function submitQuizResult(userId: string, quizId: string, score: number, total: number) {
  const { error } = await supabase
    .from("quiz_results")
    .insert({ user_id: userId, quiz_id: quizId, score, total });
  if (error) throw error;
}

export async function listQuizResults(userId: string) {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("score, total, submitted_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

// ---------- Admin inserts ----------
export async function createCourse(input: {
  code: string;
  title: string;
  description: string;
  class_levels: string[];
}) {
  const { error } = await supabase.from("courses").insert({ ...input, is_published: true });
  if (error) throw error;
}

export async function createModule(input: { course_id: string; title: string; position: number }) {
  const { error } = await supabase.from("modules").insert(input);
  if (error) throw error;
}

export async function createLesson(input: {
  module_id: string;
  title: string;
  video_url: string;
  notes_text: string;
  position: number;
}) {
  const { error } = await supabase.from("lessons").insert(input);
  if (error) throw error;
}

export async function createQuizWithQuestions(
  lesson_id: string,
  title: string,
  questions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: "a" | "b" | "c" | "d";
  }>
) {
  const { data: quiz, error: qErr } = await supabase
    .from("quizzes")
    .insert({ lesson_id, title })
    .select()
    .single();
  if (qErr) throw qErr;
  const rows = questions.map((q, i) => ({ ...q, quiz_id: quiz.id, position: i + 1 }));
  const { error: queErr } = await supabase.from("questions").insert(rows);
  if (queErr) throw queErr;
}

export async function getCourseIdByCode(code: string): Promise<string | null> {
  const { data } = await supabase.from("courses").select("id").eq("code", code).maybeSingle();
  return (data?.id as string) ?? null;
}

// ---------- Profile ----------
export async function updateProfile(userId: string, updates: { full_name?: string; class_level?: string }) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (error) throw error;
}
