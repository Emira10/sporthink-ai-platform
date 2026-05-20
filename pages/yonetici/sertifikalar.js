import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tk(isDark) {
  return {
    text:        isDark ? "#FFFFFF"                    : "#0A0A0A",
    textMuted:   isDark ? "rgba(255,255,255,0.38)"     : "rgba(0,0,0,0.42)",
    textFaint:   isDark ? "rgba(255,255,255,0.18)"     : "rgba(0,0,0,0.2)",
    surface:     isDark ? "rgba(255,255,255,0.032)"    : "rgba(255,255,255,0.92)",
    surfaceHigh: isDark ? "rgba(255,255,255,0.06)"     : "#FFFFFF",
    border:      isDark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.08)",
    borderEm:    isDark ? "rgba(255,255,255,0.13)"     : "rgba(0,0,0,0.13)",
    inputBg:     isDark ? "rgba(0,0,0,0.28)"           : "#FFFFFF",
    theadBg:     isDark ? "rgba(255,255,255,0.04)"     : "rgba(0,0,0,0.025)",
    shadow:      isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 8px 40px rgba(0,0,0,0.09)",
    shadowSm:    isDark ? "0 4px 20px rgba(0,0,0,0.4)"  : "0 2px 16px rgba(0,0,0,0.07)",
    red:         "#E61A21",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  approved: { label: "Onaylı",    bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.22)",  text: "#10B981", dot: "#10B981" },
  rejected: { label: "Reddedildi",bg: "rgba(230,26,33,0.1)",   border: "rgba(230,26,33,0.22)",   text: "#E61A21", dot: "#E61A21" },
  unlocked: { label: "Beklemede", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.22)",  text: "#F59E0B", dot: "#F59E0B" },
};

const LEVEL_CONFIG = {
  "ALTIN SEVİYE":  { icon: "🏆", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)", text: "#F59E0B" },
  "GÜMÜŞ SEVİYE": { icon: "🥈", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.22)", text: "#94A3B8" },
  "BRONZ SEVİYE":  { icon: "🥉", bg: "rgba(180,120,60,0.1)", border: "rgba(180,120,60,0.22)",  text: "#B4783C" },
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .sc-root { font-family: 'Outfit', sans-serif; }

  @keyframes sc-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .sc-fu   { animation: sc-fade-up .48s cubic-bezier(.22,1,.36,1) both; }
  .sc-d1   { animation-delay:.07s; }
  .sc-d2   { animation-delay:.14s; }
  .sc-d3   { animation-delay:.21s; }
  .sc-d4   { animation-delay:.28s; }

  @keyframes sc-breathe { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes sc-spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes sc-float   {
    0%,100% { transform: translateY(0px) rotate(-1deg); }
    50%     { transform: translateY(-6px) rotate(1deg); }
  }
  @keyframes sc-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes sc-glow-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(230,26,33,0); }
    50%     { box-shadow: 0 0 0 10px rgba(230,26,33,0.1); }
  }

  /* Card hover */
  .sc-cert-card {
    transition: transform .28s cubic-bezier(.34,1.2,.64,1),
                box-shadow .28s ease,
                border-color .2s ease;
  }
  .sc-cert-card:hover { transform: translateY(-5px) scale(1.012); }

  /* Action button */
  .sc-action-btn {
    border: none; cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-weight: 800; font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: 9px 0; border-radius: 10px;
    flex: 1;
    transition: all .2s cubic-bezier(.34,1.2,.64,1);
  }
  .sc-action-btn:hover { transform: translateY(-1px); }
  .sc-action-btn:active { transform: scale(.97); }

  /* Input */
  .sc-input {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; font-weight: 600;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid transparent;
    outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
    width: 100%;
  }
  .sc-input:focus { box-shadow: 0 0 0 3px rgba(230,26,33,.15); border-color: rgba(230,26,33,.5) !important; }

  /* Stat card */
  .sc-stat { transition: transform .22s cubic-bezier(.34,1.2,.64,1); }
  .sc-stat:hover { transform: translateY(-3px); }

  /* Certificate image glow */
  .sc-cert-img-wrap {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .sc-cert-img-wrap::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.4) 100%);
    z-index: 1; pointer-events: none;
  }

  /* Shimmer on gold level */
  .sc-gold-shimmer {
    background: linear-gradient(90deg, #F59E0B 0%, #FDE68A 50%, #F59E0B 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: sc-shimmer 3s linear infinite;
  }

  /* Scrollbar */
  .sc-scroll::-webkit-scrollbar { width:3px; }
  .sc-scroll::-webkit-scrollbar-thumb { background:rgba(230,26,33,0.3); border-radius:2px; }

  /* Empty state float */
  .sc-float { animation: sc-float 4s ease-in-out infinite; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   CERTIFICATE CARD
───────────────────────────────────────────────────────────────────────────── */
function CertCard({ c, isDark, idx }) {
  const t       = tk(isDark);
  const status  = STATUS_CONFIG[c.status] || STATUS_CONFIG.unlocked;
  const level   = LEVEL_CONFIG[c.level]   || { icon: "📜", bg: "rgba(100,100,100,0.1)", border: "rgba(100,100,100,0.2)", text: t.textMuted };
  const isGold  = c.level === "ALTIN SEVİYE";
  const date    = c.issued_at ? new Date(c.issued_at).toLocaleDateString("tr-TR") : "—";

  return (
    <motion.div
      className="sc-cert-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: "20px",
        padding: "20px",
        background: isDark
          ? "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))"
          : "#FFFFFF",
        border: `1px solid ${isGold ? "rgba(245,158,11,0.25)" : t.border}`,
        boxShadow: isGold
          ? (isDark ? "0 4px 24px rgba(245,158,11,0.08)" : "0 4px 24px rgba(245,158,11,0.12)")
          : t.shadowSm,
      }}
    >
      {/* Gold top bar */}
      {isGold && (
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#F59E0B,transparent)" }} />
      )}

      {/* Ambient glow for gold */}
      {isGold && (
        <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"rgba(245,158,11,0.08)", filter:"blur(30px)", pointerEvents:"none" }} />
      )}

      <div style={{ position:"relative", zIndex:1 }}>
        {/* Certificate image */}
        <div className="sc-cert-img-wrap">
          <img
            src="/certificates/success-level.png"
            alt="certificate"
            style={{ width:"100%", height:"auto", display:"block", borderRadius:"14px" }}
          />
          {/* Level badge on image */}
          <div style={{
            position:"absolute", bottom:"10px", left:"10px", zIndex:2,
            padding:"4px 10px", borderRadius:"20px",
            background:"rgba(0,0,0,0.55)",
            backdropFilter:"blur(8px)",
            display:"flex", alignItems:"center", gap:"5px",
          }}>
            <span style={{ fontSize:"12px" }}>{level.icon}</span>
            <span style={{
              fontSize:"9px", fontWeight:700,
              letterSpacing:"0.12em", textTransform:"uppercase",
              color: isGold ? "#FDE68A" : "#fff",
            }}>
              {c.level || "Seviye Yok"}
            </span>
          </div>
        </div>

        {/* User ID row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{
              width:"26px", height:"26px", borderRadius:"8px",
              background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
              border:`1px solid ${t.border}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"11px",
            }}>
              👤
            </div>
            <span style={{ fontSize:"10px", fontWeight:600, color: t.textMuted }}>
              ID: {c.user_id}
            </span>
          </div>

          {/* Status badge */}
          <div style={{
            display:"flex", alignItems:"center", gap:"5px",
            padding:"4px 10px", borderRadius:"20px",
            background: status.bg, border:`1px solid ${status.border}`,
          }}>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background: status.dot, animation:"sc-breathe 2s ease-in-out infinite" }} />
            <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color: status.text }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Training name */}
        <h2 style={{
          fontFamily:"'Bebas Neue',cursive",
          fontSize:"20px", letterSpacing:".03em", lineHeight:1.1,
          color: t.text,
          marginBottom:"12px",
        }}>
          {c.training_name || "Eğitim adı yok"}
        </h2>

        {/* Score + Date */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px", flexWrap:"wrap" }}>
          {c.score && (
            <div style={{
              padding:"4px 10px", borderRadius:"20px",
              background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)",
            }}>
              <span style={{ fontSize:"10px", fontWeight:700, color:"#3B82F6" }}>⭐ {c.score}</span>
            </div>
          )}
          <div style={{
            padding:"4px 10px", borderRadius:"20px",
            background: t.surfaceHigh, border:`1px solid ${t.border}`,
          }}>
            <span style={{ fontSize:"10px", fontWeight:600, color: t.textMuted }}>📅 {date}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:"1px", background: t.border, marginBottom:"14px" }} />

        {/* View button */}
        <button
          type="button"
          onClick={() => window.open(`/kullanici/certificate-view?id=${c.id}`, "_blank")}
          style={{
            width:"100%", padding:"11px", borderRadius:"12px",
            border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,#E61A21,#ff4d52)",
            color:"#fff",
            fontFamily:"'Outfit',sans-serif", fontWeight:800,
            fontSize:"11px", letterSpacing:"0.14em", textTransform:"uppercase",
            boxShadow:"0 4px 16px rgba(230,26,33,0.3)",
            transition:"all .22s cubic-bezier(.34,1.2,.64,1)",
            marginBottom:"8px",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 7px 22px rgba(230,26,33,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 16px rgba(230,26,33,0.3)"; }}
        >
          Sertifikayı Gör
        </button>

        {/* Approve / Reject */}
        <div style={{ display:"flex", gap:"7px" }}>
          <button
            className="sc-action-btn"
            style={{ background:"rgba(16,185,129,0.1)", color:"#10B981", border:"1px solid rgba(16,185,129,0.22)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background="#10B981"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="rgba(16,185,129,0.1)"; e.currentTarget.style.color="#10B981"; }}
            onClick={async () => {
              await fetch("/api/certificates/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: c.id, status: "approved" }),
              });
              location.reload();
            }}
          >
            ✓ Onayla
          </button>

          <button
            className="sc-action-btn"
            style={{ background:"rgba(230,26,33,0.08)", color:"#E61A21", border:"1px solid rgba(230,26,33,0.22)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background="#E61A21"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background="rgba(230,26,33,0.08)"; e.currentTarget.style.color="#E61A21"; }}
            onClick={async () => {
              await fetch("/api/certificates/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: c.id, status: "rejected" }),
              });
              location.reload();
            }}
          >
            ✕ Reddet
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE  —  ALL LOGIC UNCHANGED
───────────────────────────────────────────────────────────────────────────── */
export default function YoneticiSertifikalar() {
  /* ── ALL STATE UNCHANGED ── */
  const [certs,        setCerts]        = useState([]);
  const [search,       setSearch]       = useState("");
  const [levelFilter,  setLevelFilter]  = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchData(); }, []);

  /* ── ALL LOGIC UNCHANGED ── */
  async function fetchData() {
    const res  = await fetch("/api/certificates/list-all");
    const json = await res.json();
    if (json.ok) setCerts(json.certificates || []);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return certs.filter((c) => {
      const matchesSearch =
        String(c.user_id      || "").toLowerCase().includes(q) ||
        String(c.training_name|| "").toLowerCase().includes(q) ||
        String(c.level        || "").toLowerCase().includes(q);
      const matchesLevel  = levelFilter  === "all" || c.level  === levelFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [certs, search, levelFilter, statusFilter]);

  const total = certs.length;
  const altin = certs.filter((c) => c.level === "ALTIN SEVİYE").length;
  const approved = certs.filter((c) => c.status === "approved").length;
  const pending  = certs.filter((c) => c.status === "unlocked").length;

  /* ── RENDER ── */
  return (
    <>
      <style>{STYLES}</style>

      <YoneticiLayout
        pageTitle="Sertifikalar"
        pageSubtitle="Tüm kullanıcı sertifikalarını izle ve yönet"
      >
        {({ isDark }) => {
          const t = tk(isDark);

          const selectStyle = {
            background: t.inputBg,
            border: `1px solid ${t.border}`,
            color: t.text,
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            padding: "10px 16px",
            borderRadius: "12px",
            outline: "none",
            cursor: "pointer",
            transition: "border-color .2s ease",
            appearance: "none",
            WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}' /%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
            paddingRight: "34px",
          };

          return (
            <div className="sc-root" style={{ paddingBottom: "48px" }}>

              {/* ── Ambient orbs ── */}
              <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
                <div style={{ position:"absolute", top:"8%",  left:"18%",  width:"380px", height:"380px", borderRadius:"50%", background:"rgba(230,26,33,0.04)",  filter:"blur(110px)" }} />
                <div style={{ position:"absolute", bottom:"5%",right:"8%",  width:"320px", height:"320px", borderRadius:"50%", background:"rgba(245,158,11,0.03)", filter:"blur(90px)"  }} />
              </div>

              <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:"18px" }}>

                {/* ════════════════════════════════════════════════════════════
                    HERO
                ════════════════════════════════════════════════════════════ */}
                <motion.section
                  className="sc-fu"
                  style={{
                    position:"relative", overflow:"hidden",
                    borderRadius:"22px",
                    padding:"26px 30px",
                    background: t.surface,
                    border:`1px solid ${t.border}`,
                    boxShadow: t.shadowSm,
                  }}
                >
                  {/* Top accent */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#E61A21 40%,transparent)" }} />
                  {/* Dot grid */}
                  <div style={{ position:"absolute", inset:0, opacity:.04, backgroundImage:"radial-gradient(circle,#E61A21 1px,transparent 0)", backgroundSize:"22px 22px", pointerEvents:"none", borderRadius:"22px" }} />
                  {/* Glow orb */}
                  <div style={{ position:"absolute", top:"-50px", right:"-50px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(230,26,33,0.07)", filter:"blur(70px)", pointerEvents:"none" }} />

                  <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"22px" }}>

                    {/* Left */}
                    <div style={{ flex:"1 1 280px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"10px" }}>
                        <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#E61A21", boxShadow:"0 0 7px rgba(230,26,33,0.8)", animation:"sc-breathe 2.5s ease-in-out infinite" }} />
                        <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.38em", textTransform:"uppercase", color:"#E61A21" }}>
                          SPORTHINK · YÖNETİCİ SERTİFİKA MERKEZİ
                        </span>
                      </div>

                      <div style={{ position:"relative", display:"inline-block", marginBottom:"10px" }}>
                        <h1 style={{
                          fontFamily:"'Bebas Neue',cursive",
                          fontSize:"clamp(38px,5vw,60px)",
                          lineHeight:.93, letterSpacing:".02em",
                          color: t.text, margin:0,
                        }}>
                          Sertifika Yönetimi
                        </h1>
                        <div style={{ position:"absolute", bottom:"-3px", left:0, height:"2px", width:"44%", borderRadius:"2px", background:"linear-gradient(90deg,#E61A21,transparent)" }} />
                      </div>

                      <p style={{ fontSize:"12px", fontWeight:400, color:t.textMuted, maxWidth:"400px", lineHeight:1.65 }}>
                        Kullanıcıların kazandığı tüm sertifikaları görüntüle, onayla veya reddet.
                      </p>
                    </div>

                    {/* Right: stat chips */}
                    <div style={{ display:"flex", gap:"9px", flexWrap:"wrap", flexShrink:0 }}>
                      {[
                        { label:"Toplam",  value: total,    color:"#3B82F6" },
                        { label:"Onaylı",  value: approved, color:"#10B981" },
                        { label:"Altın",   value: altin,    color:"#F59E0B" },
                        { label:"Bekleyen",value: pending,  color:"#E61A21" },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="sc-stat"
                          style={{
                            padding:"11px 16px", borderRadius:"14px",
                            background: t.surfaceHigh,
                            border:`1px solid ${t.border}`,
                            minWidth:"76px", textAlign:"center",
                          }}
                        >
                          <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:t.textFaint, marginBottom:"5px" }}>{label}</p>
                          <p style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"30px", lineHeight:1, color }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* ════════════════════════════════════════════════════════════
                    FILTER BAR
                ════════════════════════════════════════════════════════════ */}
                <motion.div
                  className="sc-fu sc-d1"
                  style={{
                    borderRadius:"18px", padding:"13px 16px",
                    background: t.surface, border:`1px solid ${t.border}`,
                    display:"flex", flexWrap:"wrap", gap:"10px", alignItems:"center",
                  }}
                >
                  {/* Search */}
                  <div style={{ position:"relative", flex:"1 1 200px" }}>
                    <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", opacity:.3 }}>🔍</span>
                    <input
                      className="sc-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Kullanıcı, eğitim veya seviye ara..."
                      style={{
                        background: t.inputBg,
                        border: `1px solid ${t.border}`,
                        color: t.text,
                        paddingLeft: "36px",
                      }}
                    />
                  </div>

                  {/* Level filter */}
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    style={{ ...selectStyle, flex:"0 1 180px" }}
                  >
                    <option value="all">Tüm Seviyeler</option>
                    <option value="ALTIN SEVİYE">🏆 Altın Seviye</option>
                    <option value="GÜMÜŞ SEVİYE">🥈 Gümüş Seviye</option>
                    <option value="BRONZ SEVİYE">🥉 Bronz Seviye</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ ...selectStyle, flex:"0 1 180px" }}
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="approved">✓ Onaylı</option>
                    <option value="rejected">✕ Reddedildi</option>
                    <option value="unlocked">◎ Beklemede</option>
                  </select>

                  {/* Result count chip */}
                  <div style={{
                    padding:"9px 14px", borderRadius:"10px",
                    background: t.surfaceHigh, border:`1px solid ${t.border}`,
                    flexShrink:0,
                  }}>
                    <span style={{ fontSize:"10px", fontWeight:700, color:t.textMuted, letterSpacing:"0.12em" }}>
                      {filtered.length} <span style={{ color:"#E61A21" }}>/ {total}</span>
                    </span>
                  </div>
                </motion.div>

                {/* ════════════════════════════════════════════════════════════
                    CERTIFICATE GRID
                ════════════════════════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                  {filtered.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity:0, y:14 }}
                      animate={{ opacity:1, y:0 }}
                      exit={{ opacity:0 }}
                      style={{
                        borderRadius:"20px", padding:"64px 24px",
                        background: t.surface, border:`1px solid ${t.border}`,
                        textAlign:"center",
                      }}
                    >
                      <div className="sc-float" style={{ fontSize:"52px", marginBottom:"16px" }}>📜</div>
                      <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"26px", letterSpacing:".04em", color:t.text, marginBottom:"8px" }}>
                        Sertifika Bulunamadı
                      </h3>
                      <p style={{ fontSize:"12px", fontWeight:500, color:t.textMuted }}>
                        Arama veya filtreleri değiştirerek tekrar deneyin.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="grid"
                      className="sc-fu sc-d2"
                      style={{
                        display:"grid",
                        gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",
                        gap:"14px",
                      }}
                    >
                      {filtered.map((c, idx) => (
                        <CertCard
                          key={c.id}
                          c={c}
                          isDark={isDark}
                          idx={idx}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          );
        }}
      </YoneticiLayout>
    </>
  );
}