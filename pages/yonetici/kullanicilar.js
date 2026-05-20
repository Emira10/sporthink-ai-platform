import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";
import { supabase } from "../../lib/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES  (scoped prefix: ku-)
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .ku-root { font-family: 'Outfit', sans-serif; }

  /* ── Page entry ── */
  @keyframes ku-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ku-fade-up { animation: ku-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both; }
  .ku-delay-1 { animation-delay: 0.08s; }
  .ku-delay-2 { animation-delay: 0.16s; }
  .ku-delay-3 { animation-delay: 0.24s; }
  .ku-delay-4 { animation-delay: 0.32s; }
  .ku-delay-5 { animation-delay: 0.40s; }

  /* ── Breathing dot ── */
  @keyframes ku-breathe {
    0%,100% { opacity:1; }
    50%      { opacity:0.4; }
  }

  /* ── Rotate ── */
  @keyframes ku-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── Stat ring shimmer ── */
  @keyframes ku-ring-shimmer {
    0%   { box-shadow: 0 0 0   6px rgba(230,26,33,0); }
    50%  { box-shadow: 0 0 0  14px rgba(230,26,33,0.12); }
    100% { box-shadow: 0 0 0   6px rgba(230,26,33,0); }
  }

  /* ── Card hover lift ── */
  .ku-card-lift { transition: transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.25s ease; }
  .ku-card-lift:hover { transform: translateY(-5px); }

  /* ── Input base ── */
  .ku-input {
    width: 100%;
    padding: 11px 16px;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid transparent;
  }
  .ku-input:focus { box-shadow: 0 0 0 3px rgba(230,26,33,0.15); border-color: rgba(230,26,33,0.5); }

  /* ── Table row ── */
  .ku-row { transition: background 0.15s ease; cursor: pointer; }

  /* ── Action buttons ── */
  .ku-act-btn {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid transparent;
    font-size: 14px;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  /* ── Tag ── */
  .ku-tag {
    display: inline-flex; align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid transparent;
  }

  /* ── Smart pill buttons ── */
  .ku-pill {
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34,1.2,0.64,1);
    font-family: 'Outfit', sans-serif;
  }

  /* ── Scrollbar ── */
  .ku-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
  .ku-scroll::-webkit-scrollbar-track { background: transparent; }
  .ku-scroll::-webkit-scrollbar-thumb { background: rgba(230,26,33,0.3); border-radius: 2px; }

  /* ── Divider line ── */
  .ku-divider { height: 1px; width: 100%; }

  /* ── Noise overlay ── */
  .ku-noise::after {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; border-radius: inherit;
  }

  /* ── Activity timeline ── */
  .ku-timeline-line {
    position: absolute; left: 11px; top: 24px; bottom: 0;
    width: 1px;
  }

  /* ── Recharts tooltip ── */
  .recharts-tooltip-wrapper { font-family: 'Outfit', sans-serif !important; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   COLOR TOKENS  (depends on isDark)
───────────────────────────────────────────────────────────────────────────── */
function tk(isDark) {
  return {
    bg:         isDark ? "#080809"                    : "#F1F3F7",
    surface:    isDark ? "rgba(255,255,255,0.035)"    : "rgba(255,255,255,0.9)",
    surfaceHov: isDark ? "rgba(255,255,255,0.06)"     : "rgba(255,255,255,1)",
    border:     isDark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.08)",
    borderEm:   isDark ? "rgba(255,255,255,0.13)"     : "rgba(0,0,0,0.14)",
    text:       isDark ? "#FFFFFF"                    : "#0A0A0A",
    textMuted:  isDark ? "rgba(255,255,255,0.38)"     : "rgba(0,0,0,0.42)",
    textFaint:  isDark ? "rgba(255,255,255,0.2)"      : "rgba(0,0,0,0.22)",
    inputBg:    isDark ? "rgba(0,0,0,0.25)"           : "rgba(255,255,255,1)",
    rowHov:     isDark ? "rgba(230,26,33,0.04)"       : "rgba(230,26,33,0.03)",
    theadBg:    isDark ? "rgba(255,255,255,0.04)"     : "rgba(0,0,0,0.025)",
    shadow:     isDark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 8px 40px rgba(0,0,0,0.1)",
    shadowCard: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 20px rgba(0,0,0,0.07)",
    red:        "#E61A21",
    redGlow:    "rgba(230,26,33,0.25)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   AnimatedNumber  ── UNCHANGED LOGIC
───────────────────────────────────────────────────────────────────────────── */
function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const end = parseInt(value || 0);
    if (end === 0) { setDisplayValue(0); return; }
    let start = 0;
    const totalMilisecDur = 900;
    const incrementTime = Math.max(15, totalMilisecDur / end);
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ProgressRing  ── UNCHANGED LOGIC
───────────────────────────────────────────────────────────────────────────── */
function ProgressRing({ radius, stroke, progress, isDark }) {
  const safeProgress = Math.min(100, Math.max(0, progress || 0));
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        stroke={isDark ? "rgba(255,255,255,0.08)" : "#E5E7EB"}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <motion.circle
        stroke="#E61A21"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

function fullName(u) { return [u?.ad, u?.soyad].filter(Boolean).join(" ") || "—"; }
function getInitial(user) { return user?.ad?.charAt(0)?.toUpperCase() || "U"; }

/* ─────────────────────────────────────────────────────────────────────────────
   UserModal  ── UNCHANGED LOGIC · REDESIGNED VISUALS
───────────────────────────────────────────────────────────────────────────── */
function UserModal({ isDark, user, onClose, onSave }) {
  const t = tk(isDark);
  const [form, setForm] = useState(
    user
      ? { ...user }
      : { ad: "", soyad: "", e_posta: "", sifre: "", tur_id: 1, durum_id: 1, departman: "", telefon: "" }
  );
  const [saving, setSaving] = useState(false);


  async function handleSubmit() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  const inputStyle = {
    background: t.inputBg,
    border: `1px solid ${t.border}`,
    color: t.text,
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(16px)",
  padding: "16px",
  overflowY: "auto",
}}
    >
      <motion.div
        initial={{ scale: 0.9, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{
  position: "relative",
  width: "100%",
  maxWidth: "420px",
  maxHeight: "88vh",
  overflowY: "auto",
          borderRadius: "28px", border: `1px solid ${t.border}`,
          padding: "32px",
          background: isDark ? "rgba(9,9,11,0.97)" : "rgba(255,255,255,0.98)",
          boxShadow: t.shadow,
        }}
      >
        {/* ambient glows */}
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "180px", height: "180px", background: "rgba(230,26,33,0.12)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "160px", height: "160px", background: "rgba(59,130,246,0.06)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
              background: "linear-gradient(145deg,#E61A21,#A01018)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", boxShadow: "0 6px 20px rgba(230,26,33,0.35)",
            }}>
              {user?.kullanici_id ? "✏️" : "👤"}
            </div>
            <div>
              <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.3em", color: "#E61A21", textTransform: "uppercase", marginBottom: "4px" }}>
                SPORTHINK PANEL
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "26px", letterSpacing: "0.04em", color: t.text, lineHeight: 1 }}>
                {user?.kullanici_id ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}
              </h2>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { key: "ad", label: "Ad *", ph: "Ahmet" },
                { key: "soyad", label: "Soyad", ph: "Yılmaz" },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>{label}</label>
                  <input className="ku-input" style={inputStyle} placeholder={ph}
                    value={form[key] || ""}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
            </div>

            {!user?.kullanici_id && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>E-posta *</label>
                  <input className="ku-input" style={inputStyle} placeholder="ahmet@sporthink.com"
                    value={form.e_posta || ""}
                    onChange={(e) => setForm({ ...form, e_posta: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>Şifre *</label>
                  <input className="ku-input" style={inputStyle} placeholder="••••••••" type="password"
                    value={form.sifre || ""}
                    onChange={(e) => setForm({ ...form, sifre: e.target.value })} />
                </div>
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>Kullanıcı Türü</label>
                <select className="ku-input" style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.tur_id || 1}
                  onChange={(e) => setForm({ ...form, tur_id: Number(e.target.value) })}>
                  <option value={1}>Kullanıcı</option>
                  <option value={2}>Eğitmen</option>
                  <option value={3}>Yönetici</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>Departman</label>
                <input className="ku-input" style={inputStyle} placeholder="İK"
                  value={form.departman || ""}
                  onChange={(e) => setForm({ ...form, departman: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" }}>Telefon</label>
              <input className="ku-input" style={inputStyle} placeholder="+90..."
                value={form.telefon || ""}
                onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                flex: 1, padding: "13px", borderRadius: "14px", border: "none",
                background: "linear-gradient(135deg,#E61A21,#ff4d52)",
                color: "#fff", fontFamily: "'Outfit',sans-serif", fontWeight: 800,
                fontSize: "13px", cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.65 : 1,
                boxShadow: "0 6px 20px rgba(230,26,33,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              {saving && <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />}
              {user?.kullanici_id ? "Güncelle" : "Kaydet"}
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "13px", borderRadius: "14px",
                border: `1px solid ${t.border}`,
                background: "transparent",
                color: t.textMuted, fontFamily: "'Outfit',sans-serif", fontWeight: 700,
                fontSize: "13px", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              İptal
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StatCard  ── UNCHANGED LOGIC · REDESIGNED VISUALS
───────────────────────────────────────────────────────────────────────────── */

function DeleteModal({ isDark, user, onClose, onDelete }) {
  const t = tk(isDark);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(16px)",
        padding: "16px",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 24 }}
        style={{
          width: "100%",
          maxWidth: "360px",
          borderRadius: "24px",
          padding: "32px",
          background: isDark ? "rgba(9,9,11,0.97)" : "#fff",
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
        }}
      >
        <h3
          style={{
            color: t.text,
            fontSize: "24px",
            marginBottom: "10px",
            fontFamily: "'Bebas Neue',cursive",
          }}
        >
          Kullanıcı silinsin mi?
        </h3>

        <p style={{ color: t.textMuted, fontSize: "13px" }}>
          {user?.ad} {user?.soyad} silinecek.
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            onClick={onDelete}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#E61A21",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Evet, Sil
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: `1px solid ${t.border}`,
              background: "transparent",
              color: t.text,
              cursor: "pointer",
            }}
          >
            Vazgeç
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function StatCard({
  isDark,
  icon,
  title,
  value,
  accentColor,
  subtitle,
  onClick,
}) {
  const t = tk(isDark);
  return (
    <motion.div
        onClick={onClick}
  className="ku-card-lift ku-noise"
  whileHover={{ scale: 1.02 }}
  style={{
    cursor: onClick ? "pointer" : "default",
        position: "relative", overflow: "hidden",
        borderRadius: "20px",
        padding: "22px",
        background: t.surface,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadowCard,
      }}
    >
      {/* accent top bar */}
      <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "2px", borderRadius: "0 0 4px 4px", background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      {/* glow orb */}
      <div style={{ position: "absolute", top: "-30px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: accentColor, opacity: 0.08, filter: "blur(30px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* icon */}
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px", marginBottom: "16px",
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px",
        }}>
          {icon}
        </div>

        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted, marginBottom: "8px" }}>
          {title}
        </p>

        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "44px", lineHeight: 1, letterSpacing: "0.02em", color: t.text }}>
          <AnimatedNumber value={value} />
        </div>

        <p style={{ fontSize: "11px", fontWeight: 500, color: t.textFaint, marginTop: "6px" }}>
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function KullanicilarPage() {
  /* ── All state & logic UNCHANGED ── */
  const [users, setUsers]                     = useState([]);
  const [filtered, setFiltered]               = useState([]);
  const [stats, setStats]                     = useState({ total: 0, active: 0, admins: 0, newThisMonth: 0 });
  const [search, setSearch]                   = useState("");
  const [turFilter, setTurFilter]             = useState("all");
  const [depFilter, setDepFilter]             = useState("all");
  const [departments, setDepartments]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [modalUser, setModalUser]             = useState(undefined);
  const [drawerType, setDrawerType] = useState(null);
  const [drawerUser, setDrawerUser]           = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [toast, setToast]                     = useState(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  

  const [activities, setActivities] = useState([
    { id: 1, user: "Amira",  action: "Yeni kullanıcı ekledi",                   time: "Az önce"   },
    { id: 2, user: "Sistem", action: "Yedekleme tamamlandı",                    time: "10dk önce" },
    { id: 3, user: "Admin",  action: "Departman güncellendi",                   time: "1saat önce"},
    { id: 4, user: "Panel",  action: "Kullanıcı raporu hazırlandı",             time: "Bugün"     },
    { id: 5, user: "AI",     action: "Riskli kullanıcı hareketleri analiz edildi", time: "Dün"   },
  ]);

  const activityChartData = activities.map((item, index) => ({ name: item.time, value: index + 1 }));

  const smartInsights = {
    ai: {
      title: "AI Destekli Kullanıcı Analizi", icon: "🤖",
      text: `Sistemde toplam ${stats.total} kullanıcı var. Bu ay ${stats.newThisMonth} yeni kullanıcı eklendi. Aktif kullanıcı sayısı ${stats.active}.`,
      advice: stats.active === 0 ? "Aktif kullanıcı yok." : "Kullanıcı hareketliliği iyi.",
    },
    live: {
      title: "Canlı Sistem Akışı", icon: "📡",
      text: `Toplam ${activities.length} işlem mevcut.`,
      advice: "Sistem hareketleri burada gösterilir.",
    },
    analytics: {
      title: "Smart Analytics", icon: "📊",
      text: `Toplam ${stats.total} kullanıcıdan ${stats.admins} admin.`,
      advice: stats.admins === 0 ? "Admin yok ⚠️" : "Rol dağılımı iyi.",
    },
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        (u.ad || "").toLowerCase().includes(q) ||
        (u.soyad || "").toLowerCase().includes(q) ||
        (u.e_posta || "").toLowerCase().includes(q) ||
        (u.departman || "").toLowerCase().includes(q)
      );
    }
    if (turFilter !== "all") result = result.filter((u) => String(u.tur_id) === turFilter);
    if (depFilter !== "all") result = result.filter((u) => u.departman === depFilter);
    setFiltered(result);
  }, [search, turFilter, depFilter, users]);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchActivities() {
  try {
    const res = await fetch("/api/yonetici/activity-logs");
    const json = await res.json();

    if (!json.ok) throw new Error(json.message);

    const mapped = (json.logs || []).map((log) => ({
      id: log.id,
      user: log.actor_name || "Sistem",
      action: log.action,
      time: new Date(log.created_at).toLocaleString("tr-TR"),
    }));

    setActivities(mapped);
  } catch (e) {
    console.error("Activity logs error:", e);
  }
}

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/yonetici/kullanicilar");
const json = await res.json();

if (!json.ok) throw new Error(json.message);

const usersData = json.users || [];

      const { data: assignData }   = await supabase.from("training_assignments").select("user_id, status");
      const { data: progressData } = await supabase.from("user_progress").select("user_id, is_completed");

      const enriched = (usersData || []).map((u) => {
        const uid      = u.kullanici_id;
        const assigns  = (assignData   || []).filter((a) => a.user_id === uid);
        const progress = (progressData || []).filter((p) => p.user_id === uid);
        const total     = assigns.length || progress.length;
        const completed =
          assigns.filter((a) => a.status === "completed").length ||
          progress.filter((p) => p.is_completed === true).length;
        return { ...u, total_trainings: total, completed_trainings: completed };
      });

      setUsers(enriched);
      const deps = [...new Set(enriched.map((u) => u.departman).filter(Boolean))];
      setDepartments(deps);

      const weekAgo    = new Date(Date.now() - 7 * 86400000).toISOString();
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      setStats({
        total:        enriched.length,
        active:       enriched.filter((u) => u.son_giris_tarihi && u.son_giris_tarihi >= weekAgo).length,
        admins:       enriched.filter((u) => u.tur_id === 2 || u.tur_id === 3).length,
        newThisMonth: enriched.filter((u) => (u.kayit_tarihi || u.created_at) >= monthStart).length,
      });

      await fetchActivities();

    } catch (e) {
      console.error("Fetch error:", e);
      showToast("Hata: " + e.message, "err");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(form) {
    try {
      if (!form.ad?.trim())                           { showToast("Ad alanı zorunlu", "err"); return; }
      if (!form.kullanici_id && !form.e_posta?.trim()) { showToast("E-posta zorunlu", "err"); return; }
      if (!form.kullanici_id && !form.sifre?.trim())   { showToast("Şifre zorunlu",   "err"); return; }

      if (form.kullanici_id) {
        const res = await fetch("/api/yonetici/kullanicilar", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    kullanici_id: form.kullanici_id,
    ad: form.ad?.trim(),
    soyad: form.soyad?.trim() || "",
    tur_id: Number(form.tur_id || 1),
    departman: form.departman?.trim() || null,
    telefon: form.telefon || null,
  }),
});

const json = await res.json();
if (!json.ok) throw new Error(json.message);
        showToast("Güncellendi ✓");

        await fetch("/api/yonetici/activity-logs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    actor_name: form.ad,
    action: "Kullanıcı bilgileri güncellendi",
    target_type: "user",
    target_id: form.kullanici_id,
  }),
});

await fetchActivities();

        setActivities((prev) => [{ id: Date.now(), user: form.ad, action: "Kullanıcı bilgileri güncellendi", time: "Az önce" }, ...prev]);
      } else {
        const payload = {
          ad: form.ad.trim(), soyad: form.soyad?.trim() || "",
          e_posta: form.e_posta.trim(), sifre: form.sifre.trim(),
          durum_id: 1, tur_id: Number(form.tur_id || 1),
          departman: form.departman?.trim() || null,
          telefon:   form.telefon || null,
          kayit_tarihi: new Date().toISOString(), durum: "active",
        };
        const res = await fetch("/api/yonetici/kullanicilar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const json = await res.json();
if (!json.ok) throw new Error(json.message);

const data = [json.user];
        showToast("Yeni kullanıcı eklendi ✓");
        await fetch("/api/yonetici/activity-logs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    actor_name: form.ad,
    action: "Yeni kullanıcı eklendi",
    target_type: "user",
    target_id: data?.[0]?.kullanici_id,
  }),
});

await fetchActivities();
      }
      setModalUser(undefined);
      await fetchAll();
    } catch (e) {
      showToast(e.message || "Kaydetme hatası", "err");
    }
  }

  async function handleDeleteUser() {
    try {
      if (!deleteUser?.kullanici_id) return;
      const res = await fetch("/api/yonetici/kullanicilar", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ kullanici_id: deleteUser?.kullanici_id }),
});

const json = await res.json();

if (!json.ok) throw new Error(json.message);
      showToast("Kullanıcı silindi ✓");

      await fetch("/api/yonetici/activity-logs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    actor_name: "Yönetici",
    action: "Kullanıcı silindi",
    target_type: "user",
    target_id: deleteUser?.kullanici_id,
  }),
});

await fetchActivities();

      setDeleteUser(null);
      await fetchAll();
    } catch (e) {
      showToast(e.message || "Silme hatası", "err");
    }
  }

  const selectedUsers =
  drawerType === "admins"
    ? users.filter(
        (u) =>
          String(u.tur_id) === "2" ||
          String(u.rol_id) === "2" ||
          u.rol?.toLowerCase?.().includes("admin") ||
          u.rol?.toLowerCase?.().includes("yönet")
      )
    : drawerType === "new"
    ? users.filter((u) => {
        if (!u.created_at) return false;

        const created = new Date(u.created_at);
        const now = new Date();

        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      })
    : [];


  /* ─────────── RENDER ─────────── */
  return (
    <>
      <style>{STYLES}</style>

      <YoneticiLayout pageTitle="Kullanıcılar" pageSubtitle="Dijital ekosistemi yönet ve analiz et">
        {({ isDark }) => {
          const t = tk(isDark);

          return (
            <div className="ku-root" style={{ position: "relative" }}>

              {/* ── Ambient background orbs ── */}
              <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: "5%",  left: "20%",  width: "500px", height: "500px", borderRadius: "50%", background: "rgba(230,26,33,0.04)",  filter: "blur(120px)" }} />
                <div style={{ position: "absolute", bottom: "5%", right: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(59,130,246,0.03)", filter: "blur(100px)" }} />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>

                {/* ════════════════════════════════════════════════════════════
                    TOAST
                ════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                  {toast && (
                    <motion.div
                      initial={{ x: 80, opacity: 0 }}
                      animate={{ x: 0,  opacity: 1 }}
                      exit={{   x: 80, opacity: 0 }}
                      style={{
                        position: "fixed", top: "24px", right: "24px", zIndex: 200,
                        padding: "14px 22px",
                        borderRadius: "16px",
                        fontFamily: "'Outfit',sans-serif",
                        fontWeight: 700, fontSize: "13px",
                        backdropFilter: "blur(20px)",
                        background: toast.type === "ok" ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)",
                        color: "#fff",
                        border: `1px solid ${toast.type === "ok" ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)"}`,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                      }}
                    >
                      {toast.msg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ════════════════════════════════════════════════════════════
                    MODAL
                ════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                  {modalUser !== undefined && (
                    <UserModal isDark={isDark} user={modalUser}
                      onClose={() => setModalUser(undefined)} onSave={handleSave} />
                  )}
                </AnimatePresence>

              <AnimatePresence>
  {drawerType &&
    createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setDrawerType(null)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "420px",
            maxWidth: "95vw",
            maxHeight: "85vh",
            overflowY: "auto",
            borderRadius: "24px",
            background: isDark ? "#09090B" : "#fff",
            padding: "28px",
            border: `1px solid ${t.border}`,
            boxShadow: t.shadow,
          }}
        >
          <h2 style={{ fontSize: "28px", marginBottom: "20px", color: t.text, fontFamily: "'Bebas Neue',cursive" }}>
            {drawerType === "admins" ? "Yönetici ve Eğitmenler" : "Bu Ay Eklenen Kullanıcılar"}
          </h2>

          {selectedUsers.map((u) => (
            <div key={u.kullanici_id} style={{ padding: "16px", borderRadius: "18px", marginBottom: "14px", border: `1px solid ${t.border}` }}>
              <div style={{ color: t.text, fontWeight: 700 }}>{u.ad} {u.soyad}</div>
              <div style={{ color: t.textMuted, fontSize: "13px", marginTop: "4px" }}>{u.e_posta}</div>
              <div style={{ color: "#E61A21", fontSize: "12px", marginTop: "8px", fontWeight: 700 }}>
                {u.departman || "Departman yok"}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>,
      document.body
    )}
</AnimatePresence>

                {/* ════════════════════════════════════════════════════════════
                    DELETE CONFIRM
                ════════════════════════════════════════════════════════════ */}
                <AnimatePresence>
  {deleteUser && (
    <DeleteModal
      isDark={isDark}
      user={deleteUser}
      onClose={() => setDeleteUser(null)}
      onDelete={handleDeleteUser}
    />
  )}
</AnimatePresence>

                {/* ════════════════════════════════════════════════════════════
                    MAIN LAYOUT (two-column)
                ════════════════════════════════════════════════════════════ */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                  {/* ── ROW 1 : Hero Panel ── */}
                  <motion.section
                    className="ku-fade-up ku-noise"
                    style={{
                      position: "relative", overflow: "hidden",
                      borderRadius: "24px",
                      padding: "22px 28px",
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      boxShadow: t.shadowCard,
                    }}
                  >
                    {/* Top accent line */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent 0%,#E61A21 40%,transparent 100%)" }} />

                    {/* glow orb */}
                    <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "260px", height: "260px", borderRadius: "50%", background: "rgba(230,26,33,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />

                    <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "32px" }}>

                      {/* Left: text block */}
                      <div style={{ flex: "1 1 320px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#E61A21", boxShadow: "0 0 8px rgba(230,26,33,0.8)", animation: "ku-breathe 2.5s ease-in-out infinite" }} />
                          <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#E61A21" }}>
                            SPORTHINK · DIGITAL ECOSYSTEM
                          </span>
                        </div>

                        {/* ─── TITLE  (matches Dashboard standards) ─── */}
                        <div style={{ position: "relative", display: "inline-block", marginBottom: "6px" }}>
                          <h1 style={{
                            fontFamily: "'Bebas Neue',cursive",
                            fontSize: "clamp(28px,3.5vw,46px)",
                            lineHeight: 0.95,
                            letterSpacing: "0.02em",
                            color: t.text,
                            margin: 0,
                          }}>
                            Kullanıcılar
                          </h1>
                          <div style={{ position: "absolute", bottom: "-4px", left: 0, height: "2px", width: "45%", borderRadius: "2px", background: "linear-gradient(90deg,#E61A21,transparent)" }} />
                        </div>

                        <p style={{ fontSize: "13px", fontWeight: 400, color: t.textMuted, maxWidth: "310px", lineHeight: 1.6 }}>
                          Geleceğin yeteneklerini yönetin. Verimliliği artırın ve her etkileşimi analiz edin.
                        </p>
                      </div>

                      {/* Right: counter widget + CTA */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        {/* ─── ANIMATED COUNTER WIDGET (unchanged logic) ─── */}
                        <div style={{
                          position: "relative", width: "120px", height: "120px",
                          borderRadius: "28px",
                          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1px solid ${t.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          animation: "ku-ring-shimmer 3s ease-in-out infinite",
                        }}>
                          {/* Rotating dashed ring */}
                          <div style={{
                            position: "absolute", inset: "10px", borderRadius: "20px",
                            border: "1.5px dashed rgba(230,26,33,0.3)",
                            animation: "ku-spin-slow 18s linear infinite",
                          }} />
                          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                            <p style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "40px", lineHeight: 1, color: "#E61A21", letterSpacing: "0.02em" }}>
                              {stats.total}
                            </p>
                            <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: t.textMuted }}>
                              Total Users
                            </p>
                          </div>
                        </div>

                        {/* Add User CTA */}
                        <motion.button
                          whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(230,26,33,0.45)" }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setModalUser(null)}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "13px 24px", borderRadius: "16px", border: "none",
                            background: "linear-gradient(135deg,#E61A21,#ff4d52)",
                            color: "#fff", fontFamily: "'Outfit',sans-serif",
                            fontWeight: 800, fontSize: "13px", cursor: "pointer",
                            boxShadow: "0 6px 24px rgba(230,26,33,0.35)",
                            letterSpacing: "0.03em",
                          }}
                        >
                          <span style={{ width: "22px", height: "22px", borderRadius: "8px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 900, transition: "transform 0.2s ease" }}>+</span>
                          Yeni Kullanıcı Ekle
                        </motion.button>
                      </div>
                    </div>
                  </motion.section>

                  {/* ── ROW 4 : Content + Sidebar ── */}
                  <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>

                    {/* ── Main column ── */}
                    <div style={{ flex: "1 1 520px", display: "flex", flexDirection: "column", gap: "16px" }}>

                      {/* Filter Bar */}
                      <div
                        className="ku-fade-up ku-delay-2"
                        style={{
                          borderRadius: "18px", padding: "14px 16px",
                          background: t.surface, border: `1px solid ${t.border}`,
                          display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
                        }}
                      >
                        {/* Search */}
                        <div style={{ position: "relative", flex: "1 1 200px" }}>
                          <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", opacity: 0.35 }}>🔍</span>
                          <input
                            className="ku-input ku-scroll"
                            style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, paddingLeft: "36px" }}
                            placeholder="İsim, e-posta, departman..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>

                        {/* Role filter */}
                        <select
                          className="ku-input"
                          style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, width: "auto", flex: "0 1 160px", cursor: "pointer" }}
                          value={turFilter}
                          onChange={(e) => setTurFilter(e.target.value)}
                        >
                          <option value="all">Tüm Roller</option>
                          <option value="1">Kullanıcı</option>
                          <option value="2">Eğitmen</option>
                          <option value="3">Yönetici</option>
                        </select>

                        {/* Dept filter */}
                        <select
                          className="ku-input"
                          style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text, width: "auto", flex: "0 1 160px", cursor: "pointer" }}
                          value={depFilter}
                          onChange={(e) => setDepFilter(e.target.value)}
                        >
                          <option value="all">Tüm Departmanlar</option>
                          {departments.map((dep) => (
                            <option key={dep} value={dep}>{dep}</option>
                          ))}
                        </select>
                      </div>

                      {/* Table */}
                      <div
                        className="ku-fade-up ku-delay-3"
                        style={{
                          borderRadius: "20px", overflow: "hidden",
                          background: t.surface, border: `1px solid ${t.border}`,
                          boxShadow: t.shadowCard,
                        }}
                      >
                        {/* Table header */}
                        <div style={{
                          padding: "18px 24px",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          borderBottom: `1px solid ${t.border}`,
                        }}>
                          <div>
                            <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "22px", letterSpacing: "0.04em", color: t.text }}>Kullanıcı Listesi</h3>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: t.textMuted, marginTop: "2px" }}>{filtered.length} sonuç gösteriliyor</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.7)", animation: "ku-breathe 2s ease-in-out infinite" }} />
                              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#10B981" }}>Live</span>
                            </div>
                            <p style={{ fontSize: "10px", color: t.textFaint, marginTop: "2px", fontWeight: 500 }}>Supabase aktif</p>
                          </div>
                        </div>

                        {/* Table body */}
                        <div className="ku-scroll" style={{ overflowX: "auto" }}>
                          {loading ? (
                            <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <div style={{ width: "40px", height: "40px", border: "3px solid rgba(230,26,33,0.2)", borderTopColor: "#E61A21", borderRadius: "50%", animation: "ku-spin-slow 0.7s linear infinite" }} />
                              <p style={{ marginTop: "16px", fontSize: "12px", fontWeight: 600, color: t.textMuted }}>Kullanıcılar yükleniyor...</p>
                            </div>
                          ) : filtered.length === 0 ? (
                            <div style={{ padding: "60px 24px", textAlign: "center" }}>
                              <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</p>
                              <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "22px", letterSpacing: "0.04em", color: t.text }}>Sonuç bulunamadı</h3>
                              <p style={{ fontSize: "12px", color: t.textMuted, marginTop: "6px" }}>Arama veya filtreleri değiştirerek tekrar deneyebilirsin.</p>
                            </div>
                          ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ background: t.theadBg, borderBottom: `1px solid ${t.border}` }}>
                                  {["Kullanıcı", "Rol", "İlerleme", "Departman", ""].map((h, i) => (
                                    <th key={i} style={{
                                      padding: "12px 20px",
                                      textAlign: i === 4 ? "right" : "left",
                                      fontSize: "9px", fontWeight: 700,
                                      letterSpacing: "0.22em", textTransform: "uppercase",
                                      color: t.textFaint, whiteSpace: "nowrap",
                                    }}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filtered.map((user, idx) => {
                                  const pct = Math.round((user.completed_trainings / (user.total_trainings || 1)) * 100);
                                  return (
                                    <motion.tr
                                      key={user.kullanici_id}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.03 }}
                                      className="ku-row"
                                      style={{ borderBottom: `1px solid ${t.border}` }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = t.rowHov; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                    >
                                      {/* Avatar + name */}
                                      <td
  onClick={() => setDrawerUser(user)}
  style={{ padding: "14px 20px", cursor: "pointer" }}
>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                          <div style={{ position: "relative", flexShrink: 0 }}>
                                            <div style={{
                                              width: "42px", height: "42px", borderRadius: "13px",
                                              background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                                              border: `1px solid ${t.border}`,
                                              display: "flex", alignItems: "center", justifyContent: "center",
                                              fontWeight: 800, color: "#E61A21", fontSize: "16px", overflow: "hidden",
                                            }}>
                                              {user.profil_foto_url
                                                ? <img src={user.profil_foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={fullName(user)} />
                                                : getInitial(user)
                                              }
                                            </div>
                                            <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: "#10B981", border: `2px solid ${isDark ? "#080809" : "#F1F3F7"}` }} />
                                          </div>
                                          <div>
                                            <p style={{ fontSize: "13px", fontWeight: 700, color: t.text }}>{fullName(user)}</p>
                                            <p style={{ fontSize: "11px", fontWeight: 400, color: t.textMuted, marginTop: "2px" }}>{user.e_posta}</p>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Role tag */}
                                      <td style={{ padding: "14px 20px" }}>
                                        <span className="ku-tag" style={{
                                          background: user.tur_id === 3 ? "rgba(230,26,33,0.1)" : user.tur_id === 2 ? "rgba(139,92,246,0.1)" : "rgba(59,130,246,0.1)",
                                          color:      user.tur_id === 3 ? "#E61A21"             : user.tur_id === 2 ? "#8B5CF6"             : "#3B82F6",
                                          borderColor: user.tur_id === 3 ? "rgba(230,26,33,0.22)" : user.tur_id === 2 ? "rgba(139,92,246,0.22)" : "rgba(59,130,246,0.22)",
                                        }}>
                                          {user.tur_id === 3 ? "Yönetici" : user.tur_id === 2 ? "Eğitmen" : "Kullanıcı"}
                                        </span>
                                      </td>

                                      {/* Progress */}
                                      <td style={{ padding: "14px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                          <ProgressRing radius={20} stroke={3} progress={pct} isDark={isDark} />
                                          <span style={{ fontSize: "11px", fontWeight: 700, color: t.textMuted }}>%{pct}</span>
                                        </div>
                                      </td>

                                      {/* Dept */}
                                      <td style={{ padding: "14px 20px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>{user.departman || "Genel"}</span>
                                      </td>

                                      {/* Actions */}
                                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                          <button
                                            className="ku-act-btn"
                                            onClick={(e) => { e.stopPropagation(); setModalUser(user); }}
                                            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderColor: t.border }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "#E61A21"; e.currentTarget.style.borderColor = "#E61A21"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = t.border; }}
                                          >✏️</button>
                                          <button
  className="ku-act-btn"
  onClick={(e) => {
    e.stopPropagation();
    setDeleteUser(user);
  }}
  style={{ background: "rgba(230,26,33,0.08)", borderColor: "rgba(230,26,33,0.2)" }}
  onMouseEnter={(e) => { e.currentTarget.style.background = "#E61A21"; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(230,26,33,0.08)"; }}
>
  🗑️
</button>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </YoneticiLayout>
    </>
  );
}