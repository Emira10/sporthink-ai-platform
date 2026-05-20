"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import KullaniciLayout from "../../components/KullaniciLayout";
import { createClient } from "@supabase/supabase-js";
import {
  ClipboardList, Bot, FileBarChart2, Medal,
  TrendingUp, BarChart3, Target, Brain,
  ChevronRight, Star, CheckCircle2, AlertCircle,
  Clock, Users, ArrowUp, Play, HelpCircle, Zap
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function KullaniciOlcmeDegerlendirmePage() {
  const router = useRouter();

  const [quizResults,      setQuizResults]      = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [performance,      setPerformance]      = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [aiInsightText, setAiInsightText] = useState("");
  const [showExamHistory, setShowExamHistory] = useState(false);

  useEffect(() => {
    completeQuizMission();
    fetchAllData();
  }, []);

  /* ── existing mission fn (unchanged) ── */
  async function completeQuizMission() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    await fetch("/api/kullanici/complete-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kullanici_id: userId, mission_key: "check_quiz" }),
    });

    await fetch("/api/oyunlastirma/add-points", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: userId,
    student_name: localStorage.getItem("userName") || "Kullanıcı",
    points: 50,
    source: "quiz_mission",
  }),
});
  }

  /* ── fetch everything ── */
  async function fetchAllData() {
    const userId = localStorage.getItem("userId");
    if (!userId) { setLoading(false); return; }

    try {
      /* 1 — quiz results: quiz_results once, fallback quiz_attempts */
      let { data: results } = await supabase
        .from("quiz_results")
        .select("*, quizzes(title, course_id)")
        .eq("kullanici_id", Number(userId))
        .order("created_at", { ascending: false })
        .limit(10);

      if (!results || results.length === 0) {
        const { data: attempts } = await supabase
          .from("quiz_attempts")
          .select("*, quizzes(title, course_id)")
          .eq("kullanici_id", Number(userId))
          .order("created_at", { ascending: false })
          .limit(10);
        results = (attempts || []).map((a) => ({
          ...a,
          score: a.score ?? a.total_score ?? a.percentage ?? 0,
        }));
      }

      const { data: finalResults } = await supabase
  .from("final_exam_results")
  .select("*")
  .order("submitted_at", { ascending: false });

const formattedFinalResults = await Promise.all(
  (finalResults || []).map(async (x) => {
    const { data: exam } = await supabase
      .from("final_exams")
      .select("title")
      .eq("id", x.exam_id)
      .single();

    return {
      id: x.id,
      score: x.score || 0,
      created_at: x.submitted_at,
      quizzes: {
        title: exam?.title || "Online Sınav",
      },
    };
  })
);

      const r = [
  ...(results || []),
  ...formattedFinalResults,
];
      setQuizResults(r);

      /* 2 — performance stats */
      if (r.length > 0) {
        const scores     = r.map((x) => x.score || 0);
        const avg        = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const best       = Math.max(...scores);
        const worst      = Math.min(...scores);
        const passing    = r.filter((x) => (x.score || 0) >= 70).length;
        const { data: allPlatformResults } = await supabase
  .from("quiz_results")
  .select("score");

const { data: allFinalPlatformResults } = await supabase
  .from("final_exam_results")
  .select("score");

const platformScores = [
  ...(allPlatformResults || []),
  ...(allFinalPlatformResults || []),
].map((x) => Number(x.score || 0));

const platformAvg =
  platformScores.length > 0
    ? Math.round(platformScores.reduce((a, b) => a + b, 0) / platformScores.length)
    : 0;

const betterThan =
  platformAvg > 0
    ? Math.max(0, Math.round(((avg - platformAvg) / platformAvg) * 100))
    : 0;

        setPerformance({ avg, best, worst, passing, total: r.length, betterThan, platformAvg });
      }

      /* 3 — available exams: normal + AI */
const { data: normalExams } = await supabase
  .from("final_exams")
  .select("id, title, description, passing_score, duration_minutes, created_at")
  .eq("is_active", true)
  .order("created_at", { ascending: false });

const solvedFinalIds = new Set((finalResults || []).map((x) => x.exam_id));

const normalUnsolved = (normalExams || [])
  .filter((exam) => !solvedFinalIds.has(exam.id))
  .map((exam) => ({
    id: exam.id,
    title: exam.title,
    type: "normal",
    difficulty: "medium",
    estimated_minutes: exam.duration_minutes,
    question_count: null,
    path: `/kullanici/sinav-coz?exam_id=${exam.id}`,
  }));

const { data: aiExams } = await supabase
  .from("ai_quizzes")
  .select("egitim_id, title, created_at")
  .order("created_at", { ascending: false });

const solvedAiIds = new Set((results || []).map((x) => x.ai_course_id));

const aiUnique = [
  ...new Map((aiExams || []).map((item) => [item.egitim_id, item])).values(),
];

const aiUnsolved = aiUnique
  .filter((exam) => !solvedAiIds.has(exam.egitim_id))
  .map((exam) => ({
    id: exam.egitim_id,
    title: exam.title || "AI Sınavı",
    type: "ai",
    difficulty: "hard",
    estimated_minutes: 10,
    question_count: null,
    path: `/kullanici/quiz?id=${exam.egitim_id}`,
  }));

setAvailableQuizzes([...normalUnsolved, ...aiUnsolved]);
    } catch (e) {
      console.error(e);
    } finally {

        const aiRes = await fetch(
  `/api/kullanici/ai-performance?kullanici_id=${userId}`
);

const aiJson = await aiRes.json();

if (aiJson.ok) {
  setAiInsightText(aiJson.insight);
}

      setLoading(false);
    }
  }

  /* ── existing cards (unchanged) ── */
  const cards = [
    { title: "Online Sınavlar",          desc: "Size atanmış aktif sınavları çözün ve sonucunuzu görün.", Icon: ClipboardList,  color: "text-blue-500",    bg: "bg-blue-500/10 dark:bg-blue-500/20",    path: "/kullanici/sinavlar?type=normal" },
    { title: "AI Sınavlar",              desc: "Yapay zeka tarafından oluşturulan sınavları çözün.",      Icon: Bot,            color: "text-violet-500",  bg: "bg-violet-500/10 dark:bg-violet-500/20",path: "/kullanici/sinavlar?type=ai"     },
    { title: "Eğitim Sonrası Anketler",  desc: "Eğitimlerden sonra geri bildirim formunu doldurun.",     Icon: FileBarChart2,  color: "text-amber-500",   bg: "bg-amber-500/10 dark:bg-amber-500/20",  path: "/kullanici/anketler"             },
    { title: "Başarı Puan Hesaplama",    desc: "Sınav sonuçlarınızı ve başarı durumunuzu görüntüleyin.", Icon: Medal,          color: "text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/20",path: "/kullanici/sonuclar"            },
  ];

  /* ── helpers ── */
  function scoreColor(s) { return s >= 85 ? "text-emerald-500" : s >= 70 ? "text-amber-500" : "text-rose-500"; }
  function scoreBg(s)    { return s >= 85 ? "bg-emerald-500"   : s >= 70 ? "bg-amber-500"   : "bg-rose-500";   }
  function diffBadge(d)  {
    const map = { easy:"bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", medium:"bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", hard:"bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" };
    const label = { easy:"Kolay", medium:"Orta", hard:"Zor" };
    return { cls: map[d] || map.medium, lbl: label[d] || "Orta" };
  }
  function formatDate(d) { return d ? new Date(d).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }

  /* ═══════════════════════════════════════════════════════════════ */
  return (
    <KullaniciLayout pageTitle="Ölçme & Değerlendirme">
      <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ① HEADER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 lg:p-10">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-blue-500/10 via-violet-500/5 to-transparent blur-3xl rounded-full" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">SporthINK Ölçme Merkezi</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Ölçme & Değerlendirme</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Online sınavlar, eğitim sonrası anketler ve başarı puanı modülleri</p>
          </div>
        </section>

        {/* ② KPI CARDS — لوحة الأداء الشخصي */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-700 w-2/3 mb-3" />
                <div className="h-8 rounded bg-slate-200 dark:bg-slate-700 w-1/2" />
              </div>
            ))
          ) : (
            [
              { label:"Ortalama Puan",   val: performance ? `${performance.avg}%`  : "—",  Icon: BarChart3,    bg:"bg-blue-500/10 dark:bg-blue-500/20",       color:"text-blue-500"    },
              { label:"En Yüksek",       val: performance ? `${performance.best}%` : "—",  Icon: ArrowUp,      bg:"bg-emerald-500/10 dark:bg-emerald-500/20", color:"text-emerald-500" },
              { label:"Geçen Sınavlar",  val: performance ? `${performance.passing}/${performance.total}` : "0/0", Icon: CheckCircle2, bg:"bg-amber-500/10 dark:bg-amber-500/20", color:"text-amber-500" },
              { label:"Platform Üstü",   val: performance ? `%${performance.betterThan}` : "%0", Icon: TrendingUp, bg:"bg-rose-500/10 dark:bg-rose-500/20", color:"text-rose-500" },
            ].map((k,i) => (
              <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${k.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <k.Icon className={`w-6 h-6 ${k.color}`} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{k.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{k.val}</p>
              </div>
            ))
          )}
        </div>

        {/* ③ AI INSIGHT — نقاط القوة والضعف */}
        <section className="flex items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border border-violet-200/80 dark:border-violet-700/50 shadow-xl shadow-violet-200/30 dark:shadow-black/20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">AI Performans Analizi</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{aiInsightText}</p>
          </div>
        </section>

        {/* ④ PERFORMANCE CHART — تحليل الأداء بالشارت */}
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Puan Gelişimi</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Son sınavların</p>
            </div>
          </div>

          {quizResults.length > 0 ? (
  <div className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-950/50 p-6 flex items-end gap-4 overflow-x-auto">
    {[...quizResults].reverse().map((r, i) => {
      const value = Number(r.score || 0);

      return (
        <div key={i} className="flex flex-col items-center justify-end gap-2 min-w-[55px] h-full">
          <span className="text-xs font-black text-slate-700 dark:text-white">
            %{value}
          </span>

          <div
            className="w-10 rounded-t-2xl bg-[#E61A21] shadow-lg shadow-red-500/30"
            style={{
              height: `${Math.max(30, value * 2)}px`,
            }}
          />

          <span className="text-[10px] font-black text-slate-400 text-center leading-tight max-w-[70px] truncate">
  {r?.quizzes?.title || r?.training_name || `Sınav ${i + 1}`}
</span>
        </div>
      );
    })}
  </div>
) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex items-end gap-1.5 mb-4 opacity-20">
                {[40,65,55,80,70,90,75].map((h,i) => (
                  <div key={i} className="w-8 rounded-t-md bg-slate-400" style={{height: h}} />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Henüz sınav çözmedin</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Bir sınav tamamladığında grafik burada görünecek</p>
            </div>
          )}
        </section>

        {/* ⑤ STRENGTHS + WEAKNESSES + PLATFORM COMPARISON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Güçlü */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 border border-emerald-200/80 dark:border-emerald-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Star className="w-4.5 h-4.5 text-emerald-500 w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Güçlü Yönler</p>
            </div>
            {quizResults.filter(r => (r.score||0) >= 70).length > 0 ? (
              quizResults.filter(r => (r.score||0) >= 70).slice(0,3).map((r,i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-emerald-100 dark:border-emerald-800/30 last:border-0">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate flex-1">{r.quizzes?.title || "Sınav"}</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 ml-3">{r.score}%</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">Henüz veri yok</p>
            )}
          </div>

          {/* Gelişim */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 border border-rose-200/80 dark:border-rose-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Target className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Gelişim Alanları</p>
            </div>
            {quizResults.filter(r => (r.score||0) < 70).length > 0 ? (
              quizResults.filter(r => (r.score||0) < 70).slice(0,3).map((r,i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-rose-100 dark:border-rose-800/30 last:border-0">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate flex-1">{r.quizzes?.title || "Sınav"}</span>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 ml-3">{r.score}%</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                {quizResults.length > 0 ? "Tüm sınavlarda başarılısın! 🎉" : "Henüz veri yok"}
              </p>
            )}
          </div>

          {/* Platform karşılaştırma */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Platform Karşılaştırması</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Senin ortalaман</span>
                  <span className="text-rose-500">{performance ? `${performance.avg}%` : "—"}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-700"
                    style={{ width: `${performance?.avg || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Platform ortalaması</span>
                  <span className="text-slate-400 dark:text-slate-500">
  {performance ? `${performance.platformAvg}%` : "—"}
</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-300 dark:bg-slate-600" style={{ width: `${performance?.platformAvg || 0}%` }} />
                </div>
              </div>
            </div>
            {performance && performance.avg > 61 && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Kullanıcıların %{performance.betterThan}&apos;inden daha iyisin!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ⑥ AVAILABLE QUIZZES — الكويزات المتاحة */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Çözülmemiş Sınavlar {availableQuizzes.length > 0 && `(${availableQuizzes.length})`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 animate-pulse">
                  <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-1/3 mb-3" />
                  <div className="h-5 rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                  <div className="h-5 rounded bg-slate-200 dark:bg-slate-700 w-3/4" />
                </div>
              ))}
            </div>
          ) : availableQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {availableQuizzes.slice(0, 6).map((q) => {
                const diff = diffBadge(q.difficulty);
                return (
                  <button
                    key={q.id}
                    onClick={() => router.push(q.path)}
                    className="group text-left p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <HelpCircle className="w-5 h-5 text-rose-500" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${diff.cls}`}>
                        {diff.lbl}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">
                      {q.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                      {q.question_count && (
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3 h-3" />{q.question_count} soru
                        </span>
                      )}
                      {q.estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{q.estimated_minutes} dk
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                      <Play className="w-3 h-3" /> Başla
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-base font-black text-slate-900 dark:text-white mb-1">Tüm sınavları tamamladın!</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Yeni sınavlar eklendiğinde burada görünecek.</p>
            </div>
          )}
        </section>

        {/* ⑦ QUIZ HISTORY TABLE — سجل الاختبارات */}
<section className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
  <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-700/50">
    <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
      <ClipboardList className="w-5 h-5 text-rose-500" />
    </div>

    <div className="flex items-center justify-between w-full">
      <p className="text-sm font-bold text-slate-900 dark:text-white">
        Sınav Geçmişi
      </p>

      <button
        onClick={() => setShowExamHistory(!showExamHistory)}
        className="px-4 py-2 rounded-xl bg-[#E61A21] text-white text-[10px] font-black uppercase"
      >
        {showExamHistory ? "Gizle" : "Göster"}
      </button>
    </div>
  </div>

  {showExamHistory && (
    <>
      {loading ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-3.5 rounded bg-slate-200 dark:bg-slate-700 w-1/2 mb-1.5" />
                <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-700 w-1/4" />
              </div>
              <div className="h-5 rounded bg-slate-200 dark:bg-slate-700 w-12" />
            </div>
          ))}
        </div>
      ) : quizResults.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {quizResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${(r.score || 0) >= 70 ? "bg-emerald-500/10 dark:bg-emerald-500/20" : "bg-rose-500/10 dark:bg-rose-500/20"}`}>
                  {(r.score || 0) >= 70
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <AlertCircle className="w-4 h-4 text-rose-500" />}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {r.quizzes?.title || "Sınav"}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />{formatDate(r.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className={`text-lg font-black ${scoreColor(r.score || 0)}`}>
                    {r.score || 0}%
                  </p>
                  <p className={`text-[9px] font-bold uppercase ${(r.score || 0) >= 70 ? "text-emerald-500" : "text-rose-500"}`}>
                    {(r.score || 0) >= 70 ? "Geçti" : "Kaldı"}
                  </p>
                </div>

                <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(r.score || 0)}`} style={{ width: `${r.score || 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white mb-1">
            Henüz sınav geçmişi yok
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Bir sınav tamamladığında burada görünecek.
          </p>
        </div>
      )}
    </>
  )}
</section>

        {/* ⑧ MODULES — original 4 cards (unchanged logic, new design) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Modüller</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => router.push(card.path)}
                className="group text-left p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <card.Icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{card.desc}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                  Aç <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </KullaniciLayout>
  );
}