// Placeholder mock data — TODO: replace with Supabase queries
export const MOCK_USER = {
  id: "u_demo",
  name: "Adaobi Okeke",
  email: "adaobi@edudepth.ng",
  level: "SS3",
  is_admin: true,
};

export const MOCK_MODULES = [
  { code: "MTH101", title: "Mathematics", level: "SS3", lessons: 142, quizzes: 18, modules: 9, enrolled: true, progress: 64, students: 4231 },
  { code: "PHY101", title: "Physics", level: "SS3", lessons: 118, quizzes: 14, modules: 8, enrolled: true, progress: 42, students: 3104 },
  { code: "CHM101", title: "Chemistry", level: "SS3", lessons: 124, quizzes: 16, modules: 8, enrolled: true, progress: 28, students: 2987 },
  { code: "ENG101", title: "English Language", level: "SS3", lessons: 98, quizzes: 12, modules: 7, enrolled: false, progress: 0, students: 5612 },
  { code: "BIO101", title: "Biology", level: "SS2", lessons: 136, quizzes: 17, modules: 10, enrolled: false, progress: 0, students: 3845 },
  { code: "ECN101", title: "Economics", level: "SS2", lessons: 86, quizzes: 10, modules: 6, enrolled: false, progress: 0, students: 2143 },
  { code: "GOV101", title: "Government", level: "SS2", lessons: 72, quizzes: 9, modules: 6, enrolled: false, progress: 0, students: 1876 },
];

export const MOCK_COURSE = {
  code: "MTH101",
  title: "Mathematics",
  level: "SS3",
  description: "Complete WAEC and JAMB-aligned mathematics syllabus. Algebra, geometry, calculus and statistics — sequenced for cumulative mastery.",
  enrolled: 4231,
  progress: 64,
  modules: [
    {
      id: "m1", title: "Number & Numeration", lessons: [
        { id: "l1", title: "Number Bases", duration: "12:04", status: "CLEARED" },
        { id: "l2", title: "Modular Arithmetic", duration: "09:48", status: "CLEARED" },
        { id: "l3", title: "Indices & Logarithms", duration: "18:22", status: "IN PROGRESS" },
      ],
    },
    {
      id: "m2", title: "Algebraic Processes", lessons: [
        { id: "l4", title: "Quadratic Equations", duration: "22:16", status: "—" },
        { id: "l5", title: "Simultaneous Equations", duration: "15:44", status: "—", locked: true },
        { id: "l6", title: "Inequalities", duration: "11:30", status: "—", locked: true },
      ],
    },
    {
      id: "m3", title: "Geometry & Trigonometry", lessons: [
        { id: "l7", title: "Plane Geometry", duration: "19:00", status: "—", locked: true },
        { id: "l8", title: "Trigonometric Ratios", duration: "16:12", status: "—", locked: true },
      ],
    },
  ],
};

export const MOCK_LESSON = {
  id: "l3",
  course: "MTH101",
  module: "Module 1: Number & Numeration",
  moduleNum: 1,
  num: 3,
  title: "Indices & Logarithms",
  duration: "18:22",
  youtubeId: "kBVDSu7v8os",
  notes: `Key concepts:

• Indices follow the laws of exponents — a^m × a^n = a^(m+n)
• Logarithm is the inverse operation of exponentiation
• log_a(b) = c implies a^c = b
• Common log: base 10. Natural log: base e
• Change of base formula: log_a(b) = log_c(b) / log_c(a)

Practice:
1. Simplify 2^5 × 2^3
2. Solve log_2(x) = 4
3. Evaluate log_10(1000)`,
  hasQuiz: true,
};

export const MOCK_QUIZ = {
  id: "q1",
  course: "MTH101",
  topic: "Quadratic Equations",
  questions: [
    {
      q: "Solve x² − 5x + 6 = 0",
      options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = 0, 5"],
      correct: 1,
    },
    {
      q: "What is the discriminant of ax² + bx + c = 0?",
      options: ["b² − 4ac", "b² + 4ac", "2a + b", "−b/2a"],
      correct: 0,
    },
    {
      q: "If roots of x² + px + q = 0 are α and β, then α + β =",
      options: ["q", "-q", "p", "-p"],
      correct: 3,
    },
    {
      q: "The sum of roots of 2x² − 8x + 6 = 0 is",
      options: ["4", "-4", "3", "-3"],
      correct: 0,
    },
    {
      q: "Which method works when a quadratic cannot be factored?",
      options: ["Substitution", "Quadratic formula", "Long division", "Synthetic division"],
      correct: 1,
    },
  ],
};
