import { useEffect, useState } from "react";
import { Bell, ChevronRight, Search, LayoutGrid } from "lucide-react";

export default function YoneticiTopbar({
  title = "Yönetici Paneli",
  subtitle = "Kurumsal eğitim süreçlerini yönet",
  isDark = true,
  userName = "Amira", // قمت بتحديثه لاسمك بناءً على ملفك الشخصي
}) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications/list?user_id=${userId}`);
      const json = await res.json();
      if (json.ok) setNotifications(json.notifications || []);
    } catch (err) {
      console.error("Bildirimler yüklenemedi", err);
    }
  }

  async function markAsRead(id) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <style>{`
        .st-topbar-wrapper {
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (min-width: 1024px) {
          .st-topbar-wrapper {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        /* تحسين العنوان ليكون أكثر حدة وفخامة */
        .st-page-title {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(40px, 6vw, 72px); /* تقليل الحجم قليلاً للتوازن */
          line-height: 1;
          letter-spacing: 0.02em;
          margin: 0;
          background: ${isDark ? 'linear-gradient(to bottom, #fff 40%, #666 100%)' : 'linear-gradient(to bottom, #000 40%, #444 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* إضافة لمسة زجاجية لبطاقة المستخدم */
        .st-glass-card {
          background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)'};
          backdrop-filter: blur(12px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'};
          transition: all 0.3s ease;
        }

        .st-glass-card:hover {
          border-color: #E61A21;
          transform: translateY(-2px);
        }

        /* تحسين قائمة التنبيهات */
        .st-notif-panel {
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.45);
          clip-path: initial;
        }
      `}</style>

      <div className="st-topbar-wrapper">
        {/* ── LEFT: TITLE BLOCK ─────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 opacity-80">
            <span className="text-[10px] font-black tracking-[0.3em] text-[#E61A21] uppercase">
              SporThink Pro
            </span>
            <ChevronRight size={10} className="text-zinc-600" />
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Yönetici
            </span>
          </div>

          <div className="relative mt-1">
            <h1 className="st-page-title">{title}</h1>
            <div className="h-[2px] w-12 bg-[#E61A21] mt-2 rounded-full" />
          </div>
          
          <p className={`text-[11px] mt-2 font-medium tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {subtitle}
          </p>
        </div>

        {/* ── RIGHT: CONTROLS ───────────────────────────────────── */}
        <div className="flex items-center gap-4">
          {/* Quick Search - إضافة جديدة تعطي طابعاً إدارياً */}
          <div className={`hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border ${isDark ? 'bg-white/5 border-white/5 text-zinc-500' : 'bg-black/5 border-black/5 text-zinc-400'}`}>
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Hızlı ara..." 
              className="bg-transparent border-none outline-none w-32 focus:w-48 transition-all"
            />
            <span className="opacity-30">⌘K</span>
          </div>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`
              }}
            >
              <Bell size={20} className={unreadCount > 0 ? "text-[#E61A21] animate-pulse" : "text-zinc-500"} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E61A21] text-white text-[10px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-red-500/40">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-4 w-80 rounded-2xl overflow-hidden z-[100] ${isDark ? 'bg-[#0F0F12] border-white/10' : 'bg-white border-black/10 shadow-2xl'} border`}>
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#E61A21]/10 to-transparent">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E61A21]">Bildirimler</span>
                  <LayoutGrid size={14} className="text-zinc-600" />
                </div>
                <div className="max-height-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center opacity-30 text-xs font-bold uppercase tracking-tighter">Henüz bir şey yok</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-colors ${n.is_read ? 'opacity-40' : ''}`}
                      >
                        <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{n.title}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Card */}
          <div className="st-glass-card px-4 py-2 rounded-2xl flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-bold opacity-40 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Yönetici</span>
              <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>{userName}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E61A21] to-[#8a0000] flex items-center justify-center text-white font-black shadow-lg shadow-red-500/20">
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}