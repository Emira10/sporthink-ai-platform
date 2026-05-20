import KullaniciLayout from "../../components/KullaniciLayout";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  Pin,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Trophy,
  MonitorCog,
  CheckCircle2,
  Clock,
} from "lucide-react";

const typeMap = {
  acil: {
    label: "Acil",
    icon: AlertTriangle,
    color: "text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  },
  egitim: {
    label: "Eğitim",
    icon: BookOpen,
    color: "text-blue-500 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  sinav: {
    label: "Sınav",
    icon: ClipboardList,
    color: "text-amber-500 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20",
  },
  basari: {
    label: "Başarı",
    icon: Trophy,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  sistem: {
    label: "Sistem",
    icon: MonitorCog,
    color: "text-violet-500 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20",
  },
};

const demoDuyurular = [
  {
    id: 1,
    title: "Yeni eğitim modülü yayında",
    message: "Power BI eğitim içeriği kullanıcı paneline eklendi.",
    sender_name: "Yönetici",
    sender_role: "Yönetici",
    type: "egitim",
    priority: "normal",
    is_pinned: true,
    is_read: false,
    created_at: "2026-05-14 18:30",
  },
  {
    id: 2,
    title: "Quiz son teslim tarihi",
    message: "Haftalık quiz için son gönderim tarihi bu akşam.",
    sender_name: "Eğitmen",
    sender_role: "Eğitmen",
    type: "sinav",
    priority: "high",
    is_pinned: false,
    is_read: false,
    created_at: "2026-05-14 12:10",
  },
  {
    id: 3,
    title: "Sistem bakım bildirimi",
    message: "Platform kısa süreli bakım moduna alınacaktır.",
    sender_name: "SporThink",
    sender_role: "Sistem",
    type: "sistem",
    priority: "medium",
    is_pinned: false,
    is_read: true,
    created_at: "2026-05-13 21:00",
  },
];

export default function KullaniciDuyurular() {
  const [duyurular, setDuyurular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchDuyurular();
  }, []);

  async function fetchDuyurular() {
    try {
      setLoading(true);
      const userId =
        localStorage.getItem("userId") ||
        localStorage.getItem("userName") ||
        "demo-user";

      const res = await fetch(
        `/api/duyurular?target_role=kullanici&user_id=${encodeURIComponent(userId)}`
      );

      const json = await res.json();

      if ((json?.ok || json?.success) && Array.isArray(json.duyurular)) {
        setDuyurular(json.duyurular);
      } else if ((json?.ok || json?.success) && Array.isArray(json.data)) {
        setDuyurular(json.data);
      } else {
        setDuyurular(demoDuyurular);
      }
    } catch (err) {
      setDuyurular(demoDuyurular);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    setDuyurular((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );

    try {
      await fetch("/api/duyurular/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duyuru_id: id,
          user_id:
            localStorage.getItem("userId") ||
            localStorage.getItem("userName") ||
            "demo-user",
          action: "read",
        }),
      });
    } catch {}
  }

  async function togglePin(id, currentPinned) {
    try {
      const res = await fetch("/api/duyurular/pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          is_pinned: currentPinned,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Pin işlemi başarısız");
      }

      setDuyurular((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                is_pinned: !currentPinned,
              }
            : item
        )
      );
    } catch (err) {
      console.error("PIN ERROR:", err);
      alert("Pin işlemi başarısız!");
    }
  }

  const filtered = useMemo(() => {
    return duyurular
      .filter((item) => activeType === "all" || item.type === activeType)
      .filter((item) => {
        const text = `${item.title || ""} ${item.message || item.content || item.description || ""} ${item.sender_name || ""}`.toLowerCase();
        return text.includes(query.toLowerCase());
      })
      .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));
  }, [duyurular, activeType, query]);

  const unreadCount = duyurular.filter((d) => !d.is_read).length;
  const pinnedCount = duyurular.filter((d) => d.is_pinned).length;

  return (
    <KullaniciLayout
      pageTitle="Duyurular"
      pageSubtitle="Güncel bildirimler ve önemli duyurular"
    >
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white px-5 py-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div>
              {/* Status badge — matches Dashboard's "Kisisel Komuta Merkezi" badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 mb-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                  SporThink Kullanıcı Paneli
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Duyuru Merkezi
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Eğitim, sınav ve sistem bildirimlerini buradan takip edebilirsin.
              </p>
            </div>

            {/* Mini stats — matches Dashboard stat cards style */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Toplam" value={duyurular.length} />
              <MiniStat label="Yeni" value={unreadCount} />
              <MiniStat label="Sabit" value={pinnedCount} />
            </div>
          </div>

          {/* ── Search + Filter Bar ── */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 p-4 shadow-md shadow-slate-200/40 dark:shadow-black/15">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Duyuru ara..."
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-rose-400 dark:focus:border-rose-500/60 transition-colors"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-0.5">
                <FilterButton
                  active={activeType === "all"}
                  onClick={() => setActiveType("all")}
                >
                  Tümü
                </FilterButton>

                {Object.entries(typeMap).map(([key, item]) => (
                  <FilterButton
                    key={key}
                    active={activeType === key}
                    onClick={() => setActiveType(key)}
                  >
                    {item.label}
                  </FilterButton>
                ))}
              </div>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-[1fr_268px] gap-5">

            {/* Announcement list */}
            <div className="space-y-3">
              {loading ? (
                <EmptyBox title="Yükleniyor..." text="Duyurular getiriliyor." />
              ) : filtered.length === 0 ? (
                <EmptyBox
                  title="Duyuru bulunamadı"
                  text="Arama veya filtre sonucuna uygun duyuru yok."
                />
              ) : (
                filtered.map((item) => (
                  <AnnouncementCard
                    key={item.id}
                    item={item}
                    onRead={markAsRead}
                    onPin={togglePin}
                  />
                ))
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-3">
              <SideCard
                title="Bugünün Özeti"
                items={[
                  `${unreadCount} okunmamış duyuru`,
                  `${pinnedCount} sabitlenmiş bildirim`,
                  "Eğitim ve sınav akışı aktif",
                ]}
              />
            </aside>
          </div>
        </div>
      </div>
    </KullaniciLayout>
  );
}

/* ─────────────────────────────────────────────
   AnnouncementCard
───────────────────────────────────────────── */
function AnnouncementCard({ item, onRead, onPin }) {
  const config = typeMap[item.type] || typeMap.sistem;
  const Icon = config.icon;

  return (
    <div
      className={`group rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        item.is_read
          ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 shadow-md shadow-slate-200/30 dark:shadow-black/10"
          : "bg-rose-50/60 dark:bg-rose-500/[0.06] border-rose-200 dark:border-rose-500/25 shadow-md shadow-rose-200/30 dark:shadow-rose-900/10"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div
          className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${config.color}`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              onClick={() => onPin(item.id, item.is_pinned)}
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-200 ${
                item.is_pinned
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/20"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Pin size={10} />
              {item.is_pinned ? "Sabit" : "Sabitle"}
            </button>

            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full border ${config.color}`}
            >
              {config.label}
            </span>

            {!item.is_read && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/20">
                Yeni
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
            {item.title}
          </h3>

          {/* Message */}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {item.message || item.content || item.description}
          </p>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <span>
                {item.sender_role}: {item.sender_name}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> {item.created_at}
              </span>
            </div>

            {!item.is_read ? (
              <button
                onClick={() => onRead(item.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-sm shadow-rose-500/20 hover:shadow-md hover:shadow-rose-500/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                <CheckCircle2 size={13} />
                Okundu
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                <CheckCircle2 size={13} />
                Okundu
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MiniStat — matches Dashboard stat card style
───────────────────────────────────────────── */
function MiniStat({ label, value }) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-md shadow-slate-200/40 dark:shadow-black/15 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FilterButton — matches Dashboard panel nav style
───────────────────────────────────────────── */
function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all duration-300 whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-rose-500 to-orange-500 border-transparent text-white shadow-md shadow-rose-500/20"
          : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-rose-300 dark:hover:border-rose-500/40"
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   SideCard — matches Dashboard section card style
───────────────────────────────────────────── */
function SideCard({ title, items }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 p-5 shadow-md shadow-slate-200/40 dark:shadow-black/15">
      <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
        <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
          <Bell size={14} className="text-rose-500" />
        </div>
        {title}
      </h3>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-lg px-3 py-2.5"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EmptyBox
───────────────────────────────────────────── */
function EmptyBox({ title, text }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 p-8 text-center shadow-md shadow-slate-200/30 dark:shadow-black/10">
      <p className="font-black text-slate-900 dark:text-white">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{text}</p>
    </div>
  );
}