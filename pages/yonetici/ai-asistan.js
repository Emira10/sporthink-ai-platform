import { useState, useRef, useEffect } from "react";
import { Brain, Send, Sparkles, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  .ai-root * { box-sizing: border-box; }
  .ai-root { font-family: 'Outfit', sans-serif; }

  /* ── Keyframes ── */
  @keyframes ai-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes ai-breathe {
    0%,100% { opacity:1; }
    50%      { opacity:0.35; }
  }
  @keyframes ai-float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes ai-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes ai-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes ai-scan {
    0%   { top: 0%; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes ai-grid-move {
    0%   { transform: translateY(0); }
    100% { transform: translateY(40px); }
  }
  @keyframes ai-blink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0; }
  }
  @keyframes ai-wave {
    0%,100% { transform: scaleY(0.4); }
    50%      { transform: scaleY(1); }
  }
  @keyframes ai-particle {
    0%   { transform: translateY(0) translateX(0) scale(1); opacity:0.8; }
    100% { transform: translateY(-120px) translateX(var(--dx)) scale(0); opacity:0; }
  }

  /* ── Scrollbar ── */
  .ai-scroll::-webkit-scrollbar { width: 3px; }
  .ai-scroll::-webkit-scrollbar-track { background: transparent; }
  .ai-scroll::-webkit-scrollbar-thumb { background: rgba(230,26,33,0.4); border-radius: 2px; }

  /* ── Input focus ── */
  .ai-input:focus { outline: none; }

  /* ── Shimmer text ── */
  .ai-shimmer-text {
    background: linear-gradient(90deg, #E61A21 0%, #ff6b6b 30%, #fff 50%, #ff6b6b 70%, #E61A21 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ai-shimmer 3s linear infinite;
  }

  /* ── Typing dots ── */
  .ai-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #E61A21; margin: 0 2px; animation: ai-wave 1.2s ease-in-out infinite; }
  .ai-dot:nth-child(2) { animation-delay: 0.2s; }
  .ai-dot:nth-child(3) { animation-delay: 0.4s; }

  /* ── Neural grid ── */
  .ai-grid-bg {
    background-image:
      linear-gradient(rgba(230,26,33,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(230,26,33,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    animation: ai-grid-move 4s linear infinite;
  }

  /* ── Message hover ── */
  .ai-msg-user:hover  { filter: brightness(1.08); }
  .ai-msg-ai:hover    { border-color: rgba(230,26,33,0.3) !important; }
`;

/* ═══════════════════════════════════════════════════════════════
   COLOR TOKENS
═══════════════════════════════════════════════════════════════ */
function tk(isDark) {
  return {
    bg:         isDark ? "#060608"                    : "#F0F2F7",
    surface:    isDark ? "rgba(255,255,255,0.032)"    : "rgba(255,255,255,0.92)",
    surfaceDeep:isDark ? "rgba(255,255,255,0.018)"    : "rgba(255,255,255,0.7)",
    border:     isDark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.08)",
    borderEm:   isDark ? "rgba(255,255,255,0.14)"     : "rgba(0,0,0,0.15)",
    text:       isDark ? "#FFFFFF"                    : "#08080A",
    textMuted:  isDark ? "rgba(255,255,255,0.4)"      : "rgba(0,0,0,0.45)",
    textFaint:  isDark ? "rgba(255,255,255,0.18)"     : "rgba(0,0,0,0.2)",
    inputBg:    isDark ? "rgba(0,0,0,0.3)"            : "#FFFFFF",
    shadow:     isDark ? "0 24px 80px rgba(0,0,0,0.7)" : "0 8px 48px rgba(0,0,0,0.12)",
    shadowCard: isDark ? "0 4px 32px rgba(0,0,0,0.5)" : "0 2px 24px rgba(0,0,0,0.08)",
    red:        "#E61A21",
    redSoft:    "rgba(230,26,33,0.12)",
    redGlow:    "rgba(230,26,33,0.3)",
    userBubble: "linear-gradient(135deg, #E61A21 0%, #c9151c 60%, #a01018 100%)",
    aiBubble:   isDark ? "rgba(255,255,255,0.04)" : "rgba(248,248,250,1)",
  };
}

/* ═══════════════════════════════════════════════════════════════
   PARTICLE  (decorative floating particle)
═══════════════════════════════════════════════════════════════ */
function Particle({ style }) {
  return (
    <div style={{
      position: "absolute",
      width: "4px", height: "4px",
      borderRadius: "50%",
      background: "#E61A21",
      opacity: 0,
      animation: `ai-particle ${2 + Math.random() * 2}s ease-out infinite`,
      animationDelay: `${Math.random() * 3}s`,
      "--dx": `${(Math.random() - 0.5) * 60}px`,
      ...style,
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   WAVEFORM  (animated bars in the AI avatar)
═══════════════════════════════════════════════════════════════ */
function Waveform({ active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "18px" }}>
      {[1, 0.6, 1, 0.4, 0.8, 1, 0.5].map((h, i) => (
        <div key={i} style={{
          width: "3px",
          height: active ? `${h * 18}px` : "4px",
          borderRadius: "2px",
          background: active ? "#E61A21" : "rgba(230,26,33,0.3)",
          transition: "height 0.3s ease",
          animation: active ? `ai-wave 1.2s ease-in-out infinite` : "none",
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STATUS BADGE
═══════════════════════════════════════════════════════════════ */
function StatusBadge({ isDark }) {
  const t = tk(isDark);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "8px",
      padding: "7px 14px", borderRadius: "20px",
      background: "rgba(16,185,129,0.08)",
      border: "1px solid rgba(16,185,129,0.2)",
    }}>
      <div style={{ position: "relative", width: "8px", height: "8px" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981" }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981",
          animation: "ai-pulse-ring 1.8s ease-out infinite",
        }} />
      </div>
      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#10B981" }}>
        Online · GPT-4 Turbo
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CHAT MESSAGE
═══════════════════════════════════════════════════════════════ */
function ChatMessage({ item, index, isDark }) {
  const t = tk(isDark);
  const isUser = item.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", gap: "12px", alignItems: "flex-end" }}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div style={{
          flexShrink: 0, width: "36px", height: "36px", borderRadius: "12px",
          background: "linear-gradient(145deg, #1a0203, #3a0508)",
          border: "1px solid rgba(230,26,33,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(230,26,33,0.2)",
        }}>
          <Sparkles size={14} color="#E61A21" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={isUser ? "ai-msg-user" : "ai-msg-ai"}
        style={{
          maxWidth: "72%",
          padding: "16px 20px",
          borderRadius: isUser ? "24px 24px 6px 24px" : "24px 24px 24px 6px",
          background: isUser ? t.userBubble : t.aiBubble,
          border: isUser ? "none" : `1px solid ${t.border}`,
          boxShadow: isUser
            ? "0 8px 32px rgba(230,26,33,0.35), 0 2px 8px rgba(230,26,33,0.2)"
            : t.shadowCard,
          transition: "border-color 0.2s ease, filter 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* AI header */}
        {!isUser && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#E61A21", animation: "ai-breathe 2s infinite" }} />
            <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "#E61A21" }}>
              SPORTHINK AI
            </span>
          </div>
        )}

        <p style={{
          fontSize: "13.5px", fontWeight: isUser ? 600 : 500,
          lineHeight: 1.7,
          color: isUser ? "#fff" : t.text,
          margin: 0,
        }}>
          {item.text}
        </p>

        {/* User bubble shine */}
        {isUser && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
            borderRadius: "inherit", pointerEvents: "none",
          }} />
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div style={{
          flexShrink: 0, width: "36px", height: "36px", borderRadius: "12px",
          background: "linear-gradient(145deg, #E61A21, #A01018)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "16px", color: "#fff",
          boxShadow: "0 4px 16px rgba(230,26,33,0.4)",
        }}>
          Y
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TYPING INDICATOR
═══════════════════════════════════════════════════════════════ */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}
    >
      <div style={{
        flexShrink: 0, width: "36px", height: "36px", borderRadius: "12px",
        background: "linear-gradient(145deg, #1a0203, #3a0508)",
        border: "1px solid rgba(230,26,33,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Sparkles size={14} color="#E61A21" />
      </div>
      <div style={{
        padding: "16px 22px", borderRadius: "24px 24px 24px 6px",
        background: "rgba(230,26,33,0.07)",
        border: "1px solid rgba(230,26,33,0.2)",
        display: "flex", alignItems: "center", gap: "4px",
      }}>
        <span className="ai-dot" />
        <span className="ai-dot" />
        <span className="ai-dot" />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   QUICK PROMPT CHIP
═══════════════════════════════════════════════════════════════ */
function QuickChip({ label, onClick, isDark }) {
  const t = tk(isDark);
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 16px",
        borderRadius: "20px",
        border: `1px solid ${hov ? "rgba(230,26,33,0.5)" : t.border}`,
        background: hov ? "rgba(230,26,33,0.08)" : t.surfaceDeep,
        color: hov ? "#E61A21" : t.textMuted,
        fontSize: "11px", fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'Outfit', sans-serif",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════ */
export default function YoneticiAiAsistan() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [chat, setChat] = useState([
    {
      role: "ai",
      text: "Merhaba, ben yönetici AI asistanınızım. Eğitimler, ilerleme, quiz sonuçları, sertifikalar ve yol haritaları hakkında size yardımcı olabilirim.",
    },
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  async function sendMessage(text) {
    const msg = text || message;
    if (!msg.trim()) return;

    setChat((prev) => [...prev, { role: "user", text: msg }]);
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/yonetici/ai-asistan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();

    setChat((prev) => [
      ...prev,
      {
        role: "ai",
        text: data.ok ? data.answer : data.error || "AI bağlantı hatası.",
      },
    ]);

    setLoading(false);
  }

  const quickPrompts = [
    "Quiz sonuçlarını analiz et",
    "Aktif eğitimleri listele",
    "Performans raporu",
    "Sertifika durumu",
    "Yol haritası öner",
  ];

  return (
    <>
      <style>{STYLES}</style>

      <YoneticiLayout
        pageTitle="AI ASİSTAN"
        pageSubtitle="Yönetici kararlarını destekleyen yapay zeka danışmanı"
      >
        {({ isDark }) => {
          const t = tk(isDark);

          return (
            <div className="ai-root" style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>

              {/* ── Ambient orbs ── */}
              <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: "0%", right: "10%", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(230,26,33,0.035)", filter: "blur(140px)" }} />
                <div style={{ position: "absolute", bottom: "10%", left: "0%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(59,130,246,0.025)", filter: "blur(100px)" }} />
              </div>

              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* ════════════════════════════════════════════════════
                    HERO HEADER
                ════════════════════════════════════════════════════ */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "relative", overflow: "hidden",
                    borderRadius: "28px",
                    border: `1px solid ${t.border}`,
                    background: t.surface,
                    boxShadow: t.shadowCard,
                    padding: "28px 32px",
                  }}
                >
                  {/* Grid background */}
                  <div className="ai-grid-bg" style={{
                    position: "absolute", inset: 0,
                    borderRadius: "inherit", opacity: 0.5,
                    overflow: "hidden",
                  }} />

                  {/* Top accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent 0%, #E61A21 40%, transparent 100%)" }} />

                  {/* Scanner line */}
                  <div style={{
                    position: "absolute", left: 0, right: 0, height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(230,26,33,0.4), transparent)",
                    animation: "ai-scan 4s ease-in-out infinite",
                    pointerEvents: "none",
                  }} />

                  {/* Glow */}
                  <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(230,26,33,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />

                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <Particle key={i} style={{ left: `${15 + i * 14}%`, bottom: "20px" }} />
                  ))}

                  <div style={{ position: "relative", zIndex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "28px" }}>

                    {/* AI Brain Icon */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "relative", flexShrink: 0,
                        width: "80px", height: "80px",
                      }}
                    >
                      {/* Outer pulse rings */}
                      {[1, 2].map((r) => (
                        <div key={r} style={{
                          position: "absolute",
                          inset: `${-r * 10}px`,
                          borderRadius: "24px",
                          border: "1px solid rgba(230,26,33,0.15)",
                          animation: `ai-pulse-ring ${1.5 + r * 0.5}s ease-out infinite`,
                          animationDelay: `${r * 0.4}s`,
                        }} />
                      ))}

                      <div style={{
                        width: "80px", height: "80px", borderRadius: "24px",
                        background: "linear-gradient(145deg, #E61A21, #A01018)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 8px 32px rgba(230,26,33,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                        position: "relative",
                      }}>
                        <Brain color="#fff" size={36} />
                        {/* Shine */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(180deg,rgba(255,255,255,0.2) 0%,transparent 100%)", borderRadius: "24px 24px 0 0", pointerEvents: "none" }} />
                      </div>
                    </motion.div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.4em", textTransform: "uppercase", color: "#E61A21" }}>
                          SPORTHINK · NEURAL ENGINE
                        </span>
                        <StatusBadge isDark={isDark} />
                      </div>

                      <h1 style={{
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "clamp(30px,3.8vw,50px)",
                        lineHeight: 0.95,
                        letterSpacing: "0.04em",
                        color: t.text,
                        margin: "0 0 10px",
                      }}>
                        Akıllı Yönetim{" "}
                        <span className="ai-shimmer-text">Asistanı</span>
                      </h1>

                      <p style={{ fontSize: "13px", fontWeight: 400, color: t.textMuted, lineHeight: 1.6, maxWidth: "380px" }}>
                        Eğitim, performans, quiz ve roadmap süreçlerini gerçek zamanlı analiz eder.
                      </p>
                    </div>

                    {/* Right stats */}
                    <div style={{
                      display: "flex", flexDirection: "column", gap: "10px",
                      flexShrink: 0, alignItems: "flex-end",
                    }}>
                      {[
                        { label: "Model", val: "GPT-4 Turbo", icon: "🧠" },
                        { label: "Yanıt Süresi", val: "~1.2s", icon: "⚡" },
                        { label: "Mesajlar", val: `${chat.length}`, icon: "💬" },
                      ].map(({ label, val, icon }) => (
                        <div key={label} style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "8px 14px", borderRadius: "14px",
                          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          border: `1px solid ${t.border}`,
                        }}>
                          <span style={{ fontSize: "14px" }}>{icon}</span>
                          <div>
                            <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: t.textFaint, marginBottom: "2px" }}>{label}</p>
                            <p style={{ fontSize: "12px", fontWeight: 800, color: t.text }}>{val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* ════════════════════════════════════════════════════
                    CHAT PANEL
                ════════════════════════════════════════════════════ */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    borderRadius: "28px",
                    border: `1px solid ${t.border}`,
                    background: t.surface,
                    boxShadow: t.shadowCard,
                    overflow: "hidden",
                  }}
                >
                  {/* Chat header bar */}
                  <div style={{
                    padding: "18px 28px",
                    borderBottom: `1px solid ${t.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Waveform active={loading} />
                      <div>
                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: t.textMuted }}>
                          KONUŞMA AKIŞI
                        </p>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: t.text, marginTop: "2px" }}>
                          {loading ? "AI yanıt hazırlıyor..." : `${chat.length} mesaj`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
                        <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                      ))}
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="ai-scroll"
                    style={{
                      height: "460px",
                      overflowY: "auto",
                      padding: "28px",
                      display: "flex", flexDirection: "column", gap: "18px",
                    }}
                  >
                    {chat.map((item, index) => (
                      <ChatMessage key={index} item={item} index={index} isDark={isDark} />
                    ))}

                    <AnimatePresence>
                      {loading && <TypingIndicator />}
                    </AnimatePresence>

                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  {chat.length <= 2 && (
                    <div style={{
                      padding: "0 28px 16px",
                      display: "flex", gap: "8px", flexWrap: "wrap",
                    }}>
                      {quickPrompts.map((q) => (
                        <QuickChip key={q} label={q} isDark={isDark} onClick={() => sendMessage(q)} />
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ height: "1px", background: t.border, marginX: "28px" }} />

                  {/* Input Bar */}
                  <div style={{ padding: "20px 28px" }}>
                    <div style={{
                      display: "flex", gap: "12px", alignItems: "center",
                      padding: "6px 6px 6px 20px",
                      borderRadius: "20px",
                      border: `1.5px solid ${isFocused ? "rgba(230,26,33,0.5)" : t.border}`,
                      background: t.inputBg,
                      boxShadow: isFocused ? "0 0 0 4px rgba(230,26,33,0.08)" : "none",
                      transition: "all 0.25s ease",
                    }}>
                      {/* Zap icon */}
                      <Zap
                        size={16}
                        color={isFocused ? "#E61A21" : t.textFaint}
                        style={{ flexShrink: 0, transition: "color 0.2s" }}
                      />

                      <input
                        className="ai-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Quiz sonuçlarına göre hangi eğitimleri güçlendirmeliyim?"
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          color: t.text,
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          padding: "10px 0",
                          caretColor: "#E61A21",
                        }}
                      />

                      {/* Char counter */}
                      {message.length > 0 && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: t.textFaint, flexShrink: 0 }}>
                          {message.length}
                        </span>
                      )}

                      {/* Send button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendMessage()}
                        disabled={loading || !message.trim()}
                        style={{
                          flexShrink: 0,
                          width: "46px", height: "46px",
                          borderRadius: "14px",
                          border: "none",
                          background: loading || !message.trim()
                            ? "rgba(230,26,33,0.2)"
                            : "linear-gradient(135deg, #E61A21, #c9151c)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                          boxShadow: loading || !message.trim() ? "none" : "0 4px 16px rgba(230,26,33,0.4)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {loading
                          ? <div style={{ width: "16px", height: "16px", border: "2px solid rgba(230,26,33,0.3)", borderTopColor: "#E61A21", borderRadius: "50%", animation: "ai-spin 0.6s linear infinite" }} />
                          : <Send size={16} color={message.trim() ? "#fff" : "rgba(230,26,33,0.5)"} />
                        }
                      </motion.button>
                    </div>

                    {/* Footer hint */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "12px" }}>
                      {[
                        { icon: "↩", label: "Enter ile gönder" },
                        { icon: "🔒", label: "Uçtan uca şifreli" },
                        { icon: "⚡", label: "Gerçek zamanlı" },
                      ].map(({ icon, label }) => (
                        <span key={label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 600, color: t.textFaint }}>
                          <span style={{ fontSize: "11px" }}>{icon}</span> {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.section>

              </div>
            </div>
          );
        }}
      </YoneticiLayout>
    </>
  );
}