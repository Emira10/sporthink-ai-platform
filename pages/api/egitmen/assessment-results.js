import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// 1. توابع المساعدة لحساب النسب المئوية (كاملة كما هي)
function calcPercent(score, total) {
  const s = Number(score || 0);
  const t = Number(total || 0);

  // إذا score أصلًا نسبة مئوية
  if (s <= 100 && t <= 0) return Math.round(s);
  if (s <= 100 && t > 0 && s > t) return Math.round(s);

  return t > 0 ? Math.round((s / t) * 100) : 0;
}

function safePercent(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    // 2. جلب بيانات البروفايلات (لربط الأسماء إذا كانت مفقودة)
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email");

    const profileMap = {};
    (profiles || []).forEach((p) => {
      profileMap[p.id] = p.full_name || p.email || "Bilinmiyor";
    });

    // 3. جلب نقاط المستخدمين (XP)
    const { data: points } = await supabaseAdmin
      .from("user_points")
      .select("*");

    const xpMap = {};
    (points || []).forEach((p) => {
      const key = p.user_id || p.kullanici_id;
      xpMap[key] = (xpMap[key] || 0) + Number(p.points || 0);
    });

    // 4. جلب البيانات من الجداول الثلاثة مع ربط العناوين الأصلية (JOIN)
    
    // جلب الكويزات مع عناوينها من جدول quizzes
    const { data: quizAttempts, error: quizAttemptsError } = await supabaseAdmin
  .from("quiz_attempts")
  .select("*")
  .order("created_at", { ascending: false });

if (quizAttemptsError) throw quizAttemptsError;

const { data: quizzesList, error: quizzesError } = await supabaseAdmin
  .from("quizzes")
  .select("id, title, passing_score");

if (quizzesError) throw quizzesError;

const quizMap = {};
(quizzesList || []).forEach((q) => {
  quizMap[String(q.id)] = q;
});

    // جلب الامتحانات النهائية مع عناوينها من جدول final_exams
    const { data: finalResults } = await supabaseAdmin
      .from("final_exam_results")
      .select("*, final_exams(title)")
      .order("created_at", { ascending: false });

    // جلب امتحانات الذكاء الاصطناعي
    const { data: aiResults } = await supabaseAdmin
      .from("ai_exam_results")
      .select("*")
      .order("created_at", { ascending: false });


    // --- 5. معالجة صفوف الكويزات (Quiz Rows) ---
    const quizRows = (quizAttempts || []).map((r) => {
      const userKey = r.user_id || r.kullanici_id;
      const score = Number(
  r.score ||
  r.correct_answers ||
  r.correct_count ||
  0
);

const total = Number(
  r.total_questions ||
  r.question_count ||
  r.total ||
  100
);

const percent =
  total > 0
    ? Math.round((score / total) * 100)
    : Math.round(score);
      const quizInfo = quizMap[String(r.quiz_id)];
const passing = Number(quizInfo?.passing_score || 60);

      return {
        id: `quiz-${r.id}`,
        raw_id: r.id,
        user_id: userKey,
        student_name:
          r.student_name ||
          r.full_name ||
          profileMap[userKey] ||
          r.email ||
          "Bilinmeyen Öğrenci",
        assessment_type: "quiz",
        assessment_label: "Quiz", // مسمى احترافي
        quiz_id: r.quiz_id,
        quiz_title:
  quizInfo?.title ||
  r.quiz_title ||
  "Genel Quiz",
        score,
        total_questions: total || 100,
        percent,
        passed: percent >= passing,
        xp_earned: xpMap[userKey] || 0,
        created_at: r.created_at,
      };
    });

    // --- 6. معالجة صفوف الامتحانات النهائية (Final Rows - مع التنظيف) ---
    const finalRows = (finalResults || []).map((r) => {
      const userKey = r.user_id || r.kullanici_id;
      const total = Number(r.total_questions || r.total_points || 0);
      const score = Number(r.score || r.percent || 0);
      const percent = safePercent(calcPercent(score, total));

      // منطق التنظيف الذكي للعناوين
      let cleanTitle =
  r.final_exams?.title ||
  r.exam_title ||
  r.exam_name ||
  r.title ||
  "Başlıksız Sınav";
      
      // إذا كان الاسم مكرر "Final Exam" نغيره لاسم عام لائق
      if (cleanTitle.toLowerCase() === "final exam" || cleanTitle.toLowerCase() === "final sınavı") {
        cleanTitle = "Genel Değerlendirme Sınavı";
      }

      return {
        id: `final-${r.id}`,
        raw_id: r.id,
        user_id: userKey,
        student_name:
          r.student_name ||
          r.full_name ||
          profileMap[userKey] ||
          r.email ||
          "Bilinmeyen Öğrenci",
        assessment_type:
  r.exam_type?.toLowerCase().includes("ai")
    ? "ai_exam"
    : "final_exam",

assessment_label:
  r.exam_type?.toLowerCase().includes("ai")
    ? "AI Sınavı"
    : "Final Sınavı",
        quiz_id: r.exam_id || r.final_exam_id || null,
        quiz_title: cleanTitle,
        score,
        total_questions: total || 100,
        percent,
        passed: r.is_passed || percent >= 60,
        xp_earned: xpMap[userKey] || 0,
        created_at: r.created_at,
      };
    });

    // --- 7. معالجة صفوف الذكاء الاصطناعي (AI Rows) ---
    const aiRows = (aiResults || []).map((r) => {
      const userKey = r.user_id || r.kullanici_id;
      const total = Number(r.total_questions || 0);
      const score = Number(r.score || 0);
      const percent = safePercent(calcPercent(score, total));

      return {
        id: `ai-${r.id}`,
        raw_id: r.id,
        user_id: userKey,
        student_name:
          r.student_name ||
          r.full_name ||
          profileMap[userKey] ||
          r.email ||
          "Bilinmeyen Öğrenci",
        assessment_type: "ai_exam",
        assessment_label: "AI Destekli",
        quiz_id: r.exam_id || null,
        quiz_title: r.exam_title || r.topic || "AI Analiz Sınavı",
        score,
        total_questions: total || 100,
        percent,
        passed: percent >= 60,
        xp_earned: xpMap[userKey] || 0,
        created_at: r.created_at,
      };
    });

    // 8. دمج كل النتائج وترتيبها زمنياً
    const results = [...quizRows, ...finalRows, ...aiRows].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    const { data: finalExamCatalog } = await supabaseAdmin
  .from("final_exams")
  .select("id, title")
  .order("created_at", { ascending: false });

const assessments = [
  ...(finalExamCatalog || []).map((e) => ({
  quiz_id: e.id,
  assessment_type: "quiz",
  assessment_label: "Quiz",
  quiz_title: e.title || "Başlıksız Sınav",
})),

  ...(quizAttempts || []).map((q) => ({
  quiz_id: q.quiz_id,
  assessment_type: "quiz",
  assessment_label: "Quiz",
  quiz_title:
    quizMap[String(q.quiz_id)]?.title ||
    q.quiz_title ||
    "Genel Quiz",
})),

  ...(aiResults || []).map((a) => ({
    quiz_id: a.exam_id || a.id,
    assessment_type: "ai_exam",
    assessment_label: "AI Sınavı",
    quiz_title:
      a.exam_title ||
      a.topic ||
      "AI Analiz",
  })),
];

const uniqueAssessments = Array.from(
  new Map(
    assessments.map((a) => [
      `${a.assessment_type}-${a.quiz_title}`,
      a,
    ])
  ).values()
);

    return res.status(200).json({
  ok: true,
  results,
  assessments: uniqueAssessments,
});

  } catch (error) {
    console.error("API Error Details:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}