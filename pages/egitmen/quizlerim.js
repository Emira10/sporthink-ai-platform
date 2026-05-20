import { useEffect, useState } from "react";
import Link from "next/link";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import EmptyState from "../../components/egitmen/EmptyState";
import { supabase } from "../../lib/supabaseClient";
import {
  IconForms,
  IconPlus,
  IconTrash,
  IconLink,
  IconListDetails,
  IconLoader2,
  IconChevronRight,
  IconBook,
  IconHelpCircle,
  IconTargetArrow,
  IconSend,
  IconHash,
} from "@tabler/icons-react";

// ── shared primitives ──────────────────────────────────────────────
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

// ── field wrapper ──────────────────────────────────────────────────
function Field({ label, accent = "#E61A21", icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function QuizlerimPage() {
  // ── state — كودك الأصلي ──
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title:          "",
    course_id:      "",
    question_count: 10,
    passing_score:  70,
  });

  useEffect(() => { fetchData(); }, []);

  // ── fetchData — أصلي ──
  async function fetchData() {
  setLoading(true);

  const res = await fetch("/api/egitmen/list-quizzes");
  const json = await res.json();

  setLoading(false);

  if (!json.ok) {
    alert(json.message || "Quizler alınamadı!");
    return;
  }

  setQuizzes(json.quizzes || []);
  setCourses(json.courses || []);
}

  // ── handleChange — أصلي ──
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "question_count" || name === "passing_score"
        ? Number(value) : value,
    }));
  }

  // ── handleSubmit — أصلي ──
  async function handleSubmit(e) {
  e.preventDefault();

  const res = await fetch("/api/egitmen/create-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Quiz eklenemedi!");
    return;
  }

  alert("Quiz başarıyla oluşturuldu!");
  setFormData({ title: "", course_id: "", question_count: 10, passing_score: 70 });
  fetchData();
}

  // ── handleDelete — أصلي ──
  async function handleDelete(id) {
  const confirmed = window.confirm("Bu quiz ve soruları silinsin mi?");
  if (!confirmed) return;

  const res = await fetch("/api/egitmen/delete-quiz", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Quiz silinemedi!");
    return;
  }

  fetchData();
}

async function handleToggleQuizStatus(quiz) {
  const newStatus = !quiz.is_active;

  const res = await fetch("/api/egitmen/toggle-quiz-status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: quiz.id,
      is_active: newStatus,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Quiz durumu güncellenemedi!");
    return;
  }

  fetchData();
}

async function handleEditQuiz(quiz) {
  const newTitle = window.prompt("Quiz başlığı:", quiz.title);
  if (newTitle === null) return;

  const newPassing = window.prompt("Geçme notu:", quiz.passing_score);
  if (newPassing === null) return;

  const res = await fetch("/api/egitmen/update-quiz", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: quiz.id,
      title: newTitle.trim(),
      course_id: quiz.course_id,
      question_count: quiz.question_count || 0,
      passing_score: Number(newPassing),
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Quiz güncellenemedi!");
    return;
  }

  fetchData();
}

  // ── score ring color ──
  function scoreColor(score) {
    if (score >= 80) return "#22C55E";
    if (score >= 60) return "#F59E0B";
    return "#E61A21";
  }

  return (
    <EgitmenLayout
      pageTitle="Quizlerim"
      pageSubtitle="Quiz oluştur, kurslarla ilişkilendir ve yönet"
    >
      {({ isDark }) => (
        <>
          {/* ══════════════════════════════════════
              CREATE FORM
          ══════════════════════════════════════ */}
          <div
            style={{ borderTop: "3px solid #E61A21" }}
            className={`mb-8 rounded-[1.5rem] p-6 ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-[#E61A21]/10 flex items-center justify-center">
                <IconPlus size={16} strokeWidth={1.75} className="text-[#E61A21]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E61A21]">
                  Quiz Merkezi
                </p>
                <h3 className={`text-base font-black italic uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Yeni Quiz Oluştur
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <Field label="Quiz Başlığı" accent="#E61A21" icon={IconForms}>
                <input
                  type="text"
                  name="title"
                  placeholder="Örn: JavaScript Temelleri Değerlendirmesi"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={inputCls(isDark)}
                />
              </Field>

              {/* Course select */}
              <Field label="Bağlı Kurs" accent="#3B82F6" icon={IconBook}>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  required
                  className={selectCls(isDark)}
                >
                  <option value="">Kurs seç</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Question count + Passing score */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Soru Sayısı" accent="#22C55E" icon={IconHelpCircle}>
                  <div className="relative">
                    <input
                      type="number"
                      name="question_count"
                      min="1"
                      value={formData.question_count}
                      onChange={handleChange}
                      className={inputCls(isDark)}
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black pointer-events-none ${
                      isDark ? "text-zinc-600" : "text-zinc-400"
                    }`}>
                      soru
                    </span>
                  </div>
                </Field>

                <Field label="Geçme Notu" accent="#F59E0B" icon={IconTargetArrow}>
                  <div className="relative">
                    <input
                      type="number"
                      name="passing_score"
                      min="0"
                      max="100"
                      value={formData.passing_score}
                      onChange={handleChange}
                      className={inputCls(isDark)}
                    />
                    <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black pointer-events-none ${
                      isDark ? "text-zinc-600" : "text-zinc-400"
                    }`}>
                      %
                    </span>
                  </div>

                  {/* Passing score visual bar */}
                  <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                    <div
                      style={{
                        width: `${formData.passing_score}%`,
                        backgroundColor: scoreColor(formData.passing_score),
                        transition: "width 0.3s ease, background-color 0.2s",
                      }}
                      className="h-full rounded-full"
                    />
                  </div>
                </Field>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group w-full flex items-center justify-between rounded-xl bg-[#E61A21] px-6 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/30"
              >
                <div className="flex items-center gap-3">
                  <IconSend size={16} strokeWidth={2} aria-hidden="true" />
                  <span className="font-black text-[11px] uppercase tracking-widest">
                    Quiz Oluştur
                  </span>
                </div>
                <IconChevronRight
                  size={16}
                  strokeWidth={2}
                  className="opacity-60 group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>

          {/* ══════════════════════════════════════
              QUIZ LIST
          ══════════════════════════════════════ */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2 size={22} strokeWidth={1.75} className="animate-spin text-[#E61A21]" aria-hidden="true" />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Yükleniyor...
              </span>
            </div>
          ) : quizzes.length === 0 ? (
            <EmptyState message="Henüz quiz oluşturulmadı" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {quizzes.map((quiz) => {
                const color = scoreColor(quiz.passing_score);
                return (
                  <div
                    key={quiz.id}
                    style={{ borderTop: `3px solid ${color}` }}
                    className={`group rounded-[1.5rem] p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 ${
                      isDark
                        ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                        : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                    }`}
                  >
                    {/* Header */}
                    <div>
                      <h3 className={`text-base font-black italic uppercase leading-tight mb-1 ${
                        isDark ? "text-white" : "text-zinc-900"
                      }`}>
                        {quiz.title}
                      </h3>
                      <p className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      }`}>
                        <IconBook size={11} strokeWidth={2} aria-hidden="true" />
                        {quiz.courses_data?.title || "—"}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className={`grid grid-cols-2 gap-3 py-4 border-y ${
                      isDark ? "border-white/[0.06]" : "border-zinc-100"
                    }`}>
                      {/* Question count */}
                      <div className={`rounded-xl px-3 py-2.5 ${isDark ? "bg-white/[0.04]" : "bg-zinc-50"}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconHelpCircle size={11} strokeWidth={2} className="text-green-500" aria-hidden="true" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Soru</p>
                        </div>
                        <p className={`text-xl font-black tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                          {quiz.real_question_count ?? quiz.question_count}
                        </p>
                      </div>

                      {/* Passing score */}
                      <div className={`rounded-xl px-3 py-2.5 ${isDark ? "bg-white/[0.04]" : "bg-zinc-50"}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconTargetArrow size={11} strokeWidth={2} style={{ color }} aria-hidden="true" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Geçme</p>
                        </div>
                        <p style={{ color }} className="text-xl font-black tabular-nums">
                          %{quiz.passing_score}
                        </p>
                      </div>
                    </div>

                    {/* Passing score bar */}
                    <div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                        <div
                          style={{ width: `${quiz.passing_score}%`, backgroundColor: color }}
                          className="h-full rounded-full transition-all duration-500"
                        />
                      </div>
                      <p className={`mt-1 text-[10px] font-bold text-right ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                        Başarı eşiği
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <Link
                        href={`/egitmen/quiz-sorulari?quizId=${quiz.id}`}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                      >
                        <IconListDetails size={13} strokeWidth={2} aria-hidden="true" />
                        Sorular
                      </Link>

                      <Link
                        href={`/quiz/${quiz.id}`}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E61A21]/10 text-[#E61A21] font-black text-[10px] uppercase tracking-widest hover:bg-[#E61A21]/20 transition-all"
                      >
                        <IconLink size={13} strokeWidth={2} aria-hidden="true" />
                        Quiz Link
                      </Link>

                      <button
  onClick={() => handleEditQuiz(quiz)}
  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500/10 text-violet-500 font-black text-[10px] uppercase tracking-widest hover:bg-violet-500/20 transition-all"
>
  Düzenle
</button>

                      <button
  onClick={() => handleToggleQuizStatus(quiz)}
  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
    quiz.is_active
      ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
  }`}
>
  {quiz.is_active ? "Taslağa Al" : "Yayınla"}
</button>

                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
                      >
                        <IconTrash size={13} strokeWidth={2} aria-hidden="true" />
                        Sil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </EgitmenLayout>
  );
}