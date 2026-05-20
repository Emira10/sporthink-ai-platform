import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS  — UNCHANGED
───────────────────────────────────────────────────────────────────────────── */
const roleMeta = {
  1: {
    name: "Kullanıcı",
    icon: "👤",
    color: "blue",
    desc: "Eğitimleri görüntüler, ilerlemesini takip eder ve sınavlara katılır.",
  },
  2: {
    name: "Eğitmen",
    icon: "🎓",
    color: "purple",
    desc: "Eğitim içerikleri oluşturur, quiz ekler ve öğrenci gelişimini takip eder.",
  },
  3: {
    name: "Yönetici",
    icon: "👑",
    color: "red",
    desc: "Tüm sistemi, kullanıcıları, rolleri ve yetkileri yönetir.",
  },
};

const defaultPermissions = [];

function roleName(id) { return roleMeta[id]?.name || "Bilinmeyen"; }
function roleIcon(id)  { return roleMeta[id]?.icon || "🔐"; }

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────────── */
function tk(isDark) {
  return {
    text:       isDark ? "#FFFFFF"                     : "#0A0A0A",
    textMuted:  isDark ? "rgba(255,255,255,0.38)"      : "rgba(0,0,0,0.42)",
    textFaint:  isDark ? "rgba(255,255,255,0.18)"      : "rgba(0,0,0,0.2)",
    surface:    isDark ? "rgba(255,255,255,0.032)"     : "rgba(255,255,255,0.92)",
    surfaceHigh:isDark ? "rgba(255,255,255,0.055)"     : "rgba(255,255,255,1)",
    border:     isDark ? "rgba(255,255,255,0.07)"      : "rgba(0,0,0,0.08)",
    borderEm:   isDark ? "rgba(255,255,255,0.12)"      : "rgba(0,0,0,0.13)",
    inputBg:    isDark ? "rgba(0,0,0,0.25)"            : "#FFFFFF",
    theadBg:    isDark ? "rgba(255,255,255,0.04)"      : "rgba(0,0,0,0.025)",
    rowHov:     isDark ? "rgba(230,26,33,0.04)"        : "rgba(230,26,33,0.03)",
    shadow:     isDark ? "0 20px 60px rgba(0,0,0,0.55)" : "0 8px 40px rgba(0,0,0,0.09)",
    shadowSm:   isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 2px 16px rgba(0,0,0,0.07)",
    red:        "#E61A21",
    redGlow:    "rgba(230,26,33,0.22)",
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .ry-root { font-family: 'Outfit', sans-serif; }

  /* ── Entry animations ── */
  @keyframes ry-fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ry-fu  { animation: ry-fade-up .48s cubic-bezier(.22,1,.36,1) both; }
  .ry-d1  { animation-delay:.06s; }
  .ry-d2  { animation-delay:.12s; }
  .ry-d3  { animation-delay:.18s; }
  .ry-d4  { animation-delay:.24s; }
  .ry-d5  { animation-delay:.30s; }

  /* ── Breathe ── */
  @keyframes ry-breathe { 0%,100%{opacity:1} 50%{opacity:.4} }

  /* ── Rotate ── */
  @keyframes ry-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

  /* ── Toggle slide ── */
  @keyframes ry-ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(1.8);opacity:0} }

  /* ── Role card shimmer on hover ── */
  .ry-role-card { transition: transform .25s cubic-bezier(.34,1.2,.64,1), box-shadow .25s ease, border-color .2s ease; cursor:pointer; }
  .ry-role-card:hover { transform: translateY(-4px) scale(1.015); }

  /* ── Tab button ── */
  .ry-tab {
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 10px; font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all .22s cubic-bezier(.34,1.2,.64,1);
    font-family: 'Outfit', sans-serif;
    white-space: nowrap;
  }

  /* ── Toggle switch ── */
  .ry-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 52px; height: 28px;
    border-radius: 14px;
    border: none; cursor: pointer;
    transition: background .25s ease;
    flex-shrink: 0;
  }
  .ry-toggle-thumb {
    position: absolute;
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: left .25s cubic-bezier(.34,1.2,.64,1);
    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  }
  .ry-toggle-ping {
    position: absolute; inset: 0;
    border-radius: 14px;
    border: 2px solid rgba(255,255,255,0.6);
    animation: ry-ping .6s ease forwards;
  }

  /* ── Permission row ── */
  .ry-perm-row { transition: background .15s ease; }

  /* ── Scrollbar ── */
  .ry-scroll::-webkit-scrollbar { width:3px; height:3px; }
  .ry-scroll::-webkit-scrollbar-track { background:transparent; }
  .ry-scroll::-webkit-scrollbar-thumb { background:rgba(230,26,33,0.3); border-radius:2px; }

  /* ── Progress bar track ── */
  .ry-track {
    height: 5px; border-radius: 3px;
    overflow: hidden;
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function RollerPage() {
  /* ── ALL STATE & LOGIC UNCHANGED ── */
  const [users,       setUsers]       = useState([]);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [selectedRole,setSelectedRole]= useState(3);
  const [loading,     setLoading]     = useState(true);
  const [savingKey,   setSavingKey]   = useState(null);
  const [toast,       setToast]       = useState(null);
  const [aiOpen,      setAiOpen]      = useState(true);
  const [activeTab,   setActiveTab]   = useState("access");

  useEffect(() => { fetchAllData(); }, []);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchAllData() {
    setLoading(true);
    try {
      const res  = await fetch("/api/yonetici/rol-yetki");
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setUsers(json.users || []);
      setPermissions(json.permissions || []);
    } catch (e) {
      console.error("Rol & Yetki API hatası:", e);
      showToast("Veriler alınamadı: " + e.message, "err");
    } finally {
      setLoading(false);
    }
  }

  const roleStats = useMemo(() => ({
    1: users.filter((u) => Number(u.tur_id) === 1).length,
    2: users.filter((u) => Number(u.tur_id) === 2).length,
    3: users.filter((u) => Number(u.tur_id) === 3).length,
  }), [users]);

  const totalUsers       = users.length;
  const adminCount       = roleStats[3];
  const instructorCount  = roleStats[2];

  async function togglePermission(permissionKey, roleId) {
    const permission = permissions.find((p) => p.key === permissionKey);
    if (!permission) return;
    const hasRole = permission.roles.includes(roleId);
    setSavingKey(`${permissionKey}-${roleId}`);
    try {
      const res  = await fetch("/api/yonetici/rol-yetki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission_id: permission.id,
          role_id:       roleId,
          action:        hasRole ? "remove" : "add",
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      setPermissions((prev) =>
        prev.map((p) =>
          p.key === permissionKey
            ? { ...p, roles: hasRole ? p.roles.filter((r) => r !== roleId) : [...p.roles, roleId] }
            : p
        )
      );
      showToast(hasRole ? "Yetki kaldırıldı ✓" : "Yetki eklendi ✓");
    } catch (e) {
      console.error("Yetki güncelleme API hatası:", e);
      showToast("Yetki kaydedilemedi: " + e.message, "err");
    } finally {
      setSavingKey(null);
    }
  }

  const aiSuggestion =
    adminCount === 0       ? "Sistemde hiç yönetici yok. Güvenli yönetim için en az 1 yönetici atanmalı."
    : instructorCount === 0 ? "Sistemde eğitmen görünmüyor. Eğitim içerikleri için en az 1 eğitmen eklenmeli."
    : "Rol dağılımı dengeli görünüyor. Yetki matrisi düzenli şekilde kullanılabilir.";

  /* ── TABS CONFIG ── */
  const TABS = [
    { key: "access",   label: "Access Control" },
    { key: "database", label: "Canlı Dağılım"  },
  ];

  /* ───────────────────────────────── RENDER ───────────────────────────────── */
  return (
    <>
      <style>{STYLES}</style>

      <YoneticiLayout pageTitle="Rol & Yetki" pageSubtitle="Sistem erişim ve yetki kontrolü">
        {({ isDark }) => {
          const t = tk(isDark);

          /* role accent map */
          const roleAccent = {
            1: { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.22)",  text: "#3B82F6" },
            2: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.22)", text: "#8B5CF6" },
            3: { bg: "rgba(230,26,33,0.1)",  border: "rgba(230,26,33,0.22)",  text: "#E61A21" },
          };

          return (
            <div className="ry-root" style={{ paddingBottom: "48px" }}>

              {/* ── Ambient orbs ── */}
              <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
                <div style={{ position:"absolute", top:"8%",  left:"22%",  width:"420px", height:"420px", borderRadius:"50%", background:"rgba(230,26,33,0.04)",  filter:"blur(110px)" }} />
                <div style={{ position:"absolute", bottom:"8%", right:"6%", width:"360px", height:"360px", borderRadius:"50%", background:"rgba(59,130,246,0.03)", filter:"blur(90px)"  }} />
              </div>

              <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:"18px" }}>

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
                        position:"fixed", top:"22px", right:"22px", zIndex:200,
                        padding:"12px 20px", borderRadius:"14px",
                        fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"13px",
                        background: toast.type === "ok" ? "rgba(16,185,129,0.92)" : "rgba(239,68,68,0.92)",
                        color:"#fff",
                        border: `1px solid ${toast.type === "ok" ? "rgba(16,185,129,0.6)" : "rgba(239,68,68,0.6)"}`,
                        boxShadow:"0 8px 30px rgba(0,0,0,0.3)",
                        backdropFilter:"blur(16px)",
                      }}
                    >
                      {toast.msg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ════════════════════════════════════════════════════════════
                    HERO  —  compact, refined
                ════════════════════════════════════════════════════════════ */}
                <motion.section
                  className="ry-fu"
                  style={{
                    position:"relative", overflow:"hidden",
                    borderRadius:"22px",
                    padding:"26px 30px",
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    boxShadow: t.shadowSm,
                  }}
                >
                  {/* Top accent */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#E61A21 40%,transparent)" }} />
                  {/* Dot grid subtle */}
                  <div style={{ position:"absolute", inset:0, opacity:0.045, backgroundImage:"radial-gradient(circle,#E61A21 1px,transparent 0)", backgroundSize:"22px 22px", pointerEvents:"none", borderRadius:"22px" }} />
                  {/* Glow orb */}
                  <div style={{ position:"absolute", top:"-50px", right:"-50px", width:"220px", height:"220px", borderRadius:"50%", background:"rgba(230,26,33,0.07)", filter:"blur(70px)", pointerEvents:"none" }} />

                  <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"20px" }}>

                    {/* Left: label + title + subtitle */}
                    <div style={{ flex:"1 1 300px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"10px" }}>
                        <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#E61A21", boxShadow:"0 0 7px rgba(230,26,33,0.8)", animation:"ry-breathe 2.5s ease-in-out infinite" }} />
                        <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.38em", textTransform:"uppercase", color:"#E61A21" }}>
                          SPORTHINK · SECURITY CENTER
                        </span>
                      </div>

                      {/* Title — matches Dashboard scale */}
                      <div style={{ position:"relative", display:"inline-block", marginBottom:"10px" }}>
                        <h1 style={{
                          fontFamily:"'Bebas Neue',cursive",
                          fontSize:"clamp(38px,5vw,60px)",
                          lineHeight:.93, letterSpacing:".02em",
                          color: t.text, margin:0,
                        }}>
                          Rol &amp; Yetki
                        </h1>
                        <div style={{ position:"absolute", bottom:"-3px", left:0, height:"2px", width:"44%", borderRadius:"2px", background:"linear-gradient(90deg,#E61A21,transparent)" }} />
                      </div>

                      <p style={{ fontSize:"12px", fontWeight:400, color: t.textMuted, maxWidth:"440px", lineHeight:1.65 }}>
                        Kullanıcıların sistem içindeki erişim seviyelerini yönetin. Kimlerin eğitim oluşturabileceğini, kullanıcıları düzenleyebileceğini ve sistem ayarlarına ulaşabileceğini buradan kontrol edin.
                      </p>
                    </div>

                    {/* Right: stat chips */}
                    <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", flexShrink:0 }}>
                      {[
                        { label:"Toplam", value: loading ? "—" : totalUsers,      color:"#3B82F6" },
                        { label:"Admin",  value: loading ? "—" : adminCount,       color:"#E61A21" },
                        { label:"Eğitmen",value: loading ? "—" : instructorCount,  color:"#8B5CF6" },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{
                          padding:"12px 18px", borderRadius:"14px",
                          background: t.surfaceHigh,
                          border: `1px solid ${t.border}`,
                          minWidth:"88px", textAlign:"center",
                        }}>
                          <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color: t.textFaint, marginBottom:"5px" }}>{label}</p>
                          <p style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"32px", lineHeight:1, color }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tab bar */}
                  <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", gap:"7px", marginTop:"18px" }}>
                    {TABS.map(({ key, label }) => {
                      const active = activeTab === key;
                      return (
                        <button
                          key={key}
                          className="ry-tab"
                          onClick={() => setActiveTab(key)}
                          style={{
                            background: active ? "#E61A21" : `rgba(230,26,33,0.08)`,
                            color:       active ? "#fff"    : "#E61A21",
                            borderColor: active ? "#E61A21" : `rgba(230,26,33,0.2)`,
                            boxShadow:   active ? "0 4px 14px rgba(230,26,33,0.3)" : "none",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </motion.section>

                {/* ════════════════════════════════════════════════════════════
                    TAB: ROLE CARDS  (matrix)
                ════════════════════════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                  {activeTab === "matrix" && (
                    <motion.section
                      key="matrix"
                      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                      transition={{ duration:.3, ease:[.22,1,.36,1] }}
                      style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"14px" }}
                    >
                      {[1, 2, 3].map((roleId) => {
                        const active = selectedRole === roleId;
                        const meta   = roleMeta[roleId];
                        const acc    = roleAccent[roleId];
                        return (
                          <motion.button
                            key={roleId}
                            className="ry-role-card"
                            whileTap={{ scale:.97 }}
                            onClick={() => setSelectedRole(roleId)}
                            style={{
                              textAlign:"left",
                              position:"relative", overflow:"hidden",
                              borderRadius:"18px",
                              padding:"20px 22px",
                              border: active ? `1px solid ${acc.text}` : `1px solid ${t.border}`,
                              background: active
                                ? `linear-gradient(145deg, ${acc.bg.replace("0.1","0.18")}, ${acc.bg.replace("0.1","0.06")})`
                                : t.surface,
                              boxShadow: active ? `0 6px 24px ${acc.text}20` : t.shadowSm,
                              cursor:"pointer",
                            }}
                          >
                            {/* Active top bar */}
                            {active && (
                              <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,transparent,${acc.text},transparent)` }} />
                            )}

                            <div style={{ position:"relative", zIndex:1 }}>
                              {/* Icon chip */}
                              <div style={{
                                width:"38px", height:"38px", borderRadius:"11px",
                                background: acc.bg, border:`1px solid ${acc.border}`,
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:"17px", marginBottom:"14px",
                              }}>
                                {meta.icon}
                              </div>

                              <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color: active ? acc.text : t.textFaint, marginBottom:"4px" }}>
                                Role Type
                              </p>
                              <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"24px", letterSpacing:".03em", color: active ? acc.text : t.text, marginBottom:"8px" }}>
                                {meta.name}
                              </h3>
                              <p style={{ fontSize:"11px", fontWeight:400, color: t.textMuted, lineHeight:1.6 }}>
                                {meta.desc}
                              </p>

                              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"16px", paddingTop:"14px", borderTop:`1px solid ${t.border}` }}>
                                <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color: t.textFaint }}>Kullanıcı</span>
                                <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", lineHeight:1, color: active ? acc.text : t.text }}>
                                  {loading ? "—" : roleStats[roleId]}
                                </span>
                              </div>
                            </div>

                            {/* bg glow orb */}
                            <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"80px", height:"80px", borderRadius:"50%", background: acc.text, opacity:.06, filter:"blur(20px)", pointerEvents:"none" }} />
                          </motion.button>
                        );
                      })}
                    </motion.section>
                  )}

                  {/* ════════════════════════════════════════════════════════
                      TAB: ACCESS CONTROL  (permission matrix)
                  ════════════════════════════════════════════════════════ */}
                  {activeTab === "access" && (
                    <motion.section
                      key="access"
                      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                      transition={{ duration:.3, ease:[.22,1,.36,1] }}
                      style={{
                        borderRadius:"20px", overflow:"hidden",
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        boxShadow: t.shadowSm,
                      }}
                    >
                      {/* Section header */}
                      <div style={{
                        padding:"18px 24px",
                        borderBottom:`1px solid ${t.border}`,
                        display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"14px",
                      }}>
                        <div>
                          <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:"#E61A21", marginBottom:"4px" }}>Permission Matrix</p>
                          <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:".04em", color: t.text, marginBottom:"4px" }}>
                            Yetki Kontrol Tablosu
                          </h2>
                          <p style={{ fontSize:"11px", fontWeight:400, color: t.textMuted }}>
                            Roller için erişim yetkilerini aktif / pasif hale getirebilirsiniz.
                          </p>
                        </div>

                        {/* Selected role chip */}
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color: t.textFaint }}>Seçili Rol:</span>
                          <span style={{
                            padding:"6px 14px", borderRadius:"20px",
                            background: roleAccent[selectedRole].bg,
                            border: `1px solid ${roleAccent[selectedRole].border}`,
                            color: roleAccent[selectedRole].text,
                            fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"12px",
                            letterSpacing:"0.04em",
                          }}>
                            {roleIcon(selectedRole)} {roleName(selectedRole)}
                          </span>
                        </div>
                      </div>

                      {/* Role selector strip */}
                      <div style={{
                        padding:"12px 24px",
                        borderBottom:`1px solid ${t.border}`,
                        display:"flex", gap:"8px", flexWrap:"wrap",
                      }}>
                        {[1,2,3].map((rid) => {
                          const acc = roleAccent[rid];
                          const sel = selectedRole === rid;
                          return (
                            <button
                              key={rid}
                              onClick={() => setSelectedRole(rid)}
                              style={{
                                padding:"6px 14px", borderRadius:"20px",
                                border:`1px solid ${sel ? acc.text : t.border}`,
                                background: sel ? acc.bg : "transparent",
                                color: sel ? acc.text : t.textMuted,
                                fontFamily:"'Outfit',sans-serif", fontWeight:700,
                                fontSize:"11px", cursor:"pointer",
                                transition:"all .2s cubic-bezier(.34,1.2,.64,1)",
                              }}
                            >
                              {roleIcon(rid)} {roleName(rid)}
                            </button>
                          );
                        })}
                      </div>

                      {/* Table */}
                      <div className="ry-scroll" style={{ overflowX:"auto" }}>
                        {permissions.length === 0 ? (
                          <div style={{ padding:"48px 24px", textAlign:"center" }}>
                            <p style={{ fontSize:"28px", marginBottom:"10px" }}>🔐</p>
                            <p style={{ fontSize:"13px", fontWeight:600, color: t.textMuted }}>
                              {loading ? "Veriler yükleniyor..." : "Henüz yetki tanımlanmamış."}
                            </p>
                          </div>
                        ) : (
                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                              <tr style={{ background: t.theadBg, borderBottom:`1px solid ${t.border}` }}>
                                {["Yetki", "👤 Kullanıcı", "🎓 Eğitmen", "👑 Yönetici"].map((h, i) => (
                                  <th key={i} style={{
                                    padding: i===0 ? "11px 22px" : "11px 18px",
                                    textAlign: i===0 ? "left" : "center",
                                    fontSize:"9px", fontWeight:700, letterSpacing:"0.2em",
                                    textTransform:"uppercase", color: t.textFaint,
                                    whiteSpace:"nowrap",
                                  }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {permissions.map((permission, idx) => (
                                <motion.tr
                                  key={permission.key}
                                  className="ry-perm-row"
                                  initial={{ opacity:0, y:6 }}
                                  animate={{ opacity:1, y:0 }}
                                  transition={{ delay: idx * 0.04 }}
                                  style={{ borderBottom:`1px solid ${t.border}` }}
                                >
                                  {/* Label */}
                                  <td style={{ padding:"13px 22px" }}>
                                    <p style={{ fontSize:"13px", fontWeight:700, color: t.text, marginBottom:"3px" }}>{permission.label}</p>
                                    <p style={{ fontSize:"10px", fontWeight:500, color: t.textFaint, fontFamily:"monospace" }}>{permission.key}</p>
                                  </td>

                                  {/* Toggles */}
                                  {[1, 2, 3].map((roleId) => {
                                    const active  = permission.roles.includes(roleId);
                                    const saving  = savingKey === `${permission.key}-${roleId}`;
                                    const acc     = roleAccent[roleId];

                                    return (
                                      <td key={roleId} style={{ padding:"13px 18px", textAlign:"center" }}>
                                        <button
                                          className="ry-toggle"
                                          onClick={() => togglePermission(permission.key, roleId)}
                                          style={{ background: active ? acc.text : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)" }}
                                        >
                                          <div
                                            className="ry-toggle-thumb"
                                            style={{ left: active ? "28px" : "4px" }}
                                          />
                                          {saving && <div className="ry-toggle-ping" />}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </motion.section>
                  )}

                  {/* ════════════════════════════════════════════════════════
                      TAB: DATABASE  (live role distribution)
                  ════════════════════════════════════════════════════════ */}
                  {activeTab === "database" && (
                    <motion.section
                      key="database"
                      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                      transition={{ duration:.3, ease:[.22,1,.36,1] }}
                      style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"14px" }}
                    >
                      {/* Live distribution card */}
                      <div style={{
                        borderRadius:"20px", padding:"22px 24px",
                        background: t.surface, border:`1px solid ${t.border}`,
                        boxShadow: t.shadowSm,
                      }}>
                        <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:"#E61A21", marginBottom:"4px" }}>Real Database</p>
                        <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:".04em", color: t.text, marginBottom:"20px" }}>Canlı Rol Dağılımı</h3>

                        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                          {[1,2,3].map((roleId) => {
                            const count = roleStats[roleId];
                            const pct   = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
                            const acc   = roleAccent[roleId];

                            return (
                              <div key={roleId}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"7px" }}>
                                  <span style={{ fontSize:"12px", fontWeight:700, color: t.text }}>
                                    {roleIcon(roleId)} {roleName(roleId)}
                                  </span>
                                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                    <span style={{ fontSize:"11px", fontWeight:600, color: t.textMuted }}>{count} kullanıcı</span>
                                    <span style={{ fontSize:"11px", fontWeight:700, color: acc.text }}>%{pct}</span>
                                  </div>
                                </div>
                                <div className="ry-track" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }}>
                                  <motion.div
                                    initial={{ width:0 }}
                                    animate={{ width:`${pct}%` }}
                                    transition={{ duration:1, ease:"easeOut" }}
                                    style={{ height:"100%", borderRadius:"3px", background:`linear-gradient(90deg, ${acc.text}99, ${acc.text})` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected role permissions card */}
                      <div style={{
                        borderRadius:"20px", padding:"22px 24px",
                        background: t.surface, border:`1px solid ${t.border}`,
                        boxShadow: t.shadowSm,
                      }}>
                        <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:"#E61A21", marginBottom:"4px" }}>Selected Role</p>
                        <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:".04em", color: t.text, marginBottom:"16px" }}>
                          {roleIcon(selectedRole)} {roleName(selectedRole)} Yetkileri
                        </h3>

                        {/* Role selector */}
                        <div style={{ display:"flex", gap:"6px", marginBottom:"16px", flexWrap:"wrap" }}>
                          {[1,2,3].map((rid) => {
                            const acc = roleAccent[rid];
                            const sel = selectedRole === rid;
                            return (
                              <button
                                key={rid}
                                onClick={() => setSelectedRole(rid)}
                                style={{
                                  padding:"5px 12px", borderRadius:"20px",
                                  border:`1px solid ${sel ? acc.text : t.border}`,
                                  background: sel ? acc.bg : "transparent",
                                  color: sel ? acc.text : t.textMuted,
                                  fontFamily:"'Outfit',sans-serif", fontWeight:700,
                                  fontSize:"10px", cursor:"pointer",
                                  transition:"all .2s ease",
                                }}
                              >
                                {roleIcon(rid)} {roleName(rid)}
                              </button>
                            );
                          })}
                        </div>

                        <div className="ry-scroll" style={{ display:"flex", flexDirection:"column", gap:"7px", maxHeight:"260px", overflowY:"auto" }}>
                          {permissions.filter((p) => p.roles.includes(selectedRole)).map((p) => (
                            <div
                              key={p.key}
                              style={{
                                padding:"10px 13px", borderRadius:"12px",
                                background:"rgba(16,185,129,0.07)", border:"1px solid rgba(16,185,129,0.18)",
                                display:"flex", alignItems:"center", gap:"8px",
                              }}
                            >
                              <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#10B981", flexShrink:0 }} />
                              <p style={{ fontSize:"12px", fontWeight:600, color: t.text }}>{p.label}</p>
                            </div>
                          ))}

                          {permissions.filter((p) => p.roles.includes(selectedRole)).length === 0 && (
                            <div style={{
                              padding:"10px 13px", borderRadius:"12px",
                              background:"rgba(230,26,33,0.07)", border:"1px solid rgba(230,26,33,0.18)",
                            }}>
                              <p style={{ fontSize:"12px", fontWeight:600, color:"#E61A21" }}>Bu rol için aktif yetki bulunmuyor.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.section>
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