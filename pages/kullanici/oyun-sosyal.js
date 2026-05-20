import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import KullaniciLayout from "../../components/KullaniciLayout";
import {
  Trophy, Zap, Star, Shield, Users, Target, Brain,
  Lock, Medal, Crown, Swords, MessageSquare, ChevronRight,
  CheckCircle2, X, Send, TrendingUp, Flame, Award,
  BookOpen, Loader2, Radio
} from "lucide-react";

export default function OyunSosyal() {
  const [myPoints,       setMyPoints]       = useState(0);
  const [myLevel,        setMyLevel]        = useState(1);
  const [badges,         setBadges]         = useState([]);
  const [leaderboard,    setLeaderboard]    = useState([]);
  const [groups,         setGroups]         = useState([]);
  const [mission,        setMission]        = useState(null);
  const [userName,       setUserName]       = useState("Kullanıcı");
  const [showBoss,       setShowBoss]       = useState(false);
  const [showQuiz,       setShowQuiz]       = useState(false);
  const [quiz,           setQuiz]           = useState(null);
  const [quizQuestions,  setQuizQuestions]  = useState([]);
  const [answers,        setAnswers]        = useState({});
  const [showAnaliz,     setShowAnaliz]     = useState(false);
  const [scenario,       setScenario]       = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [analizResult,   setAnalizResult]   = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showKonuslan,   setShowKonuslan]   = useState(false);
  const [konuslanText,   setKonuslanText]   = useState("");
  const [konuslanDone,   setKonuslanDone]   = useState(false);
  const [coopStatus,     setCoopStatus]     = useState({ activeCount: 0, requiredCount: 5, unlocked: false });
  const [activities, setActivities] = useState([]);
  const [teamPanel, setTeamPanel] = useState(null);

  /* ── ALL ORIGINAL FUNCTIONS UNCHANGED ─────────────────────────── */

  async function startKullaniciQuiz() {
    const res  = await fetch("/api/oyunlastirma/quiz-start");
    const json = await res.json();
    if (!json.success) { alert(json.error || "Quiz bulunamadı"); return; }
    setQuiz(json.quiz);
    setQuizQuestions(json.questions || []);
    setAnswers({});
    setShowQuiz(true);
  }

  async function submitQuiz() {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) { alert("Önce giriş yapmalısın"); return; }
    const studentName = localStorage.getItem("userName") || userName || "Kullanıcı";
    const res  = await fetch("/api/oyunlastirma/quiz-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: quiz.id, user_id: userId, student_name: studentName, answers }),
    });
    const json = await res.json();
    if (!json.success) { alert("Sonuç kaydedilemedi: " + (json.error || "Bilinmeyen hata")); return; }
    await fetch("/api/oyunlastirma/add-points", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: userId,
    student_name: studentName,
    points: json.earnedXP || 0,
    source: "quiz_completed",
  }),
});
    alert(`Quiz tamamlandı! Puan: ${json.score} | +${json.earnedXP} XP`);
    await fetch("/api/oyunlastirma/add-activity", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: userId,
    student_name: studentName,

    action_type: "quiz",

    action_title: "Quiz Tamamlandı",

    action_desc: `${quiz.title} başarıyla tamamlandı.`,

    xp_earned: json.earnedXP || 0,
  }),
});
    setCompletedSteps((prev) => [...new Set([...prev, "01"])]);
    setShowQuiz(false);
    fetchAll(studentName);
  }

  async function startAnaliz() {

  const { data, error } = await supabase
  .from("mission_scenarios")
  .select("*")
  .eq("step", 2);

  console.log("SCENARIO DATA:", data);
  console.log("SCENARIO ERROR:", error);

  if (error || !data || data.length === 0) {
    alert("Senaryo bulunamadı");
    return;
  }

  const random =
    data[Math.floor(Math.random() * data.length)];

  setScenario(random);

  setSelectedOption(null);

  setAnalizResult(null);

  setShowAnaliz(true);
}

  async function submitAnaliz() {
    if (!selectedOption) return alert("Bir seçenek seç!");
    const xpKey   = `xp_${selectedOption.toLowerCase()}`;
    const earnedXP = scenario[xpKey] || 0;
    const studentName = localStorage.getItem("userName") || "Kullanıcı";
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) { alert("Önce giriş yapmalısın"); return; }
    const response = await fetch("/api/oyunlastirma/add-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, student_name: studentName, points: 20, source: "konuslan_step" }),
    });
    const result = await response.json();
    if (!result.success) { alert("Hata: " + (result.error || "Bir şey yanlış gitti")); return; }
    setAnalizResult({ xp: earnedXP, option: selectedOption });
    await fetch("/api/oyunlastirma/add-activity", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: userId,
    student_name: studentName,

    action_type: "analysis",

    action_title: "AI Analizi Tamamlandı",

    action_desc: `Senaryo analizi başarıyla gerçekleştirildi.`,

    xp_earned: earnedXP || 0,
  }),
});
    setCompletedSteps(prev => [...prev, "02"]);
    setTimeout(() => { setShowAnaliz(false); fetchAll(studentName); }, 2500);
  }

  async function submitKonuslan() {
    if (!konuslanText.trim()) return alert("Bir şeyler yaz!");
    const studentName = localStorage.getItem("userName") || "Kullanıcı";
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    await fetch("/api/oyunlastirma/add-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, student_name: studentName, points: 20, source: "konuslan_step" }),
    });
    setKonuslanDone(true);
    setCompletedSteps(prev => [...prev, "03"]);
    setTimeout(async () => {

  setShowKonuslan(false);

  fetchAll(studentName);

  await fetch("/api/oyunlastirma/add-activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      student_name: studentName,

      action_type: "communication",

      action_title: "İletişim Görevi Tamamlandı",

      action_desc: "Konuşlan görevi başarıyla gönderildi.",

      xp_earned: 20,
    }),
  });

}, 2500);
  }

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const finalName  = (storedName && storedName !== "undefined") ? storedName : "Kullanıcı";
    setUserName(finalName);
    fetchAll(finalName);
    const timer = setTimeout(() => setShowBoss(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  async function fetchAll(name) {
    let finalName = name;
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (userId) {
  await fetch("/api/kullanici/track-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      student_name: finalName,
      email: authData?.user?.email,
    }),
  });
}
    if (userId) {
      const userEmail = authData?.user?.email;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("email", userEmail).maybeSingle();
      if (profile?.full_name) {
        setUserName(profile.full_name);
        localStorage.setItem("userName", profile.full_name);
        finalName = profile.full_name;
      }
    }
    const res        = await fetch("/api/oyunlastirma/leaderboard");
    const json       = await res.json();
    const leaderData = json.leaderboard;
    setLeaderboard(leaderData || []);
    const currentUser  = (leaderData || []).find((u) => u.student_name === finalName);
    const totalPoints  = Number(currentUser?.points || 0);
    setMyPoints(totalPoints);
    setMyLevel(Math.floor(totalPoints / 100) + 1);
    const { data: allBadges } = await supabase.from("badges").select("*");
    setBadges((allBadges || []).filter(b => Number(b.required_points) <= totalPoints));
    const groupsRes  = await fetch("/api/oyunlastirma/groups");
    const groupsJson = await groupsRes.json();
    setGroups(groupsJson.groups || []);
    const { data: missionData } = await supabase.from("announcements").select("*").eq("target_dept", "Kullanıcı").order("created_at", { ascending: false }).limit(1).maybeSingle();
    setMission(missionData || null);
    const coopRes  = await fetch("/api/oyunlastirma/cooperation-status");
    const coopJson = await coopRes.json();
    if (coopJson.success) setCoopStatus({ activeCount: coopJson.activeCount, requiredCount: coopJson.requiredCount, unlocked: coopJson.unlocked });

    const activityRes = await fetch(
  userId
    ? `/api/oyunlastirma/activity-list?user_id=${userId}`
    : "/api/oyunlastirma/activity-list"
);

const activityJson = await activityRes.json();

if (activityJson.success) {
  setActivities(activityJson.activities || []);
}

  }

  async function joinGroup(id) {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    let studentName = localStorage.getItem("userName") || "Kullanıcı";
    if (!userId) { alert("Önce giriş yapmalısın"); return; }
    const res  = await fetch("/api/oyunlastirma/join-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: id, user_id: userId, student_name: studentName }),
    });
    const json = await res.json();
    if (!json.success) { console.error("JOIN GROUP ERROR:", json); alert("Hata: " + (json.error || "Bir şey yanlış gitti")); return; }
    if (json.alreadyJoined) { alert("Bu gruba daha önce katıldınız."); } else { alert("Gruba başarıyla katıldınız 🔥"); }
    fetchAll(studentName);
  }

  async function startDoctorQuiz() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) { alert("Lütfen önce giriş yapın"); return; }
    const { error } = await supabase.from("user_missions").upsert(
      { user_id: user.id, mission_key: "doctor_big_quiz", current_step: 1, completed: false },
      { onConflict: "user_id,mission_key" }
    );
    if (error) { console.error("Sınav başlatma hatası:", error.message); alert("Sınav başlatılamadı"); return; }
    window.location.href = "/final-quizs";
  }

  /* ── DERIVED ── */
  const myRank    = leaderboard.findIndex(u => u.student_name === userName) + 1;
  const xpProgress = myPoints % 100;

  const medalIcon = (i) => {
    if (i === 0) return <Crown className="w-4 h-4 text-amber-400" />;
    if (i === 1) return <Medal className="w-4 h-4 text-slate-400" />;
    if (i === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-black text-slate-400 dark:text-slate-500">#{i+1}</span>;
  };

  const podiumHeight = ["h-20", "h-28", "h-16"];
  const podiumOrder  = ["order-2", "order-1", "order-3"];

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <KullaniciLayout pageTitle="Oyunlaştırma">
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ① HERO HEADER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 lg:p-10">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-violet-500/10 via-blue-500/5 to-transparent blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            {/* Left: profile */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-xl shadow-rose-500/25 shrink-0">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Operatör — Çevrimiçi</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{userName}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
                    <Star className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Seviye {myLevel}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">{myPoints} XP</span>
                  </span>
                  {myRank > 0 && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20">
                      <Trophy className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-sm">#{myRank} Sıralama</span>
                    </span>
                  )}
                </div>
                <div className="mt-4 max-w-xs">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    <span>Seviye İlerlemesi</span>
                    <span className="text-rose-500">{xpProgress}/100 XP</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: badges */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">Kazanılan Rozetler</p>
              <div className="grid grid-cols-4 gap-2">
                {badges.slice(0, 4).map((b, i) => (
                  <div key={b.id} className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center" title={b.title}>
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                ))}
                {[...Array(Math.max(0, 4 - badges.length))].map((_, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center opacity-40">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ② MAIN GRID: Leaderboard + Mission */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* LEADERBOARD */}
          <div className="xl:col-span-3 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Rekabet</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Küresel Liderlik Tablosu</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20">
                <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Canlı</span>
              </div>
            </div>

            {/* Podium top 3 */}
            {leaderboard.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-6">
                {leaderboard.slice(0, 3).map((u, i) => {
                  const isMe = u.student_name === userName;
                  return (
                    <div key={i} className={`flex flex-col items-center ${podiumOrder[i]}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center mb-2 text-sm font-black text-slate-600 dark:text-slate-300">
                        {u.student_name?.[0] || "?"}
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1 max-w-[64px] truncate text-center">{u.student_name?.split(" ")[0]}</p>
                      <div className={`w-20 ${podiumHeight[i]} rounded-t-xl flex flex-col items-center justify-center gap-1 ${
                        isMe
                          ? "bg-gradient-to-t from-rose-500/20 to-rose-500/5 border border-rose-500/30"
                          : "bg-gradient-to-t from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-700/50 border border-slate-200 dark:border-slate-600"
                      }`}>
                        {medalIcon(i)}
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{u.points}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rows 4–8 */}
            <div className="space-y-2">
              {leaderboard.slice(3, 8).map((u, i) => {
                const isMe = u.student_name === userName;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isMe
                      ? "bg-rose-500/8 dark:bg-rose-500/15 border border-rose-500/20"
                      : "bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50"
                  }`}>
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 w-6 text-center">#{i + 4}</span>
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                      {u.student_name?.[0] || "?"}
                    </div>
                    <span className={`flex-1 text-sm font-semibold truncate ${isMe ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                      {u.student_name}{isMe && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black">Sen</span>}
                    </span>
                    <span className={`text-xs font-black ${isMe ? "text-rose-500" : "text-slate-500 dark:text-slate-400"}`}>{u.points} XP</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Mission + Groups */}
          <div className="xl:col-span-2 flex flex-col gap-5">

            {/* MISSION */}
            <div className="flex-1 p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">Bölüm 01 — Aktif</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {mission ? mission.title : "Görev Yükleniyor..."}
                  </p>
                </div>
              </div>

              {mission && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{mission.content}</p>
              )}

              {/* Steps */}
              <div className="flex gap-2">
                {[
                  { num: "01", label: "İşe Al",   active: true,                          action: startKullaniciQuiz,         Icon: BookOpen   },
                  { num: "02", label: "Analiz Et", active: true,                          action: startAnaliz,                Icon: Brain      },
                  { num: "03", label: "Konuşlan",  active: completedSteps.includes("02"), action: () => setShowKonuslan(true), Icon: MessageSquare },
                ].map(({ num, label, active, action, Icon }) => (
                  <button
                    key={num}
                    onClick={active ? action : undefined}
                    disabled={!active}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-300 ${
                      completedSteps.includes(num)
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 cursor-default"
                        : active
                        ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        : "bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-widest">ADIM {num}</span>
                    {completedSteps.includes(num)
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : active
                      ? <Icon className="w-4 h-4 text-rose-500" />
                      : <Lock className="w-4 h-4 text-slate-400" />
                    }
                    <span className={`text-[10px] font-bold ${completedSteps.includes(num) ? "text-emerald-600 dark:text-emerald-400" : active ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* GROUPS */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Aktif Gruplar</p>
              </div>
              <div className="space-y-3">
                {groups.slice(0, 2).map((g) => (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Shield className="w-4.5 h-4.5 text-blue-500 w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{g.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Aktif Görev</p>
                    </div>
                    <button
                      onClick={() => joinGroup(g.id)}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200"
                    >
                      Katıl
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ③ BOTTOM ROW: Coop + Doctor Quiz */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* TEAM MISSION CENTER */}
<div className="xl:col-span-2 relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
  <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />

  <div className="relative z-10">
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          coopStatus.unlocked
            ? "bg-emerald-500/10 dark:bg-emerald-500/20"
            : "bg-amber-500/10 dark:bg-amber-500/20"
        }`}>
          <Users className={`w-6 h-6 ${
            coopStatus.unlocked ? "text-emerald-500" : "text-amber-500"
          }`} />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">
            Takım Görev Merkezi
          </p>

          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {coopStatus.unlocked ? "Ekip göreve hazır" : "Ekip aktivasyonu bekleniyor"}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            İş birliği modülü, ekip katılımı ve ortak görev hazırlığını takip eder.
          </p>
        </div>
      </div>

      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
        coopStatus.unlocked
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      }`}>
        {coopStatus.unlocked ? "Aktif" : "Hazırlık"}
      </span>
    </div>

    <div className="grid grid-cols-3 gap-3 mb-5">
  <button
    onClick={() => setTeamPanel("active")}
    className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-300 transition-all"
  >
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
      Aktif Üye
    </p>
    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
      {coopStatus.activeCount}
    </p>
  </button>

  <button
    onClick={() => setTeamPanel("target")}
    className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:border-amber-300 transition-all"
  >
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
      Hedef
    </p>
    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
      {coopStatus.requiredCount}
    </p>
  </button>

  <button
    onClick={() => setTeamPanel("progress")}
    className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:border-rose-300 transition-all"
  >
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
      Hazırlık
    </p>
    <p className={`text-xl font-black mt-1 ${
      coopStatus.unlocked ? "text-emerald-500" : "text-rose-500"
    }`}>
      %{Math.min(100, Math.round((coopStatus.activeCount / coopStatus.requiredCount) * 100))}
    </p>
  </button>
</div>

{teamPanel && (
  <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
    {teamPanel === "active" && (
      <>
        <p className="text-xs font-black text-slate-900 dark:text-white">
          Aktif Üyeler
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Bu değer, gruplara katılan gerçek kullanıcı sayısından hesaplanır.
        </p>
      </>
    )}

    {teamPanel === "target" && (
      <>
        <p className="text-xs font-black text-slate-900 dark:text-white">
          Takım Hedefi
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Ortak görevlerin açılması için gereken minimum ekip sayısıdır.
        </p>
      </>
    )}

    {teamPanel === "progress" && (
      <>
        <p className="text-xs font-black text-slate-900 dark:text-white">
          Hazırlık Analizi
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Hazırlık oranı aktif üye sayısına göre otomatik hesaplanır.
        </p>
      </>
    )}
  </div>
)}

    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Ekip Hazırlık Durumu
        </p>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400">
          {coopStatus.activeCount}/{coopStatus.requiredCount}
        </p>
      </div>

      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            coopStatus.unlocked
              ? "bg-gradient-to-r from-emerald-500 to-green-500"
              : "bg-gradient-to-r from-rose-500 to-orange-500"
          }`}
          style={{
            width: `${Math.min(100, (coopStatus.activeCount / coopStatus.requiredCount) * 100)}%`,
          }}
        />
      </div>
    </div>

    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
      <div>
        <p className="text-xs font-black text-slate-900 dark:text-white">
          Ortak Görev: Stratejik Kriz Simülasyonu
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Ekip hazır olduğunda ortak analiz ve karar görevi açılır.
        </p>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black whitespace-nowrap"
      >
        Grupları Gör
      </button>
    </div>
  </div>
</div>

          {/* DOCTOR QUIZ */}
          <div className="relative overflow-hidden p-5 rounded-2xl min-h-[180px] bg-gradient-to-r from-rose-500/10 via-orange-500/5 to-amber-500/5 dark:from-rose-500/20 dark:via-orange-500/10 dark:to-amber-500/10 border border-rose-200/50 dark:border-rose-500/30 shadow-lg">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-rose-500/20 to-transparent blur-2xl rounded-full" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 dark:bg-rose-500/25 flex items-center justify-center">
                  <Swords className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Özel Etkinlik</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Doktorun Büyük Sınavı</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">+500 XP + Nadir Rozet</p>
                </div>
              </div>
              <button
                onClick={startKullaniciQuiz}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
              >
                <Flame className="w-4 h-4" />
                Başlat
              </button>
            </div>
          </div>

            {/* SON AKTİVİTELER */}
<section className="xl:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
        <TrendingUp className="w-5 h-5 text-violet-500" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">
          Canlı Öğrenme Akışı
        </p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Son Aktiviteler
        </p>
      </div>
    </div>

    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
      Live
    </span>
  </div>

  {activities.length === 0 ? (
    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 text-center">
      <p className="text-sm font-black text-slate-900 dark:text-white">
        Henüz aktivite yok
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Quiz, görev, grup katılımı ve analiz sonuçları burada görünecek.
      </p>
    </div>
  ) : (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {activities.slice(0, 4).map((a) => (
        <div
          key={a.id}
          className="group min-w-[280px] max-w-[280px] relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center shrink-0 text-white">
            <Zap className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                {a.action_title}
              </p>

              <span className="text-[10px] font-black text-amber-500 whitespace-nowrap">
                +{a.xp_earned || 0} XP
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {a.action_desc}
            </p>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
              {a.student_name || "Kullanıcı"} ·{" "}
              {a.created_at
                ? new Date(a.created_at).toLocaleString("tr-TR")
                : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

        </div>
      </div>

      {/* ══ FLOATING BOSS ══════════════════════════════════════════ */}
      {showBoss && (
        <div className="fixed bottom-7 right-7 z-50 animate-in slide-in-from-right-8 fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/40 rounded-2xl p-5 max-w-[260px] shadow-2xl shadow-black/20 dark:shadow-black/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                <Swords className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">Koruyucu Karşılaşması</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">YZ Patron: SWOT Testi</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBoss(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl transition-all"
              >
                Sistemi Koru
              </button>
              <button
                onClick={() => setShowBoss(false)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ QUIZ MODAL ═════════════════════════════════════════════ */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-5">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                <Swords className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Özel Etkinlik</p>
                <p className="text-base font-black text-slate-900 dark:text-white">Doktorun Büyük Sınavı</p>
              </div>
              <button onClick={() => setShowQuiz(false)} className="ml-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {quizQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">{q.question_text}</p>
                  <div className="space-y-2">
                    {["A", "B", "C", "D"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                          answers[q.id] === opt
                            ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/50 text-rose-700 dark:text-rose-300 font-bold"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/50"
                        }`}
                      >
                        <span className="font-bold mr-2">{opt}.</span>{q[`option_${opt.toLowerCase()}`]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitQuiz}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <CheckCircle2 className="w-5 h-5" />
              Sınavı Bitir
            </button>
          </div>
        </div>
      )}

      {/* ══ ANALİZ MODAL ═══════════════════════════════════════════ */}
      {showAnaliz && scenario && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-5">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Adım 02</p>
                <p className="text-base font-black text-slate-900 dark:text-white">{scenario.title}</p>
              </div>
              <button onClick={() => setShowAnaliz(false)} className="ml-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{scenario.description}</p>

            {analizResult ? (
              <div className="text-center py-8 rounded-2xl bg-emerald-500/8 dark:bg-emerald-500/15 border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{analizResult.xp} XP Kazandın!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Harika karar! Adım 3 açıldı.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-5">
                  {["A", "B", "C"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        selectedOption === opt
                          ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/50 text-rose-700 dark:text-rose-300 font-bold"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/50"
                      }`}
                    >
                      <span className="font-bold mr-2">{opt}.</span>{scenario[`option_${opt.toLowerCase()}`]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={submitAnaliz}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Target className="w-5 h-5" />
                  Kararımı Ver
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ KONUŞLAN MODAL ═════════════════════════════════════════ */}
      {showKonuslan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-5">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Adım 03</p>
                <p className="text-base font-black text-slate-900 dark:text-white">Bugün ne öğrendin?</p>
              </div>
              <button onClick={() => setShowKonuslan(false)} className="ml-auto p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Düşüncelerini paylaş ve +20 XP kazan!</p>

            {konuslanDone ? (
              <div className="text-center py-8 rounded-2xl bg-emerald-500/8 dark:bg-emerald-500/15 border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+20 XP Kazandın!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tebrikler! Tüm adımları tamamladın.</p>
              </div>
            ) : (
              <>
                <textarea
                  value={konuslanText}
                  onChange={(e) => setKonuslanText(e.target.value)}
                  placeholder="Bugün öğrendiklerini buraya yaz..."
                  className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none outline-none focus:border-rose-300 dark:focus:border-rose-500/50 transition-colors mb-4 font-[inherit]"
                />
                <button
                  onClick={submitKonuslan}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                  Paylaş
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </KullaniciLayout>
  );
}