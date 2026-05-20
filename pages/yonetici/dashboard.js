import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";
import {
  Users, BookOpen, Bookmark, AlertCircle,
  Award, Brain, Zap, Clock, Trophy,
  ChevronRight, Activity, PieChart, X,
  TrendingUp, Shield, Star
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .db-root * { box-sizing: border-box; }
  .db-root { font-family: 'Outfit', sans-serif; }

  @keyframes db-breathe  { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes db-spin     { to{transform:rotate(360deg)} }
  @keyframes db-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes db-pulse-r  { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.2);opacity:0} }
  @keyframes db-scan     { 0%{top:0%;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }
  @keyframes db-grid     { 0%{transform:translateY(0)} 100%{transform:translateY(44px)} }
  @keyframes db-shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes db-fill-bar { from{width:0%} to{width:var(--w)} }
  @keyframes db-count-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes db-glow-pulse{ 0%,100%{box-shadow:0 0 20px rgba(230,26,33,0.15)} 50%{box-shadow:0 0 40px rgba(230,26,33,0.35)} }
  @keyframes db-particle  { 0%{transform:translateY(0) scale(1);opacity:.8} 100%{transform:translateY(-100px) translateX(var(--dx)) scale(0);opacity:0} }
  @keyframes db-wave      { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
  @keyframes db-slide-up  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes db-badge-in  { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }

  .db-grid-bg {
    background-image:
      linear-gradient(rgba(230,26,33,0.05) 1px,transparent 1px),
      linear-gradient(90deg,rgba(230,26,33,0.05) 1px,transparent 1px);
    background-size: 44px 44px;
    animation: db-grid 5s linear infinite;
  }
  .db-shimmer-text {
    background: linear-gradient(90deg,#E61A21 0%,#ff6b6b 30%,#fff 50%,#ff6b6b 70%,#E61A21 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: db-shimmer 3s linear infinite;
  }
  .db-card-hover { transition: transform .28s cubic-bezier(.34,1.2,.64,1), box-shadow .25s ease, border-color .25s ease; }
  .db-card-hover:hover { transform: translateY(-4px); }

  .db-scroll::-webkit-scrollbar { width:3px; height:3px; }
  .db-scroll::-webkit-scrollbar-track { background:transparent; }
  .db-scroll::-webkit-scrollbar-thumb { background:rgba(230,26,33,0.35); border-radius:2px; }

  .db-row-hover { transition: background .15s ease, border-color .15s ease; }
  .db-row-hover:hover { background: rgba(230,26,33,0.04) !important; border-color: rgba(230,26,33,0.2) !important; }

  .db-stat-btn { transition: all .22s cubic-bezier(.34,1.2,.64,1); }
  .db-stat-btn:hover { transform: translateY(-3px) scale(1.02); }
  .db-stat-btn:active { transform: scale(.97); }
`;

/* ═══════════════════════════════════════════════════════════════════
   COLOR TOKENS
═══════════════════════════════════════════════════════════════════ */
function tk(isDark) {
  return {
    bg:         isDark ? "#060608"                    : "#EEF0F6",
    surface:    isDark ? "rgba(255,255,255,0.03)"     : "rgba(255,255,255,0.92)",
    surfaceDeep:isDark ? "rgba(255,255,255,0.015)"    : "rgba(255,255,255,0.6)",
    border:     isDark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.07)",
    borderEm:   isDark ? "rgba(255,255,255,0.14)"     : "rgba(0,0,0,0.13)",
    text:       isDark ? "#FFFFFF"                    : "#080A0E",
    textMuted:  isDark ? "rgba(255,255,255,0.4)"      : "rgba(0,0,0,0.44)",
    textFaint:  isDark ? "rgba(255,255,255,0.17)"     : "rgba(0,0,0,0.19)",
    inputBg:    isDark ? "rgba(0,0,0,0.28)"           : "#FFFFFF",
    shadow:     isDark ? "0 24px 80px rgba(0,0,0,.7)" : "0 8px 48px rgba(0,0,0,.1)",
    shadowCard: isDark ? "0 4px 28px rgba(0,0,0,.5)" : "0 2px 20px rgba(0,0,0,.07)",
    theadBg:    isDark ? "rgba(255,255,255,0.03)"     : "rgba(0,0,0,0.025)",
    rowHov:     isDark ? "rgba(230,26,33,0.04)"       : "rgba(230,26,33,0.03)",
    red:        "#E61A21",
    redSoft:    "rgba(230,26,33,0.1)",
    redGlow:    "rgba(230,26,33,0.28)",
  };
}

/* color accent for each stat */
const ACCENT = {
  blue:    { bg: "rgba(59,130,246,0.1)",  text: "#3B82F6",  border: "rgba(59,130,246,0.2)"  },
  emerald: { bg: "rgba(16,185,129,0.1)",  text: "#10B981",  border: "rgba(16,185,129,0.2)"  },
  orange:  { bg: "rgba(249,115,22,0.1)",  text: "#F97316",  border: "rgba(249,115,22,0.2)"  },
  purple:  { bg: "rgba(139,92,246,0.1)",  text: "#8B5CF6",  border: "rgba(139,92,246,0.2)"  },
  red:     { bg: "rgba(230,26,33,0.1)",   text: "#E61A21",  border: "rgba(230,26,33,0.22)"  },
  indigo:  { bg: "rgba(99,102,241,0.1)",  text: "#6366F1",  border: "rgba(99,102,241,0.2)"  },
};

/* ── AnimatedNumber ── */
function AnimatedNumber({ value }) {
  const str    = String(value ?? "0");
  const prefix = str.startsWith("%") ? "%" : "";
  const end    = parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;

  const [disp, setDisp] = useState(end);
  const fromRef  = useRef(end);
  const timerRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === end) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const DURATION = 800;
    const diff     = end - from;
    const STEPS    = Math.min(Math.max(Math.abs(diff), 1), 60);
    const stepVal  = diff / STEPS;
    const interval = Math.max(16, Math.floor(DURATION / STEPS));
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      if (step >= STEPS) {
        fromRef.current = end;
        setDisp(end);
        clearInterval(timerRef.current);
      } else {
        setDisp(Math.round(from + stepVal * step));
      }
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [end]);

  return <span>{prefix}{disp}</span>;
}

/* ── Mini scanning line ── */
function ScanLine() {
  return (
    <div style={{
      position:"absolute", left:0, right:0, height:"1px",
      background:"linear-gradient(90deg,transparent,rgba(230,26,33,0.45),transparent)",
      animation:"db-scan 5s ease-in-out infinite", pointerEvents:"none",
    }}/>
  );
}

/* ── Pulse dot ── */
function PulseDot({ color = "#E61A21", size = 8 }) {
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:color }}/>
      <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:color, animation:"db-pulse-r 1.8s ease-out infinite" }}/>
    </div>
  );
}

/* ── Progress Bar ── */
function ProgressBar({ pct, color = "#E61A21", isDark }) {
  return (
    <div style={{ position:"relative", height:"5px", borderRadius:"4px", background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow:"hidden" }}>
      <motion.div
        initial={{ width:0 }}
        animate={{ width:`${pct||0}%` }}
        transition={{ duration:1.4, ease:[0.22,1,0.36,1] }}
        style={{ position:"absolute", inset:0, borderRadius:"4px", background:`linear-gradient(90deg,${color},${color}cc)`, boxShadow:`0 0 8px ${color}55` }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   StatMini  — SAME LOGIC, NEW SOUL
════════════════════════════════════════════════════════════════════ */
function StatMini({ icon, title, value, color, danger, onClick, isDark }) {
  const t = tk(isDark);
  const ac = ACCENT[color] || ACCENT.blue;
  const isRed = danger;

  return (
    <motion.button
      onClick={onClick}
      className="db-stat-btn"
      whileTap={{ scale:.96 }}
      style={{
        width:"100%", textAlign:"left",
        position:"relative", overflow:"hidden",
        padding:"18px 16px",
        borderRadius:"20px",
        border:`1px solid ${isRed ? "rgba(230,26,33,0.3)" : t.border}`,
        background: isRed
          ? (isDark ? "rgba(230,26,33,0.06)" : "rgba(230,26,33,0.04)")
          : t.surface,
        boxShadow: isRed ? "0 4px 24px rgba(230,26,33,0.12)" : t.shadowCard,
        cursor:"pointer",
        animation: isRed ? "db-glow-pulse 2.5s ease-in-out infinite" : "none",
      }}
    >
      {/* top accent */}
      <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"1.5px", borderRadius:"0 0 3px 3px", background:`linear-gradient(90deg,transparent,${isRed?"#E61A21":ac.text},transparent)` }}/>
      {/* glow orb */}
      <div style={{ position:"absolute", top:"-20px", right:"-20px", width:"70px", height:"70px", borderRadius:"50%", background: isRed?"rgba(230,26,33,0.12)":ac.bg, filter:"blur(20px)", pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1 }}>
        {/* icon */}
        <div style={{
          width:"34px", height:"34px", borderRadius:"10px", marginBottom:"14px",
          background: isRed ? "rgba(230,26,33,0.12)" : ac.bg,
          border:`1px solid ${isRed?"rgba(230,26,33,0.25)":ac.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: isRed ? "#E61A21" : ac.text,
        }}>
          {icon}
        </div>

        <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color: isRed?"rgba(230,26,33,0.7)":t.textMuted, marginBottom:"6px" }}>
          {title}
        </p>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"36px", lineHeight:1, letterSpacing:"0.02em", color: isRed?"#E61A21":t.text }}>
          <AnimatedNumber value={value} />
        </div>

        {isRed && danger && (
          <div style={{ display:"flex", alignItems:"center", gap:"5px", marginTop:"6px" }}>
            <PulseDot color="#E61A21" size={5}/>
            <span style={{ fontSize:"9px", fontWeight:700, color:"#E61A21", letterSpacing:"0.1em" }}>Dikkat Gerekli</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   AnalyticsCard  — SAME LOGIC, NEW SOUL
════════════════════════════════════════════════════════════════════ */
function AnalyticsCard({ icon, label, value, sub, onClick, isDark, accentColor = "#E61A21" }) {
  const t = tk(isDark);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y:-4, scale:1.01 }}
      whileTap={{ scale:.97 }}
      style={{
        width:"100%", textAlign:"left",
        position:"relative", overflow:"hidden",
        padding:"24px",
        borderRadius:"22px",
        border:`1px solid ${t.border}`,
        background: t.surface,
        boxShadow: t.shadowCard,
        cursor:"pointer",
      }}
    >
      <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:"2px", background:`linear-gradient(90deg,transparent,${accentColor},transparent)` }}/>
      <div style={{ position:"absolute", bottom:"-30px", right:"-20px", width:"100px", height:"100px", borderRadius:"50%", background:`${accentColor}10`, filter:"blur(30px)", pointerEvents:"none" }}/>
      <ScanLine />

      <div style={{ position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
          <div style={{
            width:"42px", height:"42px", borderRadius:"13px",
            background:`${accentColor}15`, border:`1px solid ${accentColor}25`,
            display:"flex", alignItems:"center", justifyContent:"center",
            color: accentColor,
          }}>
            {icon}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
            <ChevronRight size={12} color={t.textFaint}/>
            <span style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:t.textFaint }}>Detay</span>
          </div>
        </div>

        <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", color:t.textMuted, marginBottom:"6px" }}>{label}</p>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"42px", lineHeight:1, letterSpacing:"0.02em", color:t.text }}>
          {value}
        </div>
        <p style={{ fontSize:"11px", fontWeight:500, color:t.textFaint, marginTop:"6px" }}>{sub}</p>
      </div>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   DataRow  — SAME LOGIC, NEW SOUL
════════════════════════════════════════════════════════════════════ */
function DataRow({ title, desc, badge, isDark }) {
  const t = tk(isDark);
  return (
    <div
      className="db-row-hover"
      style={{
        padding:"13px 16px",
        borderRadius:"16px",
        background: isDark ? "rgba(255,255,255,0.025)" : "rgba(248,248,250,1)",
        border:`1px solid ${t.border}`,
        display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px",
      }}
    >
      <div style={{ overflow:"hidden", flex:1 }}>
        <p style={{ fontSize:"12px", fontWeight:700, color:t.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{title}</p>
        <p style={{ fontSize:"10px", fontWeight:400, color:t.textMuted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:"2px" }}>{desc}</p>
      </div>
      {badge && (
        <span style={{
          fontSize:"9px", fontWeight:800,
          padding:"4px 10px", borderRadius:"20px",
          background:"rgba(230,26,33,0.1)", color:"#E61A21",
          border:"1px solid rgba(230,26,33,0.2)",
          letterSpacing:"0.12em", textTransform:"uppercase",
          whiteSpace:"nowrap", flexShrink:0,
          animation:"db-badge-in .3s ease",
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   DashboardDetail  — SAME LOGIC, NEW SOUL
════════════════════════════════════════════════════════════════════ */
function DashboardDetail({ title, value, desc, danger, isDark }) {
  const t = tk(isDark);
  return (
    <motion.div
      initial={{ opacity:0, y:10 }}
      animate={{ opacity:1, y:0 }}
      style={{
        position:"relative", overflow:"hidden",
        padding:"24px 28px",
        borderRadius:"20px",
        background: danger
          ? (isDark ? "rgba(230,26,33,0.07)" : "rgba(230,26,33,0.04)")
          : (isDark ? "rgba(255,255,255,0.03)" : "rgba(248,248,252,1)"),
        border:`1px solid ${danger ? "rgba(230,26,33,0.3)" : t.border}`,
        boxShadow: danger ? "0 4px 24px rgba(230,26,33,0.12)" : "none",
      }}
    >
      {danger && <ScanLine/>}
      <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background: danger?"rgba(230,26,33,0.1)":"rgba(230,26,33,0.05)", filter:"blur(40px)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:1 }}>
        <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color: danger?"#E61A21":t.textMuted, marginBottom:"10px" }}>{title}</p>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"56px", lineHeight:.95, letterSpacing:"0.02em", color: danger?"#E61A21":t.text, marginBottom:"12px" }}>
          {value}
        </div>
        <p style={{ fontSize:"13px", fontWeight:400, color:t.textMuted, lineHeight:1.6, maxWidth:"480px" }}>{desc}</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   GlassCard  — SAME LOGIC, NEW SOUL
════════════════════════════════════════════════════════════════════ */
function GlassCard({ children, isDark, style = {}, className = "" }) {
  const t = tk(isDark);
  return (
    <div
      className={className}
      style={{
        position:"relative", overflow:"hidden",
        borderRadius:"24px",
        padding:"28px",
        background: t.surface,
        border:`1px solid ${t.border}`,
        boxShadow: t.shadowCard,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════ */
export default function YoneticiDashboard() {
  /* ── ALL STATE UNCHANGED ── */
  const [stats, setStats] = useState({ users:0, activeUsers:0, inactiveUsers:0, trainings:0, assignments:0, delayed:0, certificates:0, avgQuiz:0 });
  const [departments, setDepartments] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [trainingsList, setTrainingsList] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [certificatesList, setCertificatesList] = useState([]);
  const [delayedAssignments, setDelayedAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  /* ── ALL LOGIC UNCHANGED ── */
  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/yonetici/dashboard-analytics");
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "Dashboard verileri alınamadı");
      setStats(json.stats || { users:0, activeUsers:0, inactiveUsers:0, trainings:0, assignments:0, delayed:0, certificates:0, avgQuiz:0 });
      setAnalytics(json.analytics || null);
      setDepartments(json.departments || []);
      setDepartmentPerformance(json.departmentPerformance || []);
      setActivities(json.activities || []);
      setUsersList(json.users || []);
      setTrainingsList(json.trainings || []);
      setQuizResults(json.quizResults || []);
      setCertificatesList(json.certificates || []);
      setDelayedAssignments(json.delayedAssignments || []);
    } catch (error) {
      console.error("Dashboard veri hatası:", error.message);
    }
  }

  /* ── STAT CARDS CONFIG ── */
  const STAT_CARDS = [
    { key:"users",       icon:<Users size={15}/>,       title:"Kullanıcı",  color:"blue",    value:stats.users },
    { key:"activeUsers", icon:<Zap size={15}/>,         title:"Aktif",      color:"emerald", value:stats.activeUsers },
    { key:"inactiveUsers",icon:<Activity size={15}/>,   title:"Pasif",      color:"orange",  value:stats.inactiveUsers },
    { key:"trainings",   icon:<BookOpen size={15}/>,    title:"Eğitim",     color:"purple",  value:stats.trainings },
    { key:"assignments", icon:<Bookmark size={15}/>,    title:"Atama",      color:"orange",  value:stats.assignments },
    { key:"delayed",     icon:<AlertCircle size={15}/>, title:"Geciken",    color:"red",     value:stats.delayed, danger:stats.delayed>0 },
    { key:"certificates",icon:<Award size={15}/>,       title:"Sertifika",  color:"emerald", value:stats.certificates },
    { key:"avgQuiz",     icon:<Brain size={15}/>,       title:"Quiz Ort.",  color:"indigo",  value:`%${stats.avgQuiz}` },
  ];

  return (
    <>
      <style>{STYLES}</style>

      <YoneticiLayout pageTitle="Yönetim Paneli" pageSubtitle="Kurumsal Verimlilik ve Eğitim Analitiği">
        {({ isDark, userName }) => {
          const t = tk(isDark);

          return (
            <div className="db-root" style={{ position:"relative" }}>

              {/* ── Ambient orbs ── */}
              <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
                <div style={{ position:"absolute", top:"0%", right:"5%",  width:"700px", height:"700px", borderRadius:"50%", background:"rgba(230,26,33,0.03)", filter:"blur(160px)" }}/>
                <div style={{ position:"absolute", bottom:"5%", left:"0%", width:"500px", height:"500px", borderRadius:"50%", background:"rgba(59,130,246,0.025)", filter:"blur(120px)" }}/>
              </div>

              <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:"24px" }}>

                {/* ══════════════════════════════════════════════════════════
                    HERO HEADER
                ══════════════════════════════════════════════════════════ */}
                <motion.section
                  initial={{ opacity:0, y:22 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ duration:.6, ease:[.22,1,.36,1] }}
                  style={{
                    position:"relative", overflow:"hidden",
                    borderRadius:"28px",
                    padding:"28px 36px",
                    background: t.surface,
                    border:`1px solid ${t.border}`,
                    boxShadow: t.shadowCard,
                  }}
                >
                  <div className="db-grid-bg" style={{ position:"absolute", inset:0, borderRadius:"inherit", opacity:.4 }}/>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent 0%,#E61A21 40%,transparent 100%)" }}/>
                  <ScanLine/>
                  <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"300px", height:"300px", borderRadius:"50%", background:"rgba(230,26,33,0.08)", filter:"blur(90px)", pointerEvents:"none" }}/>

                  <div style={{ position:"relative", zIndex:1, display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"28px" }}>

                    {/* Left */}
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                        <PulseDot color="#E61A21" size={7}/>
                        <span style={{ fontSize:"9px", fontWeight:800, letterSpacing:"0.42em", textTransform:"uppercase", color:"#E61A21" }}>
                          SPORTHINK · SİSTEM AKTİF
                        </span>
                      </div>

                      <h1 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"clamp(32px,4vw,54px)", lineHeight:.92, letterSpacing:"0.03em", color:t.text, margin:"0 0 8px" }}>
                        Hoş Geldin,{" "}
                        <span className="db-shimmer-text">{userName || "Yönetici"}</span>
                      </h1>

                      <p style={{ fontSize:"13px", fontWeight:400, color:t.textMuted, maxWidth:"380px", lineHeight:1.6 }}>
                        SporThink platformu genel performans özeti — gerçek zamanlı analitik.
                      </p>
                    </div>

                    {/* Right badges */}
                    <div style={{ display:"flex", flexDirection:"column", gap:"10px", alignItems:"flex-end" }}>
                      <div style={{
                        padding:"8px 18px", borderRadius:"20px",
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                        border:`1px solid ${t.border}`,
                        display:"flex", alignItems:"center", gap:"8px",
                      }}>
                        <Shield size={12} color={t.textMuted}/>
                        <span style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:t.textMuted }}>v2.5 Stable</span>
                      </div>

                      <div style={{
                        padding:"8px 18px", borderRadius:"20px",
                        background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)",
                        display:"flex", alignItems:"center", gap:"8px",
                      }}>
                        <PulseDot color="#10B981" size={6}/>
                        <span style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#10B981" }}>Supabase Bağlı</span>
                      </div>

                      {/* Quick totals */}
                      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"flex-end" }}>
                        {[
                          { label:"Kullanıcı", val:stats.users, icon:"👥" },
                          { label:"Eğitim",    val:stats.trainings, icon:"📚" },
                        ].map(({ label, val, icon }) => (
                          <div key={label} style={{
                            padding:"7px 14px", borderRadius:"14px",
                            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                            border:`1px solid ${t.border}`,
                            display:"flex", alignItems:"center", gap:"8px",
                          }}>
                            <span style={{ fontSize:"14px" }}>{icon}</span>
                            <div>
                              <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:t.textFaint }}>{label}</p>
                              <p style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"20px", lineHeight:1, color:t.text }}>{val}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* ══════════════════════════════════════════════════════════
                    STAT MINI GRID
                ══════════════════════════════════════════════════════════ */}
                <motion.section
                  initial={{ opacity:0, y:18 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ duration:.6, delay:.1, ease:[.22,1,.36,1] }}
                  style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"14px" }}
                >
                  {STAT_CARDS.map((card, i) => (
                    <motion.div
                      key={card.key}
                      initial={{ opacity:0, y:12 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ delay: i*0.05+0.1 }}
                    >
                      <StatMini {...card} isDark={isDark} onClick={() => setSelectedStat(selectedStat === card.key ? null : card.key)} />
                    </motion.div>
                  ))}
                </motion.section>

                {/* ══════════════════════════════════════════════════════════
                    SELECTED STAT DETAIL PANEL
                ══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                  {selectedStat && (
                    <motion.div
                      key="stat-detail"
                      initial={{ opacity:0, height:0, y:-10 }}
                      animate={{ opacity:1, height:"auto", y:0 }}
                      exit={{ opacity:0, height:0, y:-10 }}
                      transition={{ duration:.4, ease:[.22,1,.36,1] }}
                    >
                      <GlassCard isDark={isDark} style={{ border:"1px solid rgba(230,26,33,0.2)", boxShadow:"0 8px 48px rgba(230,26,33,0.1)" }}>
                        {/* top accent */}
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#E61A21,transparent)" }}/>
                        <ScanLine/>

                        {/* header */}
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px", paddingBottom:"18px", borderBottom:`1px solid ${t.border}` }}>
                          <div>
                            <p style={{ fontSize:"9px", fontWeight:800, letterSpacing:"0.35em", textTransform:"uppercase", color:"#E61A21", marginBottom:"4px" }}>
                              YÖNETİCİ VERİ DETAYI
                            </p>
                            <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"24px", letterSpacing:"0.04em", color:t.text }}>
                              Seçilen Kartın Canlı Sistem Özeti
                            </h3>
                          </div>
                          <motion.button
                            whileHover={{ scale:1.1, rotate:90 }}
                            whileTap={{ scale:.9 }}
                            onClick={() => setSelectedStat(null)}
                            style={{
                              width:"36px", height:"36px", borderRadius:"10px",
                              border:`1px solid ${t.border}`,
                              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              cursor:"pointer",
                            }}
                          >
                            <X size={14} color={t.textMuted}/>
                          </motion.button>
                        </div>

                        {/* ─── selectedStat panels – ALL LOGIC UNCHANGED ─── */}
                        <div style={{ position:"relative", zIndex:1 }}>
                          {selectedStat === "users" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Toplam Kullanıcı" value={stats.users} desc={`Sistemde kayıtlı toplam ${stats.users} kullanıcı bulunmaktadır.`}/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {usersList.map((u) => <DataRow key={u.id} isDark={isDark} title={u.name} desc={u.email} badge={u.role}/>)}
                              </div>
                            </div>
                          )}
                          {selectedStat === "activeUsers" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Aktif Kullanıcılar" value={stats.activeUsers} desc="Son 1 saat içinde sisteme giriş yapan kullanıcılar aktif kabul edilmektedir."/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {analytics?.activeUsersData?.length > 0
                                  ? analytics.activeUsersData.map((u) => <DataRow key={u.id||u.kullanici_id} isDark={isDark} title={`${u.ad||""} ${u.soyad||""}`.trim()||u.e_posta||"Kullanıcı"} desc={u.e_posta||u.email||"E-posta yok"} badge="ONLINE"/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Şu anda aktif kullanıcı bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                          {selectedStat === "inactiveUsers" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Pasif Kullanıcılar" value={stats.inactiveUsers} desc={`Son 1 saat içinde aktif görünmeyen ${stats.inactiveUsers} kullanıcı bulunmaktadır.`}/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {analytics?.inactiveUsersData?.length > 0
                                  ? analytics.inactiveUsersData.map((u) => <DataRow key={u.id||u.kullanici_id} isDark={isDark} title={`${u.ad||""} ${u.soyad||""}`.trim()||u.e_posta||"Kullanıcı"} desc={u.e_posta||u.email||"E-posta yok"} badge="PASİF"/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Pasif kullanıcı bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                          {selectedStat === "trainings" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Eğitim Sayısı" value={stats.trainings} desc={`Platformda yönetilen toplam ${stats.trainings} eğitim bulunmaktadır.`}/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {trainingsList.length > 0
                                  ? trainingsList.slice(0,12).map((tr) => <DataRow key={tr.id} isDark={isDark} title={tr.title} desc={tr.created_at ? new Date(tr.created_at).toLocaleDateString("tr-TR") : "Tarih yok"} badge={tr.type}/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Eğitim verisi bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                          {selectedStat === "assignments" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Eğitim Atamaları" value={stats.assignments} desc={`Kullanıcılara atanmış toplam ${stats.assignments} eğitim görevi bulunmaktadır.`}/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {activities.length > 0
                                  ? activities.map((item) => <DataRow key={item.id} isDark={isDark} title={item.user_name||"Kullanıcı"} desc={item.training_title||"Eğitim"} badge={(item.status||"assigned").toUpperCase()}/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Atama verisi bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                          {selectedStat === "delayed" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Geciken Eğitimler" value={stats.delayed} desc={`${stats.delayed} eğitim ataması son teslim tarihini geçmiş ve tamamlanmamış görünmektedir.`} danger/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {delayedAssignments.length > 0
                                  ? delayedAssignments.map((item) => <DataRow key={item.id} isDark={isDark} title={item.user_name||"Kullanıcı"} desc={`${item.training_title||"Eğitim"} • ${item.due_date ? new Date(item.due_date).toLocaleDateString("tr-TR") : "Son tarih yok"}`} badge="GECİKTİ"/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Geciken eğitim ataması bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                          {selectedStat === "certificates" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Sertifikalar" value={stats.certificates} desc={`Sistemde oluşturulmuş toplam ${stats.certificates} sertifika bulunmaktadır.`}/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {certificatesList.length > 0
                                  ? certificatesList.map((c) => <DataRow key={c.id} isDark={isDark} title={c.user_name} desc={`${c.training_name} • ${c.issued_at ? new Date(c.issued_at).toLocaleDateString("tr-TR") : "Tarih yok"}`} badge={c.level||c.status}/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Sertifika verisi bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                          {selectedStat === "avgQuiz" && (
                            <div>
                              <DashboardDetail isDark={isDark} title="Quiz Ortalama Başarısı" value={`%${stats.avgQuiz}`} desc={`Genel quiz başarı ortalaması %${stats.avgQuiz}. Bu değer öğrencilerin quiz sonuçlarından hesaplanmaktadır.`}/>
                              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"10px", marginTop:"18px" }}>
                                {quizResults.length > 0
                                  ? quizResults.map((q) => <DataRow key={q.id} isDark={isDark} title={q.user_name} desc={`${q.quiz_type} • ${q.quiz_title} • %${q.score}`} badge={q.status}/>)
                                  : <p style={{ fontSize:"13px", color:t.textMuted, fontStyle:"italic" }}>Quiz sonucu bulunmuyor.</p>
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ══════════════════════════════════════════════════════════
                    ANALYTICS CARDS
                ══════════════════════════════════════════════════════════ */}
                {analytics && (
                  <motion.div
                    initial={{ opacity:0, y:18 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:.55, delay:.18, ease:[.22,1,.36,1] }}
                    style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"16px" }}
                  >
                    <AnalyticsCard isDark={isDark} onClick={() => setActiveDetail("activeUsers")}   icon={<Zap size={18}/>}    label="Şu An Aktif"       value={analytics.activeUsers}              sub="Kullanıcı Sistemde"    accentColor="#10B981"/>
                    <AnalyticsCard isDark={isDark} onClick={() => setActiveDetail("learningSummary")} icon={<Clock size={18}/>}  label="Toplam Öğrenme"    value={`${analytics.totalLearningMinutes} dk`} sub="Genel Aktivite"     accentColor="#3B82F6"/>
                    <AnalyticsCard isDark={isDark} onClick={() => setActiveDetail("topLearners")}   icon={<Trophy size={18}/>}  label="Liderlik Tablosu"  value={analytics.topLearners?.length||0}   sub="Başarılı Öğrenciler"   accentColor="#F59E0B"/>
                  </motion.div>
                )}

                {/* ══════════════════════════════════════════════════════════
                    ACTIVE DETAIL PANEL
                ══════════════════════════════════════════════════════════ */}
                <AnimatePresence>
                  {activeDetail && (
                    <motion.div
                      key="active-detail"
                      initial={{ opacity:0, height:0, y:-10 }}
                      animate={{ opacity:1, height:"auto", y:0 }}
                      exit={{ opacity:0, height:0, y:-10 }}
                      transition={{ duration:.4, ease:[.22,1,.36,1] }}
                    >
                      <GlassCard isDark={isDark} style={{ border:"1px solid rgba(230,26,33,0.18)" }}>
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent,#E61A21,transparent)" }}/>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px", paddingBottom:"16px", borderBottom:`1px solid ${t.border}` }}>
                          <div>
                            <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:t.textMuted, marginBottom:"4px" }}>VERİ DETAYLARI</p>
                            <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:"0.04em", color:t.text }}>Canlı Sistem Verileri</h3>
                          </div>
                          <motion.button whileHover={{ scale:1.1, rotate:90 }} whileTap={{ scale:.9 }} onClick={() => setActiveDetail(null)} style={{ width:"34px", height:"34px", borderRadius:"10px", border:`1px solid ${t.border}`, background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                            <X size={13} color={t.textMuted}/>
                          </motion.button>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"10px" }}>
                          {activeDetail === "activeUsers"    && analytics?.activeUsersData?.map((u) => <DataRow key={u.kullanici_id} isDark={isDark} title={`${u.ad} ${u.soyad}`} desc={u.e_posta} badge="AKTİF"/>)}
                          {activeDetail === "topLearners"    && analytics?.topLearners?.map((l,i) => <DataRow key={i} isDark={isDark} title={l.full_name} desc={`${l.points} Puan`} badge={`#${i+1}`}/>)}
                          {activeDetail === "learningSummary" && analytics?.studentLearningStats?.map((s,i) => (
                            <DataRow key={i} isDark={isDark} title={s.full_name||s.email||"Bilinmeyen Kullanıcı"} desc={`${s.total_minutes||0} dk • ${s.courses||0} eğitim`} badge={s.completed>0?"TAMAMLADI":"AKTİF"}/>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ══════════════════════════════════════════════════════════
                    DEPARTMENT PERFORMANCE
                ══════════════════════════════════════════════════════════ */}
                <motion.section
                  initial={{ opacity:0, y:18 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ duration:.55, delay:.24, ease:[.22,1,.36,1] }}
                >
                  <GlassCard isDark={isDark}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(90deg,transparent 0%,#E61A21 50%,transparent 100%)" }}/>

                    {/* Header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px" }}>
                      <div>
                        <p style={{ fontSize:"9px", fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"#E61A21", marginBottom:"6px" }}>PERFORMANS ANALİZİ</p>
                        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", letterSpacing:"0.04em", color:t.text }}>Departman Performansı</h2>
                      </div>
                      <div style={{
                        width:"40px", height:"40px", borderRadius:"12px",
                        background:t.surfaceDeep, border:`1px solid ${t.border}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <TrendingUp size={16} color={t.textMuted}/>
                      </div>
                    </div>

                    {/* Bars */}
                    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
                      {departmentPerformance.length > 0
                        ? departmentPerformance.map((dep, i) => {
                            const colors = ["#E61A21","#3B82F6","#10B981","#8B5CF6","#F59E0B","#EC4899"];
                            const color = colors[i % colors.length];
                            return (
                              <motion.div
                                key={dep.department}
                                initial={{ opacity:0, x:-10 }}
                                animate={{ opacity:1, x:0 }}
                                transition={{ delay: i*0.08+0.2 }}
                              >
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                                    <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:color, flexShrink:0, boxShadow:`0 0 8px ${color}55` }}/>
                                    <span style={{ fontSize:"13px", fontWeight:700, color:t.text }}>{dep.department||"Genel"}</span>
                                    <span style={{ fontSize:"10px", fontWeight:600, color:t.textMuted }}>— {dep.users||0} kişi</span>
                                  </div>
                                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                    <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", letterSpacing:"0.04em", color }}>%{dep.percent||0}</span>
                                  </div>
                                </div>
                                <ProgressBar pct={dep.percent||0} color={color} isDark={isDark}/>
                              </motion.div>
                            );
                          })
                        : (
                          <div style={{ padding:"32px 0", textAlign:"center" }}>
                            <div style={{ width:"36px", height:"36px", border:"3px solid rgba(230,26,33,0.2)", borderTopColor:"#E61A21", borderRadius:"50%", animation:"db-spin .8s linear infinite", margin:"0 auto 14px" }}/>
                            <p style={{ fontSize:"12px", fontWeight:600, color:t.textMuted }}>Departman verisi yükleniyor...</p>
                          </div>
                        )
                      }
                    </div>
                  </GlassCard>
                </motion.section>

              </div>
            </div>
          );
        }}
      </YoneticiLayout>
    </>
  );
}