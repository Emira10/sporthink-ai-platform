import { useState, useEffect } from "react";
import KullaniciLayout from "../../components/KullaniciLayout";
import { supabase } from "../../lib/supabaseClient";
import {
  MessageSquare, Star, Send, AlertCircle, Lightbulb,
  BookOpen, User, CheckCircle2, Clock, ChevronRight,
  Smile, Meh, Frown, SmilePlus, Angry, History
} from "lucide-react";

export default function GeriBildirimPage() {
  /* ── original state ── */
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading,    setLoading]    = useState(false);

  /* ── new state ── */
  const [activeTab,      setActiveTab]      = useState("genel");
  const [courseRating,   setCourseRating]   = useState(0);
  const [courseHover,    setCourseHover]    = useState(0);
  const [trainerRating,  setTrainerRating]  = useState(0);
  const [trainerHover,   setTrainerHover]   = useState(0);
  const [courseComment,  setCourseComment]  = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [trainerComment, setTrainerComment] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [reportText,     setReportText]     = useState("");
  const [reportType,     setReportType]     = useState("teknik");
  const [dailyMood,      setDailyMood]      = useState(null);
  const [myFeedbacks,    setMyFeedbacks]    = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitLoading,  setSubmitLoading]  = useState(false);
  const [toast,          setToast]          = useState(null);

  useEffect(() => { fetchMyFeedbacks(); }, []);

  /* ── helpers ── */
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function getUserEmail() {
    const { data: authData } = await supabase.auth.getUser();
    return (
      authData?.user?.email ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("userName") ||
      "anon"
    );
  }

  async function createFeedback(payload) {
  const res = await fetch("/api/kullanici/feedback-create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Geri bildirim gönderilemedi.");
  }

  return result;
}

  async function fetchMyFeedbacks() {
  setHistoryLoading(true);

  try {
    const email = await getUserEmail();

    const res = await fetch(
      `/api/kullanici/feedback-my?user_email=${encodeURIComponent(email)}`
    );

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Geçmiş getirilemedi.");
    }

    setMyFeedbacks(result.feedbacks || []);
  } catch (err) {
    console.error("Feedback geçmiş hatası:", err);
    setMyFeedbacks([]);
  } finally {
    setHistoryLoading(false);
  }
}

function startReplyToFeedback(feedback) {
  setReplyingTo(feedback);
  setActiveTab("genel");

  setInputValue(
    `Yanıtlanan mesaj: "${feedback.message}"\n\nEğitmen yanıtı: "${feedback.trainer_reply}"\n\nCevabım: `
  );

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
}

async function deleteFeedback(feedbackId) {
  const ok = confirm("Bu geri bildirimi silmek istiyor musun?");

  if (!ok) return;

  try {
    const res = await fetch("/api/kullanici/delete-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feedback_id: feedbackId,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error);
    }

    setMyFeedbacks((prev) =>
      prev.filter((item) => item.id !== feedbackId)
    );

  } catch (err) {
    alert("Silinemedi");
  }
}

  function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  }

  /* ── original submitFeedback (unchanged) ── */
  async function submitFeedback() {
  if (!inputValue.trim()) {
    alert("Lütfen bir mesaj yaz.");
    return;
  }

  setLoading(true);

  try {
    const userEmail = await getUserEmail();

    await createFeedback({
      user_email: userEmail,
      message: replyingTo
  ? `[YANIT / TAKİP] Önceki mesaj: ${replyingTo.message} — Cevap: ${inputValue}`
  : inputValue,
feedback_type: replyingTo ? "reply_followup" : "general",
    });

    alert("Geri bildirimin gönderildi.");
    setInputValue("");
    setReplyingTo(null);
    fetchMyFeedbacks();
  } catch (err) {
    alert("Mesaj gönderilemedi: " + err.message);
  } finally {
    setLoading(false);
  }
}

  /* ── new submit functions ── */
  async function submitCourseRating() {
  if (!selectedCourse || !courseRating) {
    showToast("Lütfen kurs seç ve puan ver.", "error");
    return;
  }

  setSubmitLoading(true);

  try {
    const userEmail = await getUserEmail();

    await createFeedback({
      user_email: userEmail,
      message: `[KURS DEĞERLENDİRMESİ] Kurs: ${selectedCourse} — Puan: ${courseRating}/5 — ${courseComment || "Yorum yok"}`,
      feedback_type: "course_rating",
      rating: courseRating,
    });

    showToast("Kurs değerlendirmeni aldık, teşekkürler!");
    setCourseRating(0);
    setCourseComment("");
    setSelectedCourse("");
    fetchMyFeedbacks();
  } catch (err) {
    showToast("Gönderilemedi: " + err.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

  async function submitTrainerRating() {
  if (!selectedTrainer || !trainerRating) {
  showToast("Lütfen eğitmen seç ve puan ver.", "error");
  return;
}

  setSubmitLoading(true);

  try {
    const userEmail = await getUserEmail();

    await createFeedback({
      user_email: userEmail,
      message: `[EĞİTMEN DEĞERLENDİRMESİ] Eğitmen: ${selectedTrainer} — Puan: ${trainerRating}/5 — ${trainerComment || "Yorum yok"}`,
      feedback_type: "trainer_rating",
      rating: trainerRating,
    });

    showToast("Eğitmen değerlendirmeni aldık, teşekkürler!");
    setTrainerRating(0);
    setTrainerComment("");
    setSelectedTrainer("");
    fetchMyFeedbacks();
  } catch (err) {
    showToast("Gönderilemedi: " + err.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

  async function submitSuggestion() {
  if (!suggestionText.trim()) {
    showToast("Lütfen bir öneri yaz.", "error");
    return;
  }

  setSubmitLoading(true);

  try {
    const userEmail = await getUserEmail();

    await createFeedback({
      user_email: userEmail,
      message: `[ÖNERİ] ${suggestionText}`,
      feedback_type: "suggestion",
    });

    showToast("Önerin iletildi, teşekkürler!");
    setSuggestionText("");
    fetchMyFeedbacks();
  } catch (err) {
    showToast("Gönderilemedi: " + err.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

  async function submitReport() {
  if (!reportText.trim()) {
    showToast("Lütfen problemi açıkla.", "error");
    return;
  }

  setSubmitLoading(true);

  try {
    const userEmail = await getUserEmail();

    await createFeedback({
      user_email: userEmail,
      message: `[BİLDİRİM - ${reportType.toUpperCase()}] ${reportText}`,
      feedback_type: "report",
    });

    showToast("Bildirim alındı, en kısa sürede inceliyoruz!");
    setReportText("");
    setReportType("teknik");
    fetchMyFeedbacks();
  } catch (err) {
    showToast("Gönderilemedi: " + err.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

  async function submitMood() {
  if (!dailyMood) {
    showToast("Ruh halini seç.", "error");
    return;
  }

  setSubmitLoading(true);

  try {
    const userEmail = await getUserEmail();

    await createFeedback({
      user_email: userEmail,
      message: `[GÜNLÜK DEĞERLENDİRME] ${dailyMood}`,
      feedback_type: "daily_mood",
    });

    showToast("Teşekkürler! Bugünkü değerlendirmen kaydedildi.");
    setDailyMood(null);
    fetchMyFeedbacks();
  } catch (err) {
    showToast("Gönderilemedi: " + err.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

  /* ── tabs config ── */
  const TABS = [
    { id: "genel",    label: "Genel Mesaj",   Icon: MessageSquare },
    { id: "kurs",     label: "Kurs Puanı",    Icon: Star          },
    { id: "egitmen",  label: "Eğitmen",        Icon: User          },
    { id: "oneri",    label: "Öneri",          Icon: Lightbulb     },
    { id: "bildirim", label: "Bildirim",       Icon: AlertCircle   },
    { id: "gunluk",   label: "Bugün Nasıl?",  Icon: Smile         },
    { id: "gecmis",   label: "Geçmişim",       Icon: History       },
  ];

  const MOODS = [
    { key: "Harika",     Icon: SmilePlus, color: "text-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", border: "border-emerald-500/30" },
    { key: "İyi",        Icon: Smile,     color: "text-blue-500",    bg: "bg-blue-500/10 dark:bg-blue-500/20",    border: "border-blue-500/30"    },
    { key: "Fena Değil", Icon: Meh,       color: "text-amber-500",   bg: "bg-amber-500/10 dark:bg-amber-500/20",   border: "border-amber-500/30"   },
    { key: "Kötü",       Icon: Frown,     color: "text-orange-500",  bg: "bg-orange-500/10 dark:bg-orange-500/20", border: "border-orange-500/30"  },
    { key: "Çok Kötü",   Icon: Angry,     color: "text-rose-500",    bg: "bg-rose-500/10 dark:bg-rose-500/20",    border: "border-rose-500/30"    },
  ];

  const REPORT_TYPES = [
    { key: "teknik",   label: "Teknik Sorun"    },
    { key: "icerik",   label: "İçerik Hatası"   },
    { key: "uygunsuz", label: "Uygunsuz İçerik" },
    { key: "diger",    label: "Diğer"           },
  ];

  /* ── star component ── */
  function Stars({ value, hover, onHover, onLeave, onClick, size = "w-7 h-7" }) {
    return (
      <div className="flex gap-1" onMouseLeave={onLeave}>
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            onMouseEnter={() => onHover(i)}
            onClick={() => onClick(i)}
            className={`${size} transition-transform duration-150 hover:scale-110`}
          >
            <Star className={`w-full h-full transition-colors ${
              i <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300 dark:text-slate-600"
            }`} />
          </button>
        ))}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <KullaniciLayout pageTitle="Geri Bildirim">
      <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm shadow-2xl text-white ${
            toast.type === "error" ? "bg-rose-500 shadow-rose-500/30" : "bg-emerald-500 shadow-emerald-500/30"
          }`}>
            {toast.type === "error"
              ? <AlertCircle className="w-5 h-5" />
              : <CheckCircle2 className="w-5 h-5" />}
            {toast.msg}
          </div>
        )}

        {/* ── Header ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent blur-3xl rounded-full" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">SporthINK</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Geri Bildirim Merkezi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sorularını, önerilerini ve değerlendirmelerini bizimle paylaş</p>
          </div>
        </section>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white border-transparent shadow-lg shadow-rose-500/25"
                  : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/50"
              }`}
            >
              <t.Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: Genel Mesaj (original) ── */}
        {activeTab === "genel" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Eğitmene Mesaj Gönder</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Genel Geri Bildirim</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              Sorularını, önerilerini veya yaşadığın problemi eğitmene iletebilirsin. Gönderilen mesajlar eğitmen panelindeki Geri Bildirimler bölümüne düşer.
            </p>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Mesajını yaz..."
              className="w-full min-h-[160px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none outline-none focus:border-rose-300 dark:focus:border-rose-500/50 transition-colors mb-4 font-[inherit] placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={submitFeedback}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gönderiliyor...</> : <><Send className="w-4 h-4" />Gönder</>}
            </button>
          </div>
        )}

        {/* ── TAB: Kurs Puanı ── */}
        {activeTab === "kurs" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Değerlendirme</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Kursu Değerlendir</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tamamladığın kurs hakkında ne düşünüyorsun?</p>

            <select
  value={selectedTrainer}
  onChange={(e) => setSelectedTrainer(e.target.value)}
  className="w-full mb-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-300 dark:focus:border-blue-500/50"
>
  <option value="">Değerlendirilecek eğitmeni seç</option>
  <option value="Ahmet Yılmaz">Ahmet Yılmaz</option>
  <option value="Elif Demir">Elif Demir</option>
  <option value="Mehmet Kaya">Mehmet Kaya</option>
</select>

            <select
  value={selectedCourse}
  onChange={(e) => setSelectedCourse(e.target.value)}
  className="w-full mb-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-none focus:border-amber-300 dark:focus:border-amber-500/50"
>
  <option value="">Değerlendirilecek kursu seç</option>
  <option value="Power BI Dashboard Eğitimi">Power BI Dashboard Eğitimi</option>
  <option value="SQL İleri Seviye">SQL İleri Seviye</option>
  <option value="Python ile Veri Analizi">Python ile Veri Analizi</option>
</select>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">Genel Puan</p>
              <Stars
                value={courseRating} hover={courseHover}
                onHover={setCourseHover} onLeave={() => setCourseHover(0)}
                onClick={setCourseRating}
              />
              {courseRating > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {["","Çok kötü","Kötü","Orta","İyi","Harika!"][courseRating]}
                </p>
              )}
            </div>

            <textarea
              value={courseComment}
              onChange={e => setCourseComment(e.target.value)}
              placeholder="Kursh hakkında ne düşünüyorsun? (isteğe bağlı)"
              className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none outline-none focus:border-amber-300 dark:focus:border-amber-500/50 transition-colors mb-4 font-[inherit] placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={submitCourseRating}
              disabled={submitLoading || !courseRating || !selectedCourse}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Star className="w-4 h-4" />
              {submitLoading ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
            </button>
          </div>
        )}

        {/* ── TAB: Eğitmen ── */}
        {activeTab === "egitmen" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Değerlendirme</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Eğitmeni Değerlendir</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Eğitmenin anlatım tarzı, içerik kalitesi ve destek konusundaki değerlendirmeni paylaş.</p>

             <select
  value={selectedTrainer}
  onChange={(e) => setSelectedTrainer(e.target.value)}
  className="w-full mb-5 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-300 dark:focus:border-blue-500/50"
>
  <option value="">Değerlendirilecek eğitmeni seç</option>
  <option value="Ahmet Yılmaz">Ahmet Yılmaz</option>
  <option value="Elif Demir">Elif Demir</option>
  <option value="Mehmet Kaya">Mehmet Kaya</option>
</select>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { label: "Anlatım Netliği" },
                { label: "İçerik Kalitesi" },
                { label: "Destek & İletişim" },
              ].map((cat, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">{cat.label}</p>
                  <Stars
                    value={i === 0 ? trainerRating : 0}
                    hover={i === 0 ? trainerHover : 0}
                    onHover={i === 0 ? setTrainerHover : () => {}}
                    onLeave={() => setTrainerHover(0)}
                    onClick={i === 0 ? setTrainerRating : () => {}}
                    size="w-6 h-6"
                  />
                </div>
              ))}
            </div>

            <textarea
              value={trainerComment}
              onChange={e => setTrainerComment(e.target.value)}
              placeholder="Eğitmen hakkında yorumun... (isteğe bağlı)"
              className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none outline-none focus:border-blue-300 dark:focus:border-blue-500/50 transition-colors mb-4 font-[inherit] placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={submitTrainerRating}
              disabled={submitLoading || !trainerRating || !selectedTrainer}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <User className="w-4 h-4" />
              {submitLoading ? "Gönderiliyor..." : "Değerlendirmeyi Gönder"}
            </button>
          </div>
        )}

        {/* ── TAB: Öneri ── */}
        {activeTab === "oneri" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Fikir</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Kurs Önerisi</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Görmek istediğin konu veya kurs var mı? Eğitmenine ilet!</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
              {["SQL İleri Seviye","Python","Excel","Power BI","Liderlik","İletişim"].map(s => (
                <button
                  key={s}
                  onClick={() => setSuggestionText(s + " hakkında yeni bir kurs eklenebilir.")}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 text-left flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                  {s}
                </button>
              ))}
            </div>

            <textarea
              value={suggestionText}
              onChange={e => setSuggestionText(e.target.value)}
              placeholder="Önerin nedir? Hangi konuda eğitim görmek istersin?"
              className="w-full min-h-[140px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none outline-none focus:border-violet-300 dark:focus:border-violet-500/50 transition-colors mb-4 font-[inherit] placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={submitSuggestion}
              disabled={submitLoading || !suggestionText.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Lightbulb className="w-4 h-4" />
              {submitLoading ? "Gönderiliyor..." : "Öneriyi İlet"}
            </button>
          </div>
        )}

        {/* ── TAB: Bildirim ── */}
        {activeTab === "bildirim" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Sorun</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Sorun Bildir</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Teknik sorun, içerik hatası veya uygunsuz içerik bildir.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {REPORT_TYPES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setReportType(r.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                    reportType === r.key
                      ? "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-rose-300 dark:hover:border-rose-500/50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <textarea
              value={reportText}
              onChange={e => setReportText(e.target.value)}
              placeholder="Problemi detaylı açıkla..."
              className="w-full min-h-[140px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm resize-none outline-none focus:border-rose-300 dark:focus:border-rose-500/50 transition-colors mb-4 font-[inherit] placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <button
              onClick={submitReport}
              disabled={submitLoading || !reportText.trim()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <AlertCircle className="w-4 h-4" />
              {submitLoading ? "Gönderiliyor..." : "Bildirimi Gönder"}
            </button>
          </div>
        )}

        {/* ── TAB: Günlük Değerlendirme ── */}
        {activeTab === "gunluk" && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                <Smile className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Bugün</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Bugün Nasıldı?</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Bugünkü öğrenme deneyimini tek tıkla değerlendir.</p>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {MOODS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setDailyMood(m.key)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                    dailyMood === m.key
                      ? `${m.bg} ${m.border} border scale-105 shadow-lg`
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <m.Icon className={`w-8 h-8 ${m.color}`} />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{m.key}</span>
                </button>
              ))}
            </div>

            <button
              onClick={submitMood}
              disabled={submitLoading || !dailyMood}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              <Smile className="w-4 h-4" />
              {submitLoading ? "Kaydediliyor..." : "Değerlendirmeyi Kaydet"}
            </button>
          </div>
        )}

        {/* ── TAB: Geçmişim ── */}
        {activeTab === "gecmis" && (
          <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <History className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1">
  <p className="text-sm font-bold text-slate-900 dark:text-white">
    Gönderdiğim Geri Bildirimler
  </p>
  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
    Eğitmen yanıtlarını ve önceki mesajlarını buradan takip edebilirsin.
  </p>
</div>

<button
  onClick={() => setActiveTab("genel")}
  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-black shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 transition-all"
>
  Yeni mesaj gönder
</button>
            </div>

            {historyLoading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 w-3/4 mb-2" />
                      <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-700 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : myFeedbacks.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {myFeedbacks.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4 text-rose-500" />
                    </div>

                    <div className="flex items-start justify-between gap-3">
  <div className="flex-1 min-w-0">
    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
      {f.message}
    </p>

    {f.trainer_reply && (
      <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-black mb-1">
          Eğitmen Yanıtı
        </p>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {f.trainer_reply}
        </p>

        <button
          onClick={() => startReplyToFeedback(f)}
          className="mt-3 px-3 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-black hover:bg-emerald-600 transition-all"
        >
          Yanıtla
        </button>
      </div>
    )}
  </div>

  {!f.trainer_reply && (
    <button
      onClick={() => deleteFeedback(f.id)}
      className="w-9 h-9 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 hover:scale-105 transition-all"
    >
      🗑️
    </button>
  )}
</div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(f.created_at)}</p>
                        {f.feedback_type && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {f.feedback_type}
                          </span>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white mb-1">Henüz geri bildirim yok</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Gönderdiğin mesajlar burada görünecek.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </KullaniciLayout>
  );
}