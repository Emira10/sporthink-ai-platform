import { useState } from "react";
import { useRouter } from "next/router";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";
import {
  IconPencil,
  IconUpload,
  IconTag,
  IconLink,
  IconVideo,
  IconShieldCheck,
  IconLoader2,
  IconRocket,
  IconChevronRight,
  IconChevronLeft,
  IconAlignLeft,
  IconClock,
  IconChartBar,
  IconCheck,
  IconBook,
  IconUser,
  IconStar,
} from "@tabler/icons-react";

const STEPS = [
  { id: 1, label: "Temel Bilgi",    desc: "Başlık, kategori ve açıklama" },
  { id: 2, label: "İçerik",         desc: "Tür, URL ve süre" },
  { id: 3, label: "Ayarlar",        desc: "Zorluk ve zorunluluk" },
];

const CONTENT_TYPES  = ["Video", "PDF", "SCORM"];
const DIFFICULTY_LEVELS = [
  { value: "Başlangıç", color: "#22C55E" },
  { value: "Orta",      color: "#F59E0B" },
  { value: "İleri",     color: "#E61A21" },
];

const MAX_DESC = 300;

export default function YeniEgitimPage() {
  const router = useRouter();

  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [contentFile, setContentFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [lessons, setLessons] = useState([
  {
    title: "",
    content_type: "video",
    content_url: "",
    duration: "",
  },
]);

  const [formData, setFormData] = useState({
    title:        "",
    category:     "",
    description:  "",
    video_url:    "",
    type:         "Video",
    difficulty:   "Başlangıç",
    duration:     "",
    is_mandatory: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function setPill(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    if (step === 1) return formData.title.trim() && formData.category.trim();
    if (step === 2) return true;
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (step !== 3) return;
    setLoading(true);

    let uploadedContentUrl = formData.video_url;
let uploadedCoverUrl = "";

if (contentFile) {
  const fd = new FormData();
  fd.append("file", contentFile);

  const uploadRes = await fetch("/api/organizasyon/upload-training-file", {
    method: "POST",
    body: fd,
  });

  const uploadJson = await uploadRes.json();

  if (!uploadJson.ok) {
    setLoading(false);
    alert(uploadJson.message || "İçerik dosyası yüklenemedi.");
    return;
  }

  uploadedContentUrl = uploadJson.url;
}

if (coverFile) {
  const fd = new FormData();
  fd.append("file", coverFile);

  const uploadRes = await fetch("/api/organizasyon/upload-training-file", {
    method: "POST",
    body: fd,
  });

  const uploadJson = await uploadRes.json();

  if (!uploadJson.ok) {
    setLoading(false);
    alert(uploadJson.message || "Kapak görseli yüklenemedi.");
    return;
  }

  uploadedCoverUrl = uploadJson.url;
}

    const res = await fetch("/api/egitmen/create-course", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: formData.title,
    category: formData.category,
    description: formData.description,
    video_url: uploadedContentUrl,
    cover_url: uploadedCoverUrl,
    type: formData.type,
    content_type: formData.type.toLowerCase(),
    difficulty: formData.difficulty,
    duration: formData.duration,
    is_mandatory: formData.is_mandatory,
    is_active: true,
    lessons,
  }),
});

const json = await res.json();

setLoading(false);

if (!json.ok) {
  alert("Kurs eklenirken hata oluştu: " + json.message);
  return;
}

alert("Kurs başarıyla eklendi!");
router.push("/egitmen/egitimlerim");

}

  /* ── shared styles ── */
  const fieldBox = (isDark, focused) => `
    rounded-[1.25rem] p-5 transition-all duration-200
    ${isDark
      ? "bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"}
    ${focused
      ? isDark
        ? "bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
        : "shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
      : ""}
  `;

  const inputBase = (isDark) => `
    w-full bg-transparent outline-none text-[15px] font-semibold transition-all
    ${isDark ? "text-white placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}
  `;

  const fieldLabel = (accent, icon, label, isDark) => {
    const Icon = icon;
    return (
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} strokeWidth={2} style={{ color: accent }} aria-hidden="true" className="shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
          {label}
        </span>
      </div>
    );
  };

  const pillBtn = (active, color, label, onClick, isDark) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      style={active ? { backgroundColor: color, boxShadow: `0 8px 24px ${color}40` } : {}}
      className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
        active
          ? "text-white -translate-y-[2px]"
          : isDark
          ? "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
      }`}
    >
      {label}
    </button>
  );

  return (
    <EgitmenLayout
      pageTitle="Yeni Eğitim"
      pageSubtitle="Yeni bir kurs oluştur ve sisteme ekle"
    >
      {({ isDark }) => (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

          {/* ══════════════════════════════════════
              LEFT — Form
          ══════════════════════════════════════ */}
          <div className="xl:col-span-2">

            {/* ── Step indicator ── */}
            <div className="flex items-center gap-0 mb-8">
              {STEPS.map((s, i) => {
                const done    = step > s.id;
                const current = step === s.id;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    {/* Dot + label */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        style={done || current ? { backgroundColor: "#E61A21", boxShadow: current ? "0 0 0 4px rgba(230,26,33,0.15)" : "none" } : {}}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                          done || current
                            ? "text-white"
                            : isDark
                            ? "bg-white/[0.06] text-zinc-500 border border-white/10"
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {done ? (
                          <IconCheck size={14} strokeWidth={2.5} aria-hidden="true" />
                        ) : (
                          s.id
                        )}
                      </div>
                      <div className="text-center hidden md:block">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${current ? "text-[#E61A21]" : isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                          {s.label}
                        </p>
                        <p className={`text-[9px] font-medium ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                          {s.desc}
                        </p>
                      </div>
                    </div>

                    {/* Connector */}
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-[2px] mx-3 mb-6 rounded-full transition-all duration-300 ${
                        step > s.id ? "bg-[#E61A21]" : isDark ? "bg-white/[0.06]" : "bg-zinc-200"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={(e) => e.preventDefault()}>

              {/* ══ STEP 1 — Temel Bilgi ══ */}
              {step === 1 && (
                <div className="space-y-5">

                  {/* Title */}
                  <div
                    style={{ borderLeft: `3px solid ${activeField === "title" ? "#E61A21" : "transparent"}`, transition: "border-color 0.2s" }}
                    className={fieldBox(isDark, activeField === "title")}
                  >
                    {fieldLabel("#E61A21", IconPencil, "Eğitim Başlığı", isDark)}
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onFocus={() => setActiveField("title")}
                      onBlur={() => setActiveField(null)}
                      required
                      placeholder="Örn: SQL Temelleri — Sıfırdan İleri Seviye"
                      className={inputBase(isDark)}
                    />
                    <p className="mt-2 text-[11px] font-medium text-zinc-500">
                      Net ve çekici bir başlık — öğrenci ilk bunu görür
                    </p>
                  </div>

                  {/* Category */}
                  <div
                    style={{ borderLeft: `3px solid ${activeField === "category" ? "#3B82F6" : "transparent"}`, transition: "border-color 0.2s" }}
                    className={fieldBox(isDark, activeField === "category")}
                  >
                    {fieldLabel("#3B82F6", IconTag, "Kategori", isDark)}
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onFocus={() => setActiveField("category")}
                      onBlur={() => setActiveField(null)}
                      required
                      placeholder="Örn: Database, Frontend, Pazarlama"
                      className={inputBase(isDark)}
                    />
                    <p className="mt-2 text-[11px] font-medium text-zinc-500">
                      Konuya göre gruplandır — filtrelemede kullanılır
                    </p>
                  </div>

                  {/* Description */}
                  <div
                    style={{ borderLeft: `3px solid ${activeField === "description" ? "#22C55E" : "transparent"}`, transition: "border-color 0.2s" }}
                    className={fieldBox(isDark, activeField === "description")}
                  >
                    {fieldLabel("#22C55E", IconAlignLeft, "Açıklama", isDark)}
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onFocus={() => setActiveField("description")}
                      onBlur={() => setActiveField(null)}
                      maxLength={MAX_DESC}
                      rows={4}
                      placeholder="Bu eğitim ne öğretir? Kimler için? Ne zaman tamamlanır?..."
                      className={`${inputBase(isDark)} resize-none leading-relaxed`}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] font-medium text-zinc-500">
                        Öğrencinin kursu seçmesine yardımcı olur
                      </p>
                      <span className={`text-[11px] font-black tabular-nums ${
                        formData.description.length >= MAX_DESC
                          ? "text-[#E61A21]"
                          : "text-zinc-500"
                      }`}>
                        {formData.description.length}/{MAX_DESC}
                      </span>
                    </div>
                    {/* Character progress bar */}
                    <div className={`mt-2 h-[2px] rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                      <div
                        style={{
                          width: `${(formData.description.length / MAX_DESC) * 100}%`,
                          backgroundColor: formData.description.length >= MAX_DESC ? "#E61A21" : "#22C55E",
                          transition: "width 0.15s, background-color 0.2s",
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ══ STEP 2 — İçerik ══ */}
              {step === 2 && (
                <div className="space-y-5">

                  {/* Content type */}
                  <div className={fieldBox(isDark, false)}>
                    {fieldLabel("#F59E0B", IconVideo, "İçerik Türü", isDark)}
                    <div className="flex gap-3 flex-wrap mt-1">
                      {CONTENT_TYPES.map((t) =>
                        pillBtn(formData.type === t, "#E61A21", t, () => setPill("type", t), isDark)
                      )}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div
                    style={{ borderLeft: `3px solid ${activeField === "video_url" ? "#8B5CF6" : "transparent"}`, transition: "border-color 0.2s" }}
                    className={fieldBox(isDark, activeField === "video_url")}
                  >
                    {fieldLabel("#8B5CF6", IconLink, "Video URL", isDark)}
                    <input
                      type="text"
                      name="video_url"
                      value={formData.video_url}
                      onChange={handleChange}
                      onFocus={() => setActiveField("video_url")}
                      onBlur={() => setActiveField(null)}
                      placeholder="YouTube linki veya harici video bağlantısı"
                      className={inputBase(isDark)}
                    />
                    <p className="mt-2 text-[11px] font-medium text-zinc-500">
                      Direkt URL — YouTube, Vimeo veya özel hosting
                    </p>
                  </div>

                  <div className={fieldBox(isDark, false)}>
  {fieldLabel("#E61A21", IconUpload, "Dosya Yükle", isDark)}
  <input
    type="file"
    accept="video/*,application/pdf"
    onChange={(e) => setContentFile(e.target.files?.[0] || null)}
    className={inputBase(isDark)}
  />
  <p className="mt-2 text-[11px] font-medium text-zinc-500">
    Video veya PDF dosyası yükleyebilirsin. Link girildiyse link kullanılır.
  </p>
</div>

<div className={fieldBox(isDark, false)}>
  {fieldLabel("#3B82F6", IconBook, "Kapak Görseli", isDark)}
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
    className={inputBase(isDark)}
  />
  <p className="mt-2 text-[11px] font-medium text-zinc-500">
    Kurs kartında görünecek kapak görseli.
  </p>
</div>

<div className={fieldBox(isDark, false)}>
  {fieldLabel("#22C55E", IconBook, "Dersler", isDark)}

  <div className="space-y-4">
    {lessons.map((lesson, index) => (
      <div
        key={index}
        className={`rounded-2xl p-4 border ${
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-zinc-200 bg-zinc-50"
        }`}
      >
        <input
          type="text"
          placeholder={`Ders ${index + 1} Başlığı`}
          value={lesson.title}
          onChange={(e) => {
            const updated = [...lessons];
            updated[index].title = e.target.value;
            setLessons(updated);
          }}
          className={`${inputBase(isDark)} mb-3`}
        />

        <select
          value={lesson.content_type}
          onChange={(e) => {
            const updated = [...lessons];
            updated[index].content_type = e.target.value;
            setLessons(updated);
          }}
          className={`${inputBase(isDark)} mb-3`}
        >
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
        </select>

        <input
          type="text"
          placeholder="İçerik URL"
          value={lesson.content_url}
          onChange={(e) => {
            const updated = [...lessons];
            updated[index].content_url = e.target.value;
            setLessons(updated);
          }}
          className={`${inputBase(isDark)} mb-3`}
        />

        <input
          type="number"
          placeholder="Süre (dakika)"
          value={lesson.duration}
          onChange={(e) => {
            const updated = [...lessons];
            updated[index].duration = e.target.value;
            setLessons(updated);
          }}
          className={inputBase(isDark)}
        />
      </div>
    ))}

    <button
      type="button"
      onClick={() =>
        setLessons([
          ...lessons,
          {
            title: "",
            content_type: "video",
            content_url: "",
            duration: "",
          },
        ])
      }
      className="w-full rounded-2xl bg-[#E61A21] text-white py-3 text-sm font-black uppercase tracking-widest"
    >
      Yeni Ders Ekle
    </button>
  </div>
</div>

                  {/* Duration */}
                  <div
                    style={{ borderLeft: `3px solid ${activeField === "duration" ? "#22C55E" : "transparent"}`, transition: "border-color 0.2s" }}
                    className={fieldBox(isDark, activeField === "duration")}
                  >
                    {fieldLabel("#22C55E", IconClock, "Tahmini Süre (dakika)", isDark)}
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        onFocus={() => setActiveField("duration")}
                        onBlur={() => setActiveField(null)}
                        min={1}
                        placeholder="Örn: 45"
                        className={`${inputBase(isDark)} w-32`}
                      />
                      <span className="text-[11px] font-bold text-zinc-500">dakika</span>
                      {formData.duration && (
                        <span className={`text-[11px] font-black ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                          ≈ {Math.floor(parseInt(formData.duration || 0) / 60)}sa {parseInt(formData.duration || 0) % 60}dk
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-zinc-500">
                      Öğrenci planlama yapabilmesi için süreyi gir
                    </p>
                  </div>
                </div>
              )}

              {/* ══ STEP 3 — Ayarlar ══ */}
              {step === 3 && (
                <div className="space-y-5">

                  {/* Difficulty */}
                  <div className={fieldBox(isDark, false)}>
                    {fieldLabel("#E61A21", IconChartBar, "Zorluk Seviyesi", isDark)}
                    <div className="flex gap-3 flex-wrap mt-1">
                      {DIFFICULTY_LEVELS.map(({ value, color }) =>
                        pillBtn(formData.difficulty === value, color, value, () => setPill("difficulty", value), isDark)
                      )}
                    </div>
                    <p className="mt-3 text-[11px] font-medium text-zinc-500">
                      Öğrencinin kendine uygun kurs seçmesini sağlar
                    </p>
                  </div>

                  {/* Mandatory toggle */}
                  <div className={fieldBox(isDark, false)}>
                    <label htmlFor="is_mandatory" className="flex items-center gap-4 cursor-pointer">
                      {/* Toggle track */}
                      <div className="relative shrink-0">
                        <input
                          id="is_mandatory"
                          type="checkbox"
                          name="is_mandatory"
                          checked={formData.is_mandatory}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${
                          formData.is_mandatory ? "bg-[#E61A21]" : isDark ? "bg-white/10" : "bg-zinc-200"
                        }`} />
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                          formData.is_mandatory ? "left-6" : "left-1"
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <IconShieldCheck
                            size={15}
                            strokeWidth={2}
                            style={{ color: formData.is_mandatory ? "#E61A21" : undefined }}
                            className={formData.is_mandatory ? "" : "text-zinc-500"}
                            aria-hidden="true"
                          />
                          <span className={`text-sm font-black uppercase tracking-wide ${isDark ? "text-white" : "text-zinc-900"}`}>
                            Zorunlu Eğitim
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                          Aktif edilirse tüm öğrenciler bu eğitimi tamamlamak zorunda kalır
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Summary before submit */}
                  <div
                    style={{ borderTop: "3px solid #E61A21" }}
                    className={`rounded-[1.25rem] p-5 ${
                      isDark
                        ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                        : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E61A21] mb-4">
                      Özet — Kaydetmeden önce kontrol et
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Başlık",    value: formData.title      || "—" },
                        { label: "Kategori",  value: formData.category   || "—" },
                        { label: "Tür",       value: formData.type },
                        { label: "Zorluk",    value: formData.difficulty },
                        { label: "Süre",      value: formData.duration ? `${formData.duration} dk` : "—" },
                        { label: "Zorunlu",   value: formData.is_mandatory ? "Evet" : "Hayır" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
                          <p className={`mt-0.5 text-[13px] font-bold truncate ${isDark ? "text-white" : "text-zinc-900"}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons ── */}
              <div className="flex items-center gap-4 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className={`flex items-center gap-2 px-6 py-4 rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] ${
                      isDark
                        ? "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] border border-white/10"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                    }`}
                  >
                    <IconChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                    Geri
                  </button>
                )}

                {step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => canAdvance() && setStep((s) => s + 1)}
                    disabled={!canAdvance()}
                    className="flex-1 group flex items-center justify-between rounded-[1.25rem] bg-[#E61A21] px-6 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <span className="font-black text-sm uppercase tracking-widest">Devam Et</span>
                    <IconChevronRight
                      size={18}
                      strokeWidth={2}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <button
  type="button"
  onClick={handleSubmit}
  disabled={loading}
                    className="flex-1 group flex items-center justify-between rounded-[1.25rem] bg-[#E61A21] px-6 py-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <div className="flex items-center gap-3">
                      {loading
                        ? <IconLoader2 size={20} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                        : <IconRocket size={20} strokeWidth={1.75} aria-hidden="true" />
                      }
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
                          {loading ? "İşleniyor" : "Hazır"}
                        </p>
                        <p className="text-base font-black uppercase tracking-wide">
                          {loading ? "Kaydediliyor..." : "Eğitimi Kaydet"}
                        </p>
                      </div>
                    </div>
                    {!loading && (
                      <IconChevronRight
                        size={20}
                        strokeWidth={2}
                        className="opacity-60 group-hover:translate-x-1 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )}
              </div>

            </form>
          </div>

          {/* ══════════════════════════════════════
              RIGHT — Live Preview Card
          ══════════════════════════════════════ */}
          <div className="hidden xl:block">
            <div className="sticky top-8">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-4">
                Canlı Önizleme
              </p>

              {/* Card */}
              <div
                className={`rounded-[1.5rem] overflow-hidden transition-all duration-300 ${
                  isDark
                    ? "bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "bg-white shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
                }`}
              >
                {/* Cover preview */}
<div className="relative w-full h-44 overflow-hidden">
  {coverFile ? (
    <img
      src={URL.createObjectURL(coverFile)}
      alt="Kapak Önizleme"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#111827] via-[#E61A21]/30 to-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
          <IconBook size={30} strokeWidth={1.5} className="text-white" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
          SporThink Academy
        </p>
      </div>
    </div>
  )}

  <div className="absolute left-4 bottom-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-black uppercase">
    {formData.type}
  </div>

  {formData.duration && (
    <div className="absolute right-4 bottom-4 px-3 py-1 rounded-full bg-white/90 text-zinc-900 text-[10px] font-black">
      {formData.duration} dk
    </div>
  )}
</div>

                {/* Content */}
                <div className="p-5">
                  {/* Category pill */}
                  {formData.category ? (
                    <span className="inline-block mb-3 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#E61A21]/10 text-[#E61A21]">
                      {formData.category}
                    </span>
                  ) : (
                    <div className={`mb-3 h-5 w-20 rounded-lg ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`} />
                  )}

                  {/* Title */}
                  {formData.title ? (
                    <h3 className={`text-base font-black uppercase italic leading-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
                      {formData.title}
                    </h3>
                  ) : (
                    <div className={`h-5 rounded-lg mb-2 ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`} />
                  )}

                  {/* Description */}
                  {formData.description ? (
                    <p className={`text-[11px] font-medium leading-relaxed line-clamp-3 mb-4 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {formData.description}
                    </p>
                  ) : (
                    <div className="space-y-1.5 mb-4">
                      <div className={`h-3 rounded-lg ${isDark ? "bg-white/[0.04]" : "bg-zinc-100"}`} />
                      <div className={`h-3 rounded-lg w-4/5 ${isDark ? "bg-white/[0.04]" : "bg-zinc-100"}`} />
                    </div>
                  )}

                  {/* Meta row */}
                  <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? "border-white/[0.06]" : "border-zinc-100"}`}>
                    {/* Type badge */}
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                      isDark ? "bg-white/[0.06] text-zinc-400" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {formData.type}
                    </span>

                    {/* Duration */}
                    {formData.duration && (
                      <div className="flex items-center gap-1">
                        <IconClock size={11} strokeWidth={2} className="text-zinc-500" aria-hidden="true" />
                        <span className="text-[10px] font-bold text-zinc-500">
                          {formData.duration} dk
                        </span>
                      </div>
                    )}

                    {/* Difficulty dot */}
                    <div className="flex items-center gap-1 ml-auto">
                      <span
                        style={{ backgroundColor: DIFFICULTY_LEVELS.find((d) => d.value === formData.difficulty)?.color }}
                        className="w-1.5 h-1.5 rounded-full"
                      />
                      <span className="text-[10px] font-bold text-zinc-500">
                        {formData.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Mandatory badge */}
                  {formData.is_mandatory && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <IconShieldCheck size={12} strokeWidth={2} className="text-[#E61A21]" aria-hidden="true" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#E61A21]">
                        Zorunlu Eğitim
                      </span>
                    </div>
                  )}

                  {/* Instructor row */}
                  <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDark ? "border-white/[0.06]" : "border-zinc-100"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                      <IconUser size={14} strokeWidth={1.75} className={isDark ? "text-zinc-500" : "text-zinc-400"} aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        Eğitmen
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <IconStar key={s} size={10} strokeWidth={1.5} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Helper note */}
              <p className={`mt-4 text-[11px] font-medium text-center ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                Formu doldurdukça ön izleme güncellenir
              </p>
            </div>
          </div>

        </div>
      )}
    </EgitmenLayout>
  );
}