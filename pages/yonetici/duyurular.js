import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Flame,
  Megaphone,
  MessageCircle,
  Paperclip,
  Pin,
  Plus,
  Rocket,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  ThumbsUp,
  Trophy,
  Users,
  Video,
  Wand2,
  Wrench,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

/* ─── helpers ────────────────────────────────────────────────── */
const cx = (...a) => a.filter(Boolean).join(" ");

/* type → accent config */
const TYPE_CONFIG = {
  acil:   { label: "Acil",   color: "red",     dot: "#E61A21" },
  egitim: { label: "Eğitim", color: "blue",    dot: "#3B82F6" },
  sinav:  { label: "Sınav",  color: "amber",   dot: "#F59E0B" },
  basari: { label: "Başarı", color: "emerald", dot: "#10B981" },
  sistem: { label: "Sistem", color: "zinc",    dot: "#71717A" },
};

function typeStyle(type, isDark) {
  const map = {
    blue:    isDark ? "bg-blue-500/10 text-blue-400"      : "bg-blue-50 text-blue-700",
    red:     isDark ? "bg-red-500/10 text-red-400"        : "bg-red-50 text-red-600",
    emerald: isDark ? "bg-emerald-500/10 text-emerald-400": "bg-emerald-50 text-emerald-700",
    violet:  isDark ? "bg-violet-500/10 text-violet-400"  : "bg-violet-50 text-violet-700",
    amber:   isDark ? "bg-amber-500/10 text-amber-400"    : "bg-amber-50 text-amber-700",
    zinc:    isDark ? "bg-zinc-700/50 text-zinc-400"      : "bg-zinc-100 text-zinc-500",
  };
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.sistem;
  return { cls: map[cfg.color] || map.zinc, dot: cfg.dot, label: cfg.label };
}

function priorityStyle(priority, isDark) {
  if (priority === "Kritik" || priority === "Yüksek")
    return isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600";
  if (priority === "Orta")
    return isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700";
  return isDark ? "bg-zinc-700/50 text-zinc-400" : "bg-zinc-100 text-zinc-500";
}

/* compact KPI tile */
function KpiTile({ label, value, icon: Icon, isDark }) {
  return (
    <div
      className={cx(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
        isDark
          ? "bg-[#111] border-white/[0.07] hover:border-white/[0.14]"
          : "bg-white border-zinc-200 shadow-sm hover:shadow-md"
      )}
    >
      <div
        className={cx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isDark ? "bg-white/[0.06]" : "bg-zinc-50"
        )}
      >
        <Icon size={14} className="text-[#E61A21]" />
      </div>
      <div className="min-w-0">
        <p className={cx("text-[10px] font-medium truncate", isDark ? "text-zinc-500" : "text-zinc-400")}>
          {label}
        </p>
        <p className={cx("text-base font-bold tabular-nums leading-none mt-0.5", isDark ? "text-white" : "text-zinc-900")}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* single announcement row */
function AnnouncementCard({ item, isDark, onInteract, onSelect }) {
  const ts = typeStyle(item.type, isDark);
  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    : "";

  return (
    <div
  onClick={() => onSelect(item)}
  onMouseEnter={() => onInteract(item.id, "view")}
      className={cx(
        "group relative rounded-xl border transition-all duration-200",
        isDark
          ? "bg-[#111] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.025]"
          : "bg-white border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300"
      )}
      style={{ borderLeft: `3px solid ${ts.dot}` }}
    >
      <div className="flex gap-4 p-4">
        {/* icon */}
        <div
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ background: ts.dot + "18" }}
        >
          {item.icon || "📢"}
        </div>

        {/* body */}
        <div className="flex-1 min-w-0">
          {/* meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={cx("text-[10px] font-semibold px-2 py-0.5 rounded-md", ts.cls)}>
              {ts.label}
            </span>
            {item.priority && (
              <span className={cx("text-[10px] font-semibold px-2 py-0.5 rounded-md", priorityStyle(item.priority, isDark))}>
                {item.priority}
              </span>
            )}
            <span className={cx("text-[10px] ml-auto", isDark ? "text-zinc-600" : "text-zinc-400")}>
              {date}
            </span>
          </div>

          {/* title */}
          <h3 className={cx("text-sm font-semibold leading-snug mb-1", isDark ? "text-white" : "text-zinc-900")}>
            {item.title}
          </h3>

          {/* content */}
          <p className={cx("text-xs leading-relaxed line-clamp-2", isDark ? "text-zinc-500" : "text-zinc-500")}>
            {item.content}
          </p>

          {/* footer */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
  onClick={(e) => {
    e.stopPropagation();
    onSelect(item);
  }}
  className="flex items-center gap-1 text-[11px] text-[#E61A21] font-semibold"
>
  <Users size={11} />
  {item.viewer_count || 0} Kişi Okudu
</button>
            <span className={cx("flex items-center gap-1 text-[11px]", isDark ? "text-zinc-600" : "text-zinc-400")}>
              <MessageCircle size={11} />
              {item.author || "Yönetici"}
            </span>

            {/* action buttons — appear on hover */}
            <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onInteract(item.id, "reaction")}
                className={cx(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium border transition-colors",
                  isDark
                    ? "border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                )}
              >
                <ThumbsUp size={11} />
                {item.reactions || 0}
              </button>
              <button
                onClick={() => onInteract(item.id, "click")}
                className={cx(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium border transition-colors",
                  isDark
                    ? "border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                )}
              >
                <Eye size={11} />
                {item.views || 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DuyurularPage() {
  const [activeType, setActiveType] = useState("all");
  const [showComposer, setShowComposer] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcementViewers, setAnnouncementViewers] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0, views: 0, clicks: 0, reactions: 0, readRate: 0,
  });
  const [form, setForm] = useState({
    title: "", description: "", type: "egitim",
    priority: "Normal", target_role: "all", pinned: false, module: "general",
  });

  const [messageForm, setMessageForm] = useState({
  subject: "",
  message: "",
  target: "ogrenci",
});

const [threads, setThreads] = useState([]);
const [selectedThread, setSelectedThread] = useState(null);
const [threadMessages, setThreadMessages] = useState([]);
const [replyText, setReplyText] = useState("");
const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
  fetchAnnouncements();
  fetchStats();
  fetchCommunicationThreads();
}, []);

  async function fetchAnnouncements() {
    setLoading(true);
    const res = await fetch("/api/duyurular");
    const json = await res.json();
    if (json.success) setAnnouncements(json.data || []);
    setLoading(false);
  }

  async function fetchStats() {
    const res = await fetch("/api/duyurular/stats");
    const json = await res.json();
    if (json.success) setStats(json.data);
  }

  const announcementTypes = [
  { key: "all",    label: "Tümü",   icon: Megaphone },
  { key: "acil",   label: "Acil",   icon: ShieldAlert },
  { key: "egitim", label: "Eğitim", icon: FileText },
  { key: "sinav",  label: "Sınav",  icon: CalendarDays },
  { key: "basari", label: "Başarı", icon: Trophy },
  { key: "sistem", label: "Sistem", icon: Wrench },
];

  const filteredAnnouncements = useMemo(() => {
    if (activeType === "all") return announcements;
    return announcements.filter((item) => item.type === activeType);
  }, [activeType, announcements]);

  const pinned = announcements
  .filter((a) => a.is_pinned || a.pinned)
  .slice(0, 2);

  async function createAnnouncement() {
    if (!form.title.trim() || !form.description.trim()) {
      alert("Başlık ve açıklama zorunlu.");
      return;
    }
    const res = await fetch("/api/duyurular/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  title: form.title,
  description: form.description,
  message: form.description,
  content: form.description,

  type: form.type,
  priority: form.priority,

  target_role: form.target_role === "all" ? "kullanici,egitmen" : form.target_role,

  pinned: form.pinned || false,
  is_pinned: form.pinned || false,

  module: form.module || "general",

  sender_name: localStorage.getItem("userName") || "Yönetici",
  sender_role: "Yönetici",
  author: localStorage.getItem("userName") || "Yönetici",
}),
    });
    const json = await res.json();
    if (!json.success) { alert(json.message || "Duyuru oluşturulamadı."); return; }
    setShowComposer(false);
    setForm({ title: "", description: "", type: "egitim", priority: "Normal", target_role: "all", pinned: false, module: "general" });
    fetchAnnouncements();
  }

  async function registerInteraction(id, action) {
    try {
      await fetch("/api/duyurular/interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  id,
  action,
  user_id: localStorage.getItem("userId") || "yonetici-1",
  user_name: localStorage.getItem("userName") || "Yönetici",
  role: "yonetici",
}),
      });
      fetchStats();
    } catch (err) { console.error(err); }
  }

  async function fetchAnnouncementViewers(id) {
  const res = await fetch(`/api/duyurular/viewers?id=${id}`);
  const json = await res.json();

  if (json.success) {
    setAnnouncementViewers(json.viewers || []);
    setSelectedAnnouncement((prev) =>
  prev
    ? {
        ...prev,
        viewer_count: json.count || 0,
      }
    : prev
);
  } else {
    setAnnouncementViewers([]);
  }
}

  async function fetchCommunicationThreads() {
  const userId = localStorage.getItem("userId") || "yonetici-1";

  const res = await fetch(
    `/api/communication/my-threads?role=yonetici&user_id=${userId}`
  );

  const json = await res.json();

  if (json.success) {
    setThreads(json.data || []);
  }
}

async function sendRealMessage() {
  if (!messageForm.subject.trim() || !messageForm.message.trim()) {
    alert("Konu ve mesaj zorunlu.");
    return;
  }

  setMessageLoading(true);

  const userId = localStorage.getItem("userId") || "yonetici-1";
  const userName = localStorage.getItem("userName") || "Yönetici";

  let recipients = [];

  if (messageForm.target === "ogrenci") {
    recipients = [{ user_id: null, user_name: "Tüm Öğrenciler", role: "ogrenci" }];
  }

  if (messageForm.target === "egitmen") {
    recipients = [{ user_id: null, user_name: "Tüm Eğitmenler", role: "egitmen" }];
  }

  if (messageForm.target === "all") {
    recipients = [
      { user_id: null, user_name: "Tüm Öğrenciler", role: "ogrenci" },
      { user_id: null, user_name: "Tüm Eğitmenler", role: "egitmen" },
    ];
  }

  const res = await fetch("/api/communication/create-thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: messageForm.subject,
      message: messageForm.message,
      created_by_id: userId,
      created_by_name: userName,
      created_by_role: "yonetici",
      recipients,
      module: "duyurular",
    }),
  });

  const json = await res.json();

  setMessageLoading(false);

  if (!json.success) {
    alert(json.message || "Mesaj gönderilemedi.");
    return;
  }

  setMessageForm({ subject: "", message: "", target: "ogrenci" });
  fetchCommunicationThreads();
  alert("Mesaj başarıyla gönderildi.");
}

async function openThread(thread) {
  setSelectedThread(thread);

  const res = await fetch(
    `/api/communication/thread-messages?thread_id=${thread.id}`
  );

  const json = await res.json();

  if (json.success) {
    setThreadMessages(json.data || []);
  }

  await fetch("/api/communication/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: thread.id,
      user_id: localStorage.getItem("userId") || "yonetici-1",
      role: "yonetici",
    }),
  });
}

async function sendReply() {
  if (!selectedThread || !replyText.trim()) return;

  const res = await fetch("/api/communication/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: selectedThread.id,
      sender_id: localStorage.getItem("userId") || "yonetici-1",
      sender_name: localStorage.getItem("userName") || "Yönetici",
      sender_role: "yonetici",
      message: replyText,
    }),
  });

  const json = await res.json();

  if (!json.success) {
    alert(json.message || "Yanıt gönderilemedi.");
    return;
  }

  setReplyText("");
  openThread(selectedThread);
}

  return (
    <YoneticiLayout
      pageTitle="DUYURULAR"
      pageSubtitle="Kurumsal iletişim, eğitim bilgilendirmeleri ve sistem uyarılarını tek merkezden yönetin."
    >
      {({ isDark }) => (
        <div className="space-y-5">

          {/* ── TOPBAR ─────────────────────────────────────────── */}
          <section
            className={cx(
              "flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4",
              isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cx("flex h-9 w-9 items-center justify-center rounded-lg", isDark ? "bg-[#E61A21]/10" : "bg-red-50")}>
                <Bell size={16} className="text-[#E61A21]" />
              </div>
              <div>
                <h1 className={cx("text-base font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                  Duyuru Merkezi
                </h1>
                <p className={cx("text-xs mt-0.5", isDark ? "text-zinc-500" : "text-zinc-400")}>
                  {announcements.length} aktif duyuru
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComposer(!showComposer)}
                className={cx(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all",
                  showComposer
                    ? "bg-zinc-200 text-zinc-700"
                    : "bg-[#E61A21] text-white hover:opacity-90 shadow-sm shadow-red-600/20"
                )}
              >
                {showComposer ? <X size={13} /> : <Plus size={13} />}
                {showComposer ? "İptal" : "Yeni Duyuru"}
              </button>
            </div>
          </section>

          {/* ── KPI ROW ────────────────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiTile label="Toplam Duyuru" value={stats.total}             icon={Megaphone} isDark={isDark} />
            <KpiTile label="Okunma Oranı"  value={`%${stats.readRate}`}   icon={Eye}       isDark={isDark} />
            <KpiTile label="Tıklanma"      value={stats.clicks}           icon={Target}    isDark={isDark} />
            <KpiTile label="Etkileşim"     value={stats.reactions}        icon={ThumbsUp}  isDark={isDark} />
          </section>

          <section
  className={cx(
    "rounded-xl border overflow-hidden",
    isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
  )}
>
  <div className={cx("px-5 py-4 border-b", isDark ? "border-white/[0.07]" : "border-zinc-100")}>
    <h2 className={cx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
      Yönetici Mesaj Merkezi
    </h2>
    <p className={cx("text-xs mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
      Yönetici, eğitmen ve öğrenciler arasında gerçek mesajlaşma sistemi.
    </p>
  </div>

  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-5">
    <div className="space-y-3">
      <input
        value={messageForm.subject}
        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
        placeholder="Mesaj konusu..."
        className={cx(
          "w-full rounded-lg border px-3 py-2 text-sm outline-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
        )}
      />

      <select
        value={messageForm.target}
        onChange={(e) => setMessageForm({ ...messageForm, target: e.target.value })}
        className={cx(
          "w-full rounded-lg border px-3 py-2 text-sm outline-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
        )}
      >
        <option value="ogrenci">Öğrencilere Gönder</option>
        <option value="egitmen">Eğitmenlere Gönder</option>
        <option value="all">Eğitmen + Öğrenci</option>
      </select>

      <textarea
        value={messageForm.message}
        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
        placeholder="Mesaj içeriği..."
        rows={5}
        className={cx(
          "w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
        )}
      />

      <button
        onClick={sendRealMessage}
        disabled={messageLoading}
        className="w-full rounded-lg bg-[#E61A21] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {messageLoading ? "Gönderiliyor..." : "Mesaj Gönder"}
      </button>
    </div>

    <div className="space-y-2">
      <h3 className={cx("text-xs font-semibold", isDark ? "text-zinc-400" : "text-zinc-500")}>
        Mesaj Konuları
      </h3>

      {threads.length === 0 ? (
        <p className={cx("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>
          Henüz mesaj yok.
        </p>
      ) : (
        threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => openThread(thread)}
            className={cx(
              "w-full text-left rounded-lg border px-3 py-2 transition",
              selectedThread?.id === thread.id
                ? "border-[#E61A21] bg-[#E61A21]/10"
                : isDark
                ? "border-white/[0.08] hover:bg-white/[0.04]"
                : "border-zinc-200 hover:bg-zinc-50"
            )}
          >
            <p className={cx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
              {thread.subject}
            </p>
            <p className={cx("text-[11px] mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
              {thread.created_by_role} · {new Date(thread.created_at).toLocaleDateString("tr-TR")}
            </p>
          </button>
        ))
      )}
    </div>

    <div className={cx("rounded-lg border p-3", isDark ? "border-white/[0.08]" : "border-zinc-200")}>
      <h3 className={cx("text-xs font-semibold mb-3", isDark ? "text-zinc-400" : "text-zinc-500")}>
        Konuşma Detayı
      </h3>

      {!selectedThread ? (
        <p className={cx("text-xs", isDark ? "text-zinc-600" : "text-zinc-400")}>
          Görüntülemek için bir mesaj seçin.
        </p>
      ) : (
        <>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {threadMessages.map((msg) => (
              <div
                key={msg.id}
                className={cx(
                  "rounded-lg px-3 py-2 border",
                  msg.sender_role === "yonetici"
                    ? "bg-[#E61A21]/10 border-[#E61A21]/20"
                    : isDark
                    ? "bg-white/[0.04] border-white/[0.08]"
                    : "bg-zinc-50 border-zinc-200"
                )}
              >
                <p className={cx("text-[11px] font-semibold", isDark ? "text-zinc-300" : "text-zinc-700")}>
                  {msg.sender_name} · {msg.sender_role}
                </p>
                <p className={cx("text-xs mt-1", isDark ? "text-zinc-400" : "text-zinc-600")}>
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Yanıt yaz..."
              className={cx(
                "flex-1 rounded-lg border px-3 py-2 text-xs outline-none",
                isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
              )}
            />

            <button
              onClick={sendReply}
              className="rounded-lg bg-[#E61A21] px-3 py-2 text-xs font-bold text-white"
            >
              Yanıtla
            </button>
          </div>
        </>
      )}
    </div>
  </div>
</section>

          {/* ── COMPOSER ───────────────────────────────────────── */}
          {showComposer && (
            <section
              className={cx(
                "rounded-xl border overflow-hidden",
                isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              {/* composer header */}
              <div
                className={cx(
                  "flex items-center gap-2.5 px-5 py-3.5 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <Send size={14} className="text-[#E61A21]" />
                <h2 className={cx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                  Yeni Duyuru Oluştur
                </h2>
                <p className={cx("text-xs ml-1", isDark ? "text-zinc-600" : "text-zinc-400")}>
                  · Hedef kitle ve öncelik seçin
                </p>
              </div>

              <div className="p-5">
                {/* row 1: title + selects */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Duyuru başlığı..."
                    className={cx(
                      "md:col-span-4 rounded-lg border px-3 py-2 text-sm outline-none transition-colors",
                      isDark
                        ? "bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-[#E61A21]/40"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#E61A21]/40 focus:bg-white"
                    )}
                  />

                  <div className="md:col-span-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
  Tür
</div>
<div className="md:col-span-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
  Hedef
</div>
<div className="md:col-span-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
  Modül
</div>

                  {[
                    {
                      val: form.type,
                      set: (v) => setForm({ ...form, type: v }),
                      opts: ["egitim", "sinav", "acil", "basari", "sistem"],
                      labels: ["Eğitim", "Sınav", "Acil", "Başarı", "Sistem"],
                    },
                    {
  val: form.target_role,
  set: (v) => setForm({ ...form, target_role: v }),
  opts: ["all", "kullanici", "egitmen"],
  labels: ["Herkes", "Öğrenciler", "Eğitmenler"],
},
                    {
                      val: form.module,
                      set: (v) => setForm({ ...form, module: v }),
                      opts: ["general", "egitim", "gamification", "dashboard", "ai"],
                      labels: ["Genel", "Eğitimler", "Oyunlaştırma", "Dashboard", "AI Panel"],
                    },
                  ].map((s, i) => (
                    <select
                      key={i}
                      value={s.val}
                      onChange={(e) => s.set(e.target.value)}
                      className={cx(
                        "md:col-span-2 rounded-lg border px-3 py-2 text-sm outline-none transition-colors cursor-pointer",
                        isDark
                          ? "bg-white/[0.04] border-white/[0.08] text-zinc-200 focus:border-[#E61A21]/40"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700 focus:border-[#E61A21]/40 focus:bg-white"
                      )}
                    >
                      {s.opts.map((o, j) => (
                        <option key={o} value={o}>{s.labels[j]}</option>
                      ))}
                    </select>
                  ))}

                  {/* priority toggle inline */}
                  <div className="md:col-span-2 flex items-center gap-1.5">
                    {["Normal", "Orta", "Yüksek"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm({ ...form, priority: p })}
                        className={cx(
                          "flex-1 rounded-lg py-2 text-[11px] font-semibold border transition-all",
                          form.priority === p
                            ? "bg-[#E61A21] border-[#E61A21] text-white"
                            : isDark
                            ? "border-white/[0.08] text-zinc-500 hover:text-white"
                            : "border-zinc-200 text-zinc-400 hover:bg-zinc-50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* row 2: textarea */}
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Duyuru içeriği..."
                  rows={3}
                  className={cx(
                    "w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none transition-colors",
                    isDark
                      ? "bg-white/[0.04] border-white/[0.08] text-white placeholder-zinc-600 focus:border-[#E61A21]/40"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#E61A21]/40 focus:bg-white"
                  )}
                />

                {/* row 3: actions */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {[
                    { label: "Dosya Ekle", icon: Paperclip },
                    { label: "Video / Link", icon: Video },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      className={cx(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        isDark
                          ? "border-white/[0.08] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                          : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                      )}
                    >
                      <btn.icon size={13} />
                      {btn.label}
                    </button>
                  ))}

                  <button
                    onClick={createAnnouncement}
                    className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#E61A21] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-sm shadow-red-600/20"
                  >
                    <Rocket size={13} />
                    Yayınla
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── PINNED ─────────────────────────────────────────── */}
          {pinned.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Pin size={12} className="text-[#E61A21]" />
                <span className={cx("text-[11px] font-semibold uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-400")}>
                  Sabit Duyurular
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinned.map((item) => {
                  const ts = typeStyle(item.type, isDark);
                  const date = item.created_at
                    ? new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
                    : "";
                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => registerInteraction(item.id, "view")}
                      className={cx(
                        "relative rounded-xl border px-5 py-4 transition-all",
                        isDark
                          ? "bg-[#111] border-white/[0.07] hover:border-white/[0.14]"
                          : "bg-white border-zinc-200 shadow-sm hover:shadow-md"
                      )}
                      style={{ borderLeft: `3px solid ${ts.dot}` }}
                    >
                      {/* pin badge */}
                      <div className={cx(
                        "absolute top-3.5 right-3.5 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                        isDark ? "bg-white/[0.06] text-zinc-400" : "bg-zinc-100 text-zinc-500"
                      )}>
                        <Pin size={9} />
                        Sabit
                      </div>

                      <div className="flex items-start gap-3 pr-14">
                        <div
                          className="text-xl mt-0.5 w-9 h-9 flex items-center justify-center rounded-lg shrink-0"
                          style={{ background: ts.dot + "18" }}
                        >
                          {item.icon || "📢"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={cx("text-[10px] font-semibold px-2 py-0.5 rounded-md", ts.cls)}>
                              {ts.label}
                            </span>
                            <span className={cx("text-[10px]", isDark ? "text-zinc-600" : "text-zinc-400")}>{date}</span>
                          </div>
                          <h3 className={cx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                            {item.title}
                          </h3>
                          <p className={cx("text-xs mt-1 line-clamp-2 leading-relaxed", isDark ? "text-zinc-500" : "text-zinc-500")}>
                            {item.content}
                          </p>
                          <div className="flex gap-3 mt-2.5">
                            <span className={cx("text-[10px]", isDark ? "text-zinc-600" : "text-zinc-400")}>
                              {item.target_dept || "Tümü"}
                            </span>
                            <span className={cx("text-[10px]", isDark ? "text-zinc-600" : "text-zinc-400")}>
                              {item.priority || "Normal"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── FEED + ANALYTICS GRID ──────────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Feed — left 2 cols */}
            <div className="xl:col-span-2 space-y-2">

              {/* filter tabs */}
              <div
                className={cx(
                  "flex flex-wrap gap-1 mb-3 rounded-xl border p-1.5",
                  isDark ? "bg-[#111] border-white/[0.07]" : "bg-zinc-50 border-zinc-200"
                )}
              >
                {announcementTypes.map((type) => {
                  const Icon = type.icon;
                  const active = activeType === type.key;
                  return (
                    <button
                      key={type.key}
                      onClick={() => setActiveType(type.key)}
                      className={cx(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                        active
                          ? "bg-[#E61A21] text-white shadow-sm"
                          : isDark
                          ? "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]"
                          : "text-zinc-500 hover:text-zinc-700 hover:bg-white"
                      )}
                    >
                      <Icon size={12} />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* announcement cards */}
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cx(
                        "h-24 rounded-xl border animate-pulse",
                        isDark ? "bg-white/[0.03] border-white/[0.05]" : "bg-zinc-100 border-zinc-200"
                      )}
                    />
                  ))}
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div
                  className={cx(
                    "flex flex-col items-center justify-center py-16 rounded-xl border",
                    isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200"
                  )}
                >
                  <Megaphone size={24} className="text-zinc-400 mb-3" />
                  <p className={cx("text-sm font-medium", isDark ? "text-zinc-500" : "text-zinc-400")}>
                    Bu kategoride duyuru yok
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAnnouncements.map((item) => (
                    <AnnouncementCard
  key={item.id}
  item={item}
  isDark={isDark}
  onInteract={registerInteraction}
  onSelect={async (announcement) => {
    const res = await fetch(`/api/duyurular/viewers?id=${announcement.id}`);
const json = await res.json();
announcement.viewer_count = json.count || 0;

setSelectedAnnouncement({
  ...announcement,
  viewer_count: json.count || 0,
});
    setShowViewers(true);
    registerInteraction(announcement.id, "click");
    fetchAnnouncementViewers(announcement.id);
  }}
/>
                  ))}
                </div>
              )}
            </div>

            {/* Analytics sidebar — right 1 col */}
            <aside className="space-y-4">

              {selectedAnnouncement && (
  <div
    className={cx(
      "rounded-xl border p-4",
      isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
    )}
  >
    <h3 className={cx("text-sm font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>
      {selectedAnnouncement.title}
    </h3>

    <p className={cx("text-xs leading-relaxed mb-4", isDark ? "text-zinc-400" : "text-zinc-600")}>
      {selectedAnnouncement.content || selectedAnnouncement.message}
    </p>

    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-lg bg-zinc-100 dark:bg-white/[0.05] p-3">
        <p className="text-sm font-black">{selectedAnnouncement.views || 0}</p>
        <p className="text-[10px] text-zinc-500">Görüntü</p>
      </div>

      <div className="rounded-lg bg-zinc-100 dark:bg-white/[0.05] p-3">
        <p className="text-sm font-black">{selectedAnnouncement.clicks || 0}</p>
        <p className="text-[10px] text-zinc-500">Tıklama</p>
      </div>

      <div className="rounded-lg bg-zinc-100 dark:bg-white/[0.05] p-3">
        <p className="text-sm font-black">{selectedAnnouncement.reactions || 0}</p>
        <p className="text-[10px] text-zinc-500">Tepki</p>
      </div>
    </div>

    <div className="mt-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-3">
  <div className="flex items-center justify-between mb-2">
    <p className="text-xs font-black text-zinc-700 dark:text-zinc-200">
      {announcementViewers.length} Kişi Okudu
    </p>

    <button
      onClick={() => setShowViewers(false)}
      className="text-[10px] font-bold text-[#E61A21]"
    >
      Kapat
    </button>
  </div>

  {showViewers && (
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {announcementViewers.length === 0 ? (
        <p className="text-xs text-zinc-400">Henüz görüntüleyen yok.</p>
      ) : (
        announcementViewers.map((viewer, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-white dark:bg-black/20 px-2 py-1"
          >
            <span className="text-xs font-semibold">
              {viewer.user_name || viewer.user_id}
            </span>
            <span className="text-[10px] text-zinc-400">
              {viewer.role}
            </span>
          </div>
        ))
      )}
    </div>
  )}
</div>

  </div>
)}

              {/* analytics panel */}
              <div
                className={cx(
                  "rounded-xl border overflow-hidden",
                  isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <div
                  className={cx(
                    "flex items-center justify-between px-4 py-3.5 border-b",
                    isDark ? "border-white/[0.07]" : "border-zinc-100"
                  )}
                >
                  <h2 className={cx("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                    Performans Analitiği
                  </h2>
                  <BarChart3 size={14} className="text-zinc-400" />
                </div>

                <div className="px-4 py-3 space-y-4">
                  {[
  { label: "Okunma Performansı", value: stats.readRate || 0 },
  { label: "Tıklama Oranı", value: stats.clickRate || 0 },
  { label: "Etkileşim Skoru", value: stats.interactionScore || 0 },
  { label: "Kitle Erişimi", value: stats.reachRate || 0 },
].map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={cx("text-xs", isDark ? "text-zinc-400" : "text-zinc-600")}>
                          {label}
                        </span>
                        <span className="text-xs font-bold text-[#E61A21] tabular-nums">%{value}</span>
                      </div>
                      <div className={cx("h-1.5 rounded-full overflow-hidden", isDark ? "bg-white/[0.07]" : "bg-zinc-100")}>
                        <div
                          className="h-full rounded-full bg-[#E61A21] transition-all duration-700"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* summary stat row */}
                <div
                  className={cx(
                    "grid grid-cols-3 divide-x border-t text-center",
                    isDark ? "border-white/[0.07] divide-white/[0.07]" : "border-zinc-100 divide-zinc-100"
                  )}
                >
                  {[
                    { label: "Görüntü", val: stats.views },
                    { label: "Tıklama", val: stats.clicks },
                    { label: "Tepki",   val: stats.reactions },
                  ].map((s) => (
                    <div key={s.label} className="py-3">
                      <p className={cx("text-sm font-bold tabular-nums", isDark ? "text-white" : "text-zinc-900")}>
                        {s.val}
                      </p>
                      <p className={cx("text-[10px] mt-0.5", isDark ? "text-zinc-600" : "text-zinc-400")}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* type breakdown */}
              <div
                className={cx(
                  "rounded-xl border px-4 py-4",
                  isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <h3 className={cx("text-xs font-semibold mb-3", isDark ? "text-zinc-400" : "text-zinc-500")}>
                  Tür Dağılımı
                </h3>
                <div className="space-y-2">
                  {announcementTypes.filter((t) => t.key !== "all").map((type) => {
                    const count = announcements.filter((a) => a.type === type.key).length;
                    const pct = announcements.length ? Math.round((count / announcements.length) * 100) : 0;
                    const ts = typeStyle(type.key, isDark);
                    return (
                      <div key={type.key} className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ background: ts.dot }} />
                        <span className={cx("text-xs flex-1", isDark ? "text-zinc-400" : "text-zinc-600")}>
                          {type.label}
                        </span>
                        <span className={cx("text-xs font-semibold tabular-nums", isDark ? "text-zinc-300" : "text-zinc-700")}>
                          {count}
                        </span>
                        <div className={cx("w-16 h-1 rounded-full overflow-hidden", isDark ? "bg-white/[0.07]" : "bg-zinc-100")}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: ts.dot }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </aside>
          </section>

        </div>
      )}
    </YoneticiLayout>
  );
}