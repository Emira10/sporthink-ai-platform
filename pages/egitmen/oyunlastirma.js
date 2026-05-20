import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import {
  IconTrophy,
  IconPuzzle,
  IconHelpCircle,
  IconRocket,
  IconPlus,
  IconChevronRight,
  IconUsers,
  IconStar,
  IconCheck,
  IconX,
  IconMedal,
  IconBolt,
  IconSend,
  IconBrain,
  IconListDetails,
} from "@tabler/icons-react";

// ── shared input class factory ──
const inputCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50 focus:bg-white/[0.06]"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50 focus:bg-white"}`;

const selectCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white focus:border-[#E61A21]/50"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#E61A21]/50"}`;

// ── section box component ──
function SBox({ isDark, accent = "#E61A21", icon: Icon, label, tag, children }) {
  return (
    <div
      style={{ borderTop: `3px solid ${accent}` }}
      className={`rounded-[1.5rem] p-6 ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <span
          style={{ backgroundColor: `${accent}15`, color: accent }}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        >
          <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-[0.3em]">
            {label}
          </p>
        </div>
        {tag && (
          <span
            style={{ backgroundColor: `${accent}12`, color: accent }}
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0"
          >
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── submit button ──
function SubmitBtn({ isDark, loading, label, accent = "#E61A21" }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{ backgroundColor: accent }}
      className="w-full flex items-center justify-between rounded-xl px-5 py-3.5 text-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
      <IconSend size={15} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

export default function Oyunlastirma() {
  // ── state — كودك الأصلي ──
  const [badges, setBadges]               = useState([]);
  const [badgeWinners, setBadgeWinners] = useState({});
  const [groups, setGroups]               = useState([]);
  const [badgeTitle, setBadgeTitle]       = useState("");
  const [badgePoints, setBadgePoints]     = useState("");
  const [badgeIcon, setBadgeIcon]         = useState("🏅");
  const [groupTitle, setGroupTitle]       = useState("");
  const [groupInterest, setGroupInterest] = useState("");
  const [missionTitle, setMissionTitle]   = useState("İK Kurtarma Operasyonu");
  const [missionDesc, setMissionDesc]     = useState("Sistem ihlal edildi — Verileri kurtarmak için İK stratejilerini kullan!");
  const [missionExamTitle, setMissionExamTitle] = useState("Doktorun Büyük Sınavı");
  const [quizzes, setQuizzes]             = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [questionText, setQuestionText]   = useState("");
  const [optionA, setOptionA]             = useState("");
  const [optionB, setOptionB]             = useState("");
  const [optionC, setOptionC]             = useState("");
  const [optionD, setOptionD]             = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [questions, setQuestions]         = useState([]);
  const router = useRouter();

  useEffect(() => { fetchData(); }, []);

  // ── fetchData — كودك الأصلي ──
  async function fetchData() {
    const { data: badgeData, error: badgeError } = await supabase
      .from("badges").select("*").order("required_points", { ascending: true });
    if (badgeError) { alert("Rozetler alınamadı: " + badgeError.message); return; }
    setBadges(badgeData || []);

    const winnersRes = await fetch("/api/egitmen/badge-winners");
const winnersJson = await winnersRes.json();

if (winnersJson.ok) {
  setBadgeWinners(winnersJson.winnersMap || {});
}

    const { data: groupData, error: groupError } = await supabase
      .from("social_groups")
      .select(`*, social_group_members(id, student_name, joined_at)`)
      .order("created_at", { ascending: false });
    if (groupError) { alert("Gruplar alınamadı: " + groupError.message); return; }
    setGroups(groupData || []);

    const { data: quizData } = await supabase.from("quizzes").select("*").eq("is_active", true);
    setQuizzes(quizData || []);
    if (quizData && quizData.length > 0) {
      setSelectedQuizId(quizData[0].id);
      const { data: qData } = await supabase
        .from("quiz_questions").select("*").eq("quiz_id", quizData[0].id);
      setQuestions(qData || []);
    }
  }

  async function createBadge(e) {
  e.preventDefault();
  if (!badgeTitle || !badgePoints) return alert("Eksik veri");

  const res = await fetch("/api/egitmen/manage-gamification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "badge",
      payload: {
        title: badgeTitle,
        required_points: badgePoints,
        icon: badgeIcon,
      },
    }),
  });

  const json = await res.json();
  if (!json.ok) return alert(json.message);

  setBadgeTitle("");
  setBadgePoints("");
  setBadgeIcon("🏅");
  fetchData();
}

  // ── createGroup — كودي الأصلي ──
  async function createGroup(e) {
  e.preventDefault();
  if (!groupTitle) return alert("Grup adı yaz");

  const res = await fetch("/api/egitmen/manage-gamification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "group",
      payload: {
        title: groupTitle,
        interest_area: groupInterest,
      },
    }),
  });

  const json = await res.json();
  if (!json.ok) return alert(json.message);

  setGroupTitle("");
  setGroupInterest("");
  fetchData();
}

  // ── saveMission — كودي الأصلي ──
  async function saveMission(e) {
  e.preventDefault();

  const res = await fetch("/api/egitmen/manage-gamification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "mission",
      payload: {
        title: missionTitle,
        description: missionDesc,
        exam_title: missionExamTitle,
      },
    }),
  });

  const json = await res.json();
  if (!json.ok) return alert(json.message);

  alert("Görev öğrencilere gönderildi!");
}

  // ── createQuestion — كودي الأصلي ──
  async function createQuestion(e) {
  e.preventDefault();

  if (!questionText || !optionA || !optionB || !optionC || !optionD) {
    return alert("Tüm alanları doldur");
  }

  const res = await fetch("/api/egitmen/manage-gamification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "question",
      payload: {
        quiz_id: selectedQuizId,
        question_text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer,
      },
    }),
  });

  const json = await res.json();
  if (!json.ok) return alert(json.message);

  setQuestionText("");
  setOptionA("");
  setOptionB("");
  setOptionC("");
  setOptionD("");
  setCorrectAnswer("A");

  const { data: qData } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", selectedQuizId);

  setQuestions(qData || []);
}

  async function deleteItem(type, id) {
  if (!window.confirm("Silmek istediğine emin misin?")) return;

  const res = await fetch("/api/egitmen/delete-gamification-item", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      id,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Silinemedi");
    return;
  }

  fetchData();
}

  return (
    <EgitmenLayout pageTitle="Oyunlaştırma & Sosyal Gruplar">
      {({ isDark }) => (
        <div className="space-y-6">

          {/* ══════════════════════════════════════
              ① MISSION CONTROL — Hero
          ══════════════════════════════════════ */}
          <SBox isDark={isDark} accent="#E61A21" icon={IconBolt} label="Görev Kontrolü — Öğrenci Kanalı">
            <form onSubmit={saveMission}>
              <div className="grid md:grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    Görev Başlığı
                  </p>
                  <input
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="ör. Haftalık sprint görevi"
                    className={inputCls(isDark)}
                  />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    Görev Açıklaması
                  </p>
                  <input
                    value={missionDesc}
                    onChange={(e) => setMissionDesc(e.target.value)}
                    placeholder="Kısa açıklama gir"
                    className={inputCls(isDark)}
                  />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    Sınav Adı
                  </p>
                  <input
                    value={missionExamTitle}
                    onChange={(e) => setMissionExamTitle(e.target.value)}
                    placeholder="ör. Sprint 3 sınavı"
                    className={inputCls(isDark)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-[#E61A21] text-white px-6 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-red-900/30"
              >
                <IconSend size={15} strokeWidth={2} aria-hidden="true" />
                Öğrenciye Gönder
              </button>
            </form>
          </SBox>

          {/* ══════════════════════════════════════
              ② BADGE + GROUP CREATE — 2 kolon
          ══════════════════════════════════════ */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* Rozet oluştur */}
            <SBox isDark={isDark} accent="#F59E0B" icon={IconMedal} label="Rozet Oluştur">
              <form onSubmit={createBadge} className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Rozet Adı</p>
                  <input value={badgeTitle} onChange={(e) => setBadgeTitle(e.target.value)}
                    placeholder="ör. Süper Öğrenci" className={inputCls(isDark)} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Gerekli Puan (XP)</p>
                  <input value={badgePoints} onChange={(e) => setBadgePoints(e.target.value)}
                    placeholder="ör. 500" type="number" className={inputCls(isDark)} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">İkon</p>
                  <input value={badgeIcon} onChange={(e) => setBadgeIcon(e.target.value)}
                    placeholder="🏅" className={inputCls(isDark)} />
                </div>
                <SubmitBtn isDark={isDark} label="Rozeti Kaydet" accent="#F59E0B" />
              </form>
            </SBox>

            {/* Sosyal grup oluştur */}
            <SBox isDark={isDark} accent="#3B82F6" icon={IconPuzzle} label="Sosyal Grup Oluştur">
              <form onSubmit={createGroup} className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Grup Adı</p>
                  <input value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="ör. Frontend Takımı" className={inputCls(isDark)} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">İlgi Alanı</p>
                  <input value={groupInterest} onChange={(e) => setGroupInterest(e.target.value)}
                    placeholder="ör. React, Pazarlama..." className={inputCls(isDark)} />
                </div>
                <SubmitBtn isDark={isDark} label="Grubu Oluştur" accent="#3B82F6" />
              </form>
            </SBox>
          </div>

          {/* ══════════════════════════════════════
              ③ LISTS — Badges + Groups
          ══════════════════════════════════════ */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* Badges list */}
            <SBox isDark={isDark} accent="#F59E0B" icon={IconTrophy} label="Rozetler" tag={`${badges.length} rozet`}>
              {badges.length === 0 ? (
                <div className={`flex items-center justify-center py-8 rounded-xl border-2 border-dashed ${
                  isDark ? "border-white/[0.06]" : "border-zinc-200"
                }`}>
                  <p className={`text-xs font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                    Henüz rozet yok
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {badges.map((b) => (
                    <div
                      key={b.id}
                      style={{ borderLeft: "3px solid #F59E0B" }}
                      className={`flex items-center justify-between px-4 py-2 rounded-r-xl rounded-l-sm transition-all ${
                        isDark ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-zinc-50 hover:bg-amber-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-sm">
                          {b.icon}
                        </div>
                        <div>
  <span className={`font-bold text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
    {b.title}
  </span>

  <div className="mt-2 flex flex-wrap gap-1.5">
    {(badgeWinners[b.id] || []).length === 0 ? (
      <span className="text-[10px] font-bold text-zinc-400">
        Henüz kazanan yok
      </span>
    ) : (
      badgeWinners[b.id].slice(0, 5).map((w, index) => (
        <span
          key={index}
          className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600"
        >
          {w.name}
        </span>
      ))
    )}
  </div>
</div>
                      </div>
                      <span className="text-[11px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">
                        {b.required_points} XP

                        <button
                        type="button"
  onClick={() => deleteItem("badge", b.id)}
  className="ml-3 bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black"
>
  Sil
</button>

                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SBox>

            {/* Groups list */}
            <SBox isDark={isDark} accent="#3B82F6" icon={IconUsers} label="Gruplar" tag={`${groups.length} grup`}>
              {groups.length === 0 ? (
                <div className={`flex items-center justify-center py-8 rounded-xl border-2 border-dashed ${
                  isDark ? "border-white/[0.06]" : "border-zinc-200"
                }`}>
                  <p className={`text-xs font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                    Henüz grup yok
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      style={{ borderLeft: "3px solid #3B82F6" }}
                      className={`rounded-r-xl rounded-l-sm p-4 transition-all ${
                        isDark ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-zinc-50 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className={`font-black text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
                            {g.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{g.interest_area}</p>
                        </div>
                        <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-lg shrink-0">
                          {g.social_group_members?.length || 0} öğrenci

                          <button
                          type="button"
  onClick={() => deleteItem("group", g.id)}
  className="ml-2 bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black"
>
  Sil
</button>

                        </span>
                      </div>

                      {g.social_group_members?.length > 0 && (
                        <div className={`pt-3 border-t ${isDark ? "border-white/[0.06]" : "border-zinc-200"}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-2">
                            Katılan Öğrenciler
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {g.social_group_members.map((m) => (
                              <span
                                key={m.id}
                                className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg ${
                                  isDark ? "bg-white/[0.06] text-zinc-300" : "bg-white text-zinc-700 border border-zinc-200"
                                }`}
                              >
                                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[8px] font-black">
                                  {m.student_name?.charAt(0)}
                                </span>
                                {m.student_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SBox>
          </div>

          {/* ══════════════════════════════════════
              ④ QUIZ QUESTIONS — Create + List
          ══════════════════════════════════════ */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* Soru ekle */}
            <SBox isDark={isDark} accent="#8B5CF6" icon={IconBrain} label="Quiz Sorusu Ekle">
              <form onSubmit={createQuestion} className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Quiz Seç</p>
                  <select value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}
                    className={selectCls(isDark)}>
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Soru Metni</p>
                  <input value={questionText} onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Soruyu buraya yaz..." className={inputCls(isDark)} />
                </div>

                {/* Options 2x2 */}
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Şıklar</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "A", value: optionA, set: setOptionA },
                      { label: "B", value: optionB, set: setOptionB },
                      { label: "C", value: optionC, set: setOptionC },
                      { label: "D", value: optionD, set: setOptionD },
                    ].map(({ label, value, set }) => (
                      <div key={label} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-500">
                          {label}
                        </span>
                        <input
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          placeholder={`${label} şıkkı`}
                          className={`${inputCls(isDark)} pl-8`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Doğru Cevap</p>
                  <div className="flex gap-2">
                    {["A", "B", "C", "D"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCorrectAnswer(opt)}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                          correctAnswer === opt
                            ? "bg-[#8B5CF6] text-white shadow-lg shadow-purple-900/30 -translate-y-[2px]"
                            : isDark
                            ? "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <SubmitBtn isDark={isDark} label="Soruyu Kaydet" accent="#8B5CF6" />
              </form>
            </SBox>

            {/* Questions list */}
            <SBox isDark={isDark} accent="#8B5CF6" icon={IconListDetails} label="Soru Listesi" tag={`${questions.length} soru`}>
              {questions.length === 0 ? (
                <div className={`flex items-center justify-center py-8 rounded-xl border-2 border-dashed ${
                  isDark ? "border-white/[0.06]" : "border-zinc-200"
                }`}>
                  <p className={`text-xs font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                    Henüz soru yok
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      style={{ borderLeft: "3px solid #8B5CF6" }}
                      className={`rounded-r-xl rounded-l-sm p-4 transition-all ${
                        isDark ? "bg-white/[0.02]" : "bg-zinc-50"
                      }`}
                    >
                      <p className={`font-black text-[12px] mb-3 leading-relaxed ${isDark ? "text-white" : "text-zinc-900"}`}>
                        <span className="text-purple-500 mr-1">{i + 1}.</span>
                        {q.question_text}
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["a", "b", "c", "d"].map((opt) => {
                          const isCorrect = q.correct_answer === opt.toUpperCase();
                          return (
                            <div
                              key={opt}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold ${
                                isCorrect
                                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                  : isDark
                                  ? "bg-white/[0.04] text-zinc-500"
                                  : "bg-white text-zinc-400 border border-zinc-100"
                              }`}
                            >
                              {isCorrect
                                ? <IconCheck size={11} strokeWidth={2.5} aria-hidden="true" />
                                : <span className="w-3 text-center font-black">{opt.toUpperCase()}.</span>
                              }
                              <span className="truncate">{q[`option_${opt}`]}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex justify-end">
  <button
    type="button"
    onClick={() => deleteItem("question", q.id)}
    className="bg-red-500 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase"
  >
    Soruyu Sil
  </button>
</div>

                    </div>
                  ))}
                </div>
              )}
            </SBox>
          </div>

        </div>
      )}
    </EgitmenLayout>
  );
}