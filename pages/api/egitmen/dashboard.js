import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { count: totalTrainings } = await supabaseAdmin
      .from("trainings")
      .select("*", { count: "exact", head: true });

    const { count: activeTrainings } = await supabaseAdmin
      .from("trainings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: totalStudents } = await supabaseAdmin
  .from("kullanicilar")
  .select("*", { count: "exact", head: true });

    const { data: quizResults } = await supabaseAdmin
      .from("quiz_results")
      .select("score");

    const scores = quizResults?.map((r) => Number(r.score)).filter((n) => !isNaN(n)) || [];
    const quizSuccessRate =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const alerts = [];

    const { count: assignedTrainings } = await supabaseAdmin
  .from("training_assignments")
  .select("*", { count: "exact", head: true });

const { count: quizResultsCount } = await supabaseAdmin
  .from("quiz_results")
  .select("*", { count: "exact", head: true });

const today = new Date();
const sevenDaysLater = new Date();
sevenDaysLater.setDate(today.getDate() + 7);

const { count: nearDueTrainings } = await supabaseAdmin
  .from("training_assignments")
  .select("*", { count: "exact", head: true })
  .not("due_date", "is", null)
  .gte("due_date", today.toISOString().slice(0, 10))
  .lte("due_date", sevenDaysLater.toISOString().slice(0, 10))
  .neq("status", "completed");

  const { count: completedAssignments } = await supabaseAdmin
  .from("training_assignments")
  .select("*", { count: "exact", head: true })
  .eq("status", "completed");

const totalAssignments = assignedTrainings || 0;

const completionRate =
  totalAssignments > 0
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

const activeAssignments =
  totalAssignments - (completedAssignments || 0);

const analytics = {
  completionRate,
  totalAssignments,
  completedAssignments: completedAssignments || 0,
  activeAssignments,
};

    if (activeTrainings === 0) {
      alerts.push({
        text: "Şu anda yayında aktif eğitim bulunmuyor.",
        level: "warning",
      });
    }

    if (totalStudents === 0) {
      alerts.push({
        text: "Henüz eğitime atanmış kullanıcı bulunmuyor.",
        level: "info",
      });
    }

    if ((totalTrainings || 0) > 0 && (assignedTrainings || 0) === 0) {
  alerts.push({
    text: "Sistemde eğitim var ancak henüz hiçbir öğrenciye atanmamış.",
    level: "warning",
  });
}

if ((nearDueTrainings || 0) > 0) {
  alerts.push({
    text: `${nearDueTrainings} eğitim atamasının son teslim tarihi yaklaşıyor.`,
    level: "warning",
  });
}

if ((totalTrainings || 0) > 0 && (quizResultsCount || 0) === 0) {
  alerts.push({
    text: "Eğitimler mevcut ancak henüz quiz sonucu bulunmuyor.",
    level: "info",
  });
}

const { data: recentActivities } = await supabaseAdmin
  .from("activity_logs")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(8);

const { data: latestAiResults } = await supabaseAdmin
  .from("quiz_results")
  .select(`
    id,
    score,
    created_at,
    kullanici_id,
    ai_course_id
  `)
  .order("created_at", { ascending: false })
  .limit(5);

const { data: latestFinalResults } = await supabaseAdmin
  .from("final_exam_results")
  .select(`
    id,
    score,
    created_at,
    submitted_at,
    kullanici_id,
    student_name,
    exam_title
  `)
  .order("created_at", { ascending: false })
  .limit(5);

const latestQuizResults = [
  ...(latestAiResults || []).map((r) => ({
    id: `ai-${r.id}`,
    type: "AI Quiz",
    student: r.kullanici_id ? `Kullanıcı #${r.kullanici_id}` : "Öğrenci",
    exam: "AI Sınavı",
    score: r.score || 0,
    created_at: r.created_at,
  })),
  ...(latestFinalResults || []).map((r) => ({
    id: `final-${r.id}`,
    type: "Online Sınav",
    student: r.student_name || (r.kullanici_id ? `Kullanıcı #${r.kullanici_id}` : "Öğrenci"),
    exam: r.exam_title || "Online Sınav",
    score: r.score || 0,
    created_at: r.created_at || r.submitted_at,
  })),
]
  .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  .slice(0, 6);

  const { data: topStudents } = await supabaseAdmin
  .from("kullanicilar")
  .select(`
    kullanici_id,
    ad,
    soyad,
    e_posta
  `)
  .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalTrainings: totalTrainings || 0,
        activeTrainings: activeTrainings || 0,
        totalStudents: totalStudents || 0,
        quizSuccessRate,
      },
      alerts,
      analytics,
      recentActivities,
      latestQuizResults,
      topStudents,
    });
  } catch (error) {
    console.error("Egitmen dashboard API error:", error);
    return res.status(500).json({
      success: false,
      message: "Dashboard verileri alınamadı",
      error: error.message,
    });
  }
}