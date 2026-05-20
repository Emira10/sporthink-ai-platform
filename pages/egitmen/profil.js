import { useEffect, useRef, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import {
  IconUser,
  IconMail,
  IconBrain,
  IconShieldCheck,
  IconLoader2,
  IconCamera,
  IconCheck,
  IconBooks,
  IconForms,
  IconActivity,
  IconServer,
  IconDatabase,
  IconCloud,
  IconClock,
  IconKey,
  IconStar,
  IconChevronRight,
  IconX,
  IconEdit,
  IconInfoCircle,
} from "@tabler/icons-react";

// ── shared primitives ─────────────────────────────────────────────────
const inputCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50 focus:bg-white/[0.06]"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50 focus:bg-white"}`;

// ── section box ───────────────────────────────────────────────────────
function SBox({ isDark, accent = "#E61A21", icon: Icon, label, sub, children, className = "" }) {
  return (
    <div
      style={{ borderTop: `3px solid ${accent}` }}
      className={`rounded-[1.5rem] p-6 ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
      } ${className}`}
    >
      {(label || Icon) && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <span style={{ backgroundColor: `${accent}15`, color: accent }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            </span>
          )}
          <div>
            {label && <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-[0.3em]">{label}</p>}
            {sub   && <p className={`text-[10px] font-bold mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{sub}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// ── field label ───────────────────────────────────────────────────────
function FieldLabel({ accent, icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={12} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</span>
    </div>
  );
}

// ── info row ──────────────────────────────────────────────────────────
function InfoRow({ isDark, label, value, icon: Icon, accent = "#E61A21" }) {
  const isGood =
    String(value).includes("Online")    ||
    String(value).includes("Connected") ||
    String(value).includes("Healthy")   ||
    String(value).includes("Aktif");

  return (
    <div style={{ borderLeft: `3px solid ${accent}` }}
      className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-r-xl rounded-l-sm transition-all ${
        isDark ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-zinc-50 hover:bg-white"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon size={14} strokeWidth={1.75} style={{ color: accent }} className="shrink-0" aria-hidden="true" />}
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
          <p className={`text-[13px] font-black truncate mt-0.5 ${isDark ? "text-white" : "text-zinc-900"}`}>{value || "—"}</p>
        </div>
      </div>
      <span className={`w-2 h-2 rounded-full shrink-0 shadow-lg ${
        isGood ? "bg-green-500 shadow-green-500/40" : "bg-[#E61A21] shadow-red-500/40"
      }`} />
    </div>
  );
}

// ── badge button ──────────────────────────────────────────────────────
function BadgeBtn({ text, onClick, accent = "#E61A21" }) {
  return (
    <button type="button" onClick={onClick}
      style={{ backgroundColor: `${accent}12`, color: accent, borderColor: `${accent}25` }}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px]"
    >
      {text}
      <IconChevronRight size={11} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

// ── stat mini card ────────────────────────────────────────────────────
function MiniStat({ isDark, accent, icon: Icon, label, value }) {
  return (
    <div style={{ borderTop: `2px solid ${accent}` }}
      className={`rounded-xl px-4 py-3 ${
        isDark ? "bg-white/[0.03]" : "bg-zinc-50"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
      <p style={{ color: accent }} className="text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────
export default function Profil() {
  // ── state — كودك الأصلي ──
  const [name,       setName]       = useState("Eğitmen");
  const [email,      setEmail]      = useState("");
  const [expertise,  setExpertise]  = useState("Online Eğitim ve İçerik Yönetimi");
  const [bio,        setBio]        = useState("Yapay zeka destekli eğitim sistemleri ve dijital öğrenme deneyimleri üzerine çalışan eğitmen.");
  const [verified,   setVerified]   = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    role:              "Eğitmen",
    account_status:    "Aktif",
    support_status:    "AI Destekli Panel",
    system_name:       "SporThink Academy",
    last_login_at:     "",
    permissions:       "Courses / Quizzes / Analytics",
    activity_status:   "Online",
    api_status:        "Online",
    database_status:   "Connected",
    storage_status:    "Healthy",
  });
  const [selectedBadge, setSelectedBadge] = useState(null);
  const fileInputRef = useRef(null);
  const [avatarUrl,  setAvatarUrl]  = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [stats,      setStats]      = useState({ courses: 0, quizzes: 0, active: 0 });

  useEffect(() => { loadProfile(); }, []);

  // ── loadProfile — أصلي ──
  async function loadProfile() {
    const savedEmail = localStorage.getItem("userEmail") || "test@test.com";
    try {
      const res  = await fetch(`/api/egitmen/profile?email=${savedEmail}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "Profil alınamadı");
      setName(json.profile?.full_name      || "Eğitmen");
      setEmail(json.profile?.email         || savedEmail);
      setExpertise(json.profile?.expertise || "Online Eğitim ve İçerik Yönetimi");
      setBio(json.profile?.bio             || "Yapay zeka destekli eğitim sistemleri ve dijital öğrenme deneyimleri üzerine çalışan eğitmen.");
      setVerified(!!json.profile?.verified);
      setAvatarUrl(json.profile?.avatar_url || "");
      setStats(json.stats || { courses: 0, quizzes: 0, active: 0 });
      setProfileInfo({
        role:            json.profile?.role             || "Eğitmen",
        account_status:  json.profile?.account_status   || "Aktif",
        support_status:  json.profile?.support_status   || "AI Destekli Panel",
        system_name:     json.profile?.system_name      || "SporThink Academy",
        last_login_at:   json.profile?.last_login_at    || "",
        permissions:     json.profile?.permissions      || "Courses / Quizzes / Analytics",
        activity_status: json.profile?.activity_status  || "Online",
        api_status:      json.profile?.api_status       || "Online",
        database_status: json.profile?.database_status  || "Connected",
        storage_status:  json.profile?.storage_status   || "Healthy",
      });
    } catch (err) {
      console.error("Profil yükleme hatası:", err);
    }
  }

  // ── saveProfile — أصلي ──
  async function saveProfile() {
    setLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const fileBase64 = await fileToBase64(avatarFile);
        const uploadRes  = await fetch("/api/egitmen/upload-avatar", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fileName: avatarFile.name, fileBase64 }),
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.ok) throw new Error(uploadJson.message || "Fotoğraf yüklenemedi");
        finalAvatarUrl = uploadJson.avatar_url;
        setAvatarUrl(finalAvatarUrl);
      }
      const res  = await fetch("/api/egitmen/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, email, expertise, avatar_url: finalAvatarUrl, bio }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "Profil kaydedilemedi");
      localStorage.setItem("userName",  json.profile.full_name);
      localStorage.setItem("userEmail", json.profile.email);
      localStorage.setItem("expertise", json.profile.expertise);
      alert("Profil başarıyla güncellendi!");
    } catch (err) {
      console.error("Profil kaydetme hatası:", err);
      alert("Profil kaydedilemedi!");
    } finally {
      setLoading(false);
    }
  }

  // ── handleAvatarChange — أصلي ──
  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  }

  // ── fileToBase64 — أصلي ──
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <EgitmenLayout pageTitle="Profil" pageSubtitle="Eğitmen hesap bilgileri">
      {({ isDark }) => (
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ══════════════════════════════════════
              ① HERO CARD
          ══════════════════════════════════════ */}
          <div
            style={{ borderTop: "3px solid #E61A21" }}
            className={`rounded-[1.5rem] p-7 ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-7">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-[1.25rem] overflow-hidden bg-[#E61A21] text-white flex items-center justify-center text-5xl font-black shadow-2xl shadow-red-600/25">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span>{name ? name[0].toUpperCase() : "E"}</span>
                  )}
                </div>

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#E61A21] text-white flex items-center justify-center shadow-lg hover:-translate-y-[2px] transition-all duration-200"
                >
                  <IconCamera size={15} strokeWidth={2} aria-hidden="true" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*"
                  onChange={handleAvatarChange} className="hidden" />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E61A21] mb-2">
                  SporThink Eğitmen Profili
                </p>

                <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start mb-1">
                  <h1 className={`text-3xl font-black italic uppercase tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                    {name || "Eğitmen"}
                  </h1>
                  {verified && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      <IconCheck size={11} strokeWidth={2.5} aria-hidden="true" />
                      Verified
                    </span>
                  )}
                </div>

                <p className={`text-sm font-semibold mb-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {email || "Email eklenmedi"}
                </p>

                <p className="text-[13px] font-black text-[#E61A21] mb-2">{expertise}</p>

                <p className={`text-[12px] font-semibold leading-relaxed max-w-xl mb-5 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}>
                  {bio}
                </p>

                {/* Badge buttons */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <BadgeBtn text={profileInfo.role}           onClick={() => setSelectedBadge("role")}   accent="#E61A21" />
                  <BadgeBtn text={profileInfo.account_status} onClick={() => setSelectedBadge("status")} accent="#22C55E" />
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 md:grid-cols-1 gap-3 shrink-0 w-full md:w-36">
                <MiniStat isDark={isDark} accent="#E61A21" icon={IconBooks}  label="Kurs"  value={stats.courses} />
                <MiniStat isDark={isDark} accent="#3B82F6" icon={IconForms}  label="Quiz"  value={stats.quizzes} />
                <MiniStat isDark={isDark} accent="#22C55E" icon={IconActivity} label="Aktif" value={stats.active} />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              ② BADGE DETAIL PANEL
          ══════════════════════════════════════ */}
          {selectedBadge && (
            <div
              style={{ borderTop: `3px solid ${selectedBadge === "role" ? "#E61A21" : "#22C55E"}` }}
              className={`rounded-[1.5rem] p-6 ${
                isDark
                  ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span style={{ backgroundColor: selectedBadge === "role" ? "#E61A2115" : "#22C55E15",
                    color: selectedBadge === "role" ? "#E61A21" : "#22C55E" }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center">
                    {selectedBadge === "role"
                      ? <IconKey size={16} strokeWidth={1.75} aria-hidden="true" />
                      : <IconShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
                    }
                  </span>
                  <p style={{ color: selectedBadge === "role" ? "#E61A21" : "#22C55E" }}
                    className="text-[9px] font-black uppercase tracking-[0.3em]">
                    {selectedBadge === "role" ? "Yetki ve Eğitmen Performansı" : "Hesap Güvenliği ve Durumu"}
                  </p>
                </div>
                <button onClick={() => setSelectedBadge(null)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isDark ? "hover:bg-white/[0.08] text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
                  }`}>
                  <IconX size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              {selectedBadge === "role" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Rol",              value: profileInfo.role,    icon: IconUser,    accent: "#E61A21" },
                    { label: "Yönetilen Eğitim", value: stats.courses,       icon: IconBooks,   accent: "#3B82F6" },
                    { label: "Hazırlanan Quiz",  value: stats.quizzes,       icon: IconForms,   accent: "#F59E0B" },
                    { label: "Yetkiler",         value: "Eğitim / Quiz / Analiz", icon: IconKey, accent: "#8B5CF6" },
                    { label: "Panel Erişimi",    value: "Eğitmen Modülü",    icon: IconShieldCheck, accent: "#22C55E" },
                    { label: "Durum",            value: "Aktif Yetki",       icon: IconActivity, accent: "#22C55E" },
                  ].map((item) => (
                    <InfoRow key={item.label} isDark={isDark} {...item} />
                  ))}
                </div>
              )}

              {selectedBadge === "status" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Hesap Durumu", value: profileInfo.account_status, icon: IconShieldCheck, accent: "#22C55E" },
                    { label: "Email",        value: email || "-",               icon: IconMail,        accent: "#3B82F6" },
                    { label: "Profil",       value: "Güncel",                   icon: IconCheck,       accent: "#22C55E" },
                    { label: "Oturum",       value: "Aktif",                    icon: IconActivity,    accent: "#22C55E" },
                    { label: "Veri Kaynağı", value: "Supabase API",             icon: IconDatabase,    accent: "#8B5CF6" },
                    { label: "Güvenlik",     value: "Service Role Backend",     icon: IconKey,         accent: "#F59E0B" },
                  ].map((item) => (
                    <InfoRow key={item.label} isDark={isDark} {...item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════
              ③ EDIT + ACCOUNT — 2 col
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Edit form */}
            <SBox isDark={isDark} accent="#E61A21" icon={IconEdit} label="Profil Bilgileri" sub="Bilgilerini güncelle">
              <div className="space-y-5">

                <div>
                  <FieldLabel accent="#E61A21" icon={IconUser} label="Ad Soyad" />
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className={inputCls(isDark)} placeholder="Ad Soyad" />
                </div>

                <div>
                  <FieldLabel accent="#3B82F6" icon={IconMail} label="Email" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls(isDark)} placeholder="email@ornek.com" />
                </div>

                <div>
                  <FieldLabel accent="#F59E0B" icon={IconBrain} label="Uzmanlık Alanı" />
                  <input value={expertise} onChange={(e) => setExpertise(e.target.value)}
                    className={inputCls(isDark)} placeholder="Uzmanlık alanı" />
                </div>

                {/* Save button */}
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="group w-full flex items-center justify-between rounded-xl bg-[#E61A21] px-6 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <div className="flex items-center gap-3">
                    {loading
                      ? <IconLoader2 size={18} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                      : <IconCheck   size={18} strokeWidth={2} aria-hidden="true" />
                    }
                    <span className="font-black text-[11px] uppercase tracking-widest">
                      {loading ? "Kaydediliyor..." : "Profili Kaydet"}
                    </span>
                  </div>
                  {!loading && (
                    <IconChevronRight size={16} strokeWidth={2}
                      className="opacity-60 group-hover:translate-x-1 transition-transform duration-200"
                      aria-hidden="true" />
                  )}
                </button>
              </div>
            </SBox>

            {/* Account summary */}
            <SBox isDark={isDark} accent="#3B82F6" icon={IconInfoCircle} label="Hesap Özeti" sub="Sistem durumu ve oturum bilgileri">
              <div className="space-y-3">
                <InfoRow isDark={isDark} label="System Health"
                  value={`${profileInfo.api_status} / ${profileInfo.database_status}`}
                  icon={IconServer} accent="#22C55E" />
                <InfoRow isDark={isDark} label="Session Info"
                  value={profileInfo.activity_status}
                  icon={IconActivity} accent="#22C55E" />
                <InfoRow isDark={isDark} label="Permissions"
                  value={profileInfo.permissions}
                  icon={IconKey} accent="#8B5CF6" />
                <InfoRow isDark={isDark} label="Last Active"
                  value={profileInfo.last_login_at
                    ? new Date(profileInfo.last_login_at).toLocaleString("tr-TR") : "-"}
                  icon={IconClock} accent="#F59E0B" />
                <InfoRow isDark={isDark} label="Database"
                  value={profileInfo.database_status}
                  icon={IconDatabase} accent="#22C55E" />
                <InfoRow isDark={isDark} label="Storage"
                  value={profileInfo.storage_status}
                  icon={IconCloud} accent="#22C55E" />
              </div>
            </SBox>
          </div>

        </div>
      )}
    </EgitmenLayout>
  );
}