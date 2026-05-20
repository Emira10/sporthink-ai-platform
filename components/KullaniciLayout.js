import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/router";

export default function KullaniciLayout({ children, pageTitle = "Kullanıcı Paneli" }) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      fetchNotifications();
    }
  }, []);

  async function fetchNotifications() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch(
    `/api/notifications/list?user_id=${userId}`
  );

  const json = await res.json();

  if (json.ok) {
    setNotifications(json.notifications || []);
  }
}

  const menu = [
    { icon: "▦", label: "Dashboard", path: "/dashboard", group: "main" },
    { icon: "▥", label: "Eğitimlerim", path: "/kullanici/egitimler", group: "main" },
    { icon: "◎", label: "Ölçme & Değerlendirme", path: "/kullanici/olcme-degerlendirme", group: "main" },
    { icon: "♕", label: "Oyunlaştırma", path: "/kullanici/oyun-sosyal", group: "main" },
    { icon: "⚙", label: "AI", path: "/kullanici/ai", group: "main" },
    { icon: "▱", label: "Geri Bildirim", path: "/kullanici/geri-bildirim", group: "management" },
    { icon: "♧", label: "Duyurular", path: "/kullanici/duyurular", group: "management" },
    { icon: "▥", label: "Raporlama", path: "/kullanici/raporlama", group: "management" },
    { icon: "▣", label: "Sertifikalarım", path: "/kullanici/sertifikalar", group: "management" },
    { icon: "◉", label: "Profilim", path: "/kullanici/profilim", group: "management",},
  ];

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const renderMenuItem = (item) => {
    const active = router.pathname === item.path;

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => router.push(item.path)}
        className={`group relative w-full flex items-center gap-3 rounded-none md:rounded-xl px-4 py-3 text-left transition-all ${
          active
            ? isDark
              ? "bg-[#E9572E]/10 text-[#E9572E]"
              : "bg-[#FBE9E3] text-[#E9572E]"
            : isDark
            ? "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#E9572E]" />
        )}

        <span
          className={`w-5 text-center text-[18px] font-black leading-none ${
            active ? "text-[#E9572E]" : ""
          }`}
        >
          {item.icon}
        </span>

        <span className="hidden md:block text-[13px] font-bold">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div
      className={`min-h-screen font-sans transition-all ${
        isDark ? "bg-[#1f201d] text-white" : "bg-[#F5F5F5] text-black"
      }`}
    >
      <aside
        className={`fixed left-0 top-0 h-screen w-24 md:w-64 z-50 border-r ${
          isDark
            ? "bg-[#262722] border-white/10"
            : "bg-white border-zinc-200"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto overscroll-contain scrollbar-hide">
          <div
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 px-5 py-6 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 bg-[#E9572E] rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-orange-900/20">
              S
            </div>

            <span
              className={`hidden md:block font-black tracking-tight text-sm uppercase ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              SPORT<span className="text-[#E9572E]">THINK</span>
            </span>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {menu.filter((item) => item.group === "main").map(renderMenuItem)}

            <div className="hidden md:block px-4 pt-7 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Yönetim
            </div>

            {menu.filter((item) => item.group === "management").map(renderMenuItem)}
          </nav>

          <div
            className={`mx-3 mt-6 pt-4 pb-5 border-t shrink-0 ${
              isDark ? "border-white/10" : "border-zinc-200"
            }`}
          >
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 transition-all ${
                isDark
                  ? "border border-white/20 text-yellow-400 hover:bg-white/5"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
              <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-3 w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all"
            >
              <span className="text-xl">🚪</span>
              <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">
                Çıkış
              </span>
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-24 md:ml-64 p-8 md:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
  <div>
    <p className="text-[#E9572E] text-[10px] font-black tracking-[0.35em] uppercase mb-3">
      SporThink Kullanıcı Paneli
    </p>

    <h1 className="text-4xl font-black italic uppercase">
      {pageTitle}
    </h1>
  </div>

  <div className="relative">
    <button
      onClick={() => setShowNotifications(!showNotifications)}
      className={`relative w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${
        isDark
          ? "bg-white/[0.04] border-white/10 hover:bg-white/10"
          : "bg-white border-zinc-200"
      }`}
    >
      <Bell className="w-6 h-6 text-[#E9572E]" />

      {notifications.filter((n) => !n.is_read).length > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E9572E] text-white text-[10px] flex items-center justify-center font-black">
          {notifications.filter((n) => !n.is_read).length}
        </span>
      )}
    </button>

    {showNotifications && (
      <div className={`absolute right-0 mt-4 w-[360px] rounded-[2rem] border shadow-2xl p-4 z-50 ${
        isDark
          ? "bg-slate-950 border-white/10"
          : "bg-white border-zinc-200"
      }`}>
        <h3 className="text-lg font-black mb-4">
          Bildirimler
        </h3>

        <div className="space-y-3 max-h-[450px] overflow-auto">
          {notifications.length === 0 ? (
            <p className="text-sm font-bold text-zinc-500 text-center py-6">
              Bildirim bulunamadı
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-2xl ${
                  isDark ? "bg-white/5" : "bg-zinc-50"
                }`}
              >
                <p className="font-black">{n.title}</p>

                <p className="text-xs text-zinc-500 mt-1">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </div>
</div>

        {children}
      </main>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}