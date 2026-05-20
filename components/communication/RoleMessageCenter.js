import { useEffect, useState } from "react";
import { Send, MessageCircle } from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

export default function RoleMessageCenter({
  role = "ogrenci",
  roleLabel = "Öğrenci",
  isDark = true,
}) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, [role]);

  async function fetchThreads() {
    const userId = localStorage.getItem("userId") || `${role}-1`;

    const res = await fetch(
      `/api/communication/my-threads?role=${role}&user_id=${userId}`
    );

    const json = await res.json();

    if (json.success) {
      setThreads(json.data || []);
    }
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
        user_id: localStorage.getItem("userId") || `${role}-1`,
        role,
      }),
    });

    fetchThreads();
  }

  async function sendReply() {
    if (!selectedThread || !replyText.trim()) return;

    setLoading(true);

    const res = await fetch("/api/communication/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: selectedThread.id,
        sender_id: localStorage.getItem("userId") || `${role}-1`,
        sender_name: localStorage.getItem("userName") || roleLabel,
        sender_role: role,
        message: replyText,
      }),
    });

    const json = await res.json();

    setLoading(false);

    if (!json.success) {
      alert(json.message || "Yanıt gönderilemedi.");
      return;
    }

    setReplyText("");
    openThread(selectedThread);
  }

  async function sendNewThread() {
  if (!newSubject.trim() || !newMessage.trim()) {
    alert("Konu ve mesaj zorunlu.");
    return;
  }

  setSendLoading(true);

  const userId = localStorage.getItem("userId") || `${role}-1`;
  const userName = localStorage.getItem("userName") || roleLabel;

  const res = await fetch("/api/communication/create-thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject: newSubject,
      message: newMessage,
      created_by_id: userId,
      created_by_name: userName,
      created_by_role: role,
      recipients: [
        {
          user_id: null,
          user_name: "Yönetici",
          role: "yonetici",
        },
      ],
      module: "duyurular",
    }),
  });

  const json = await res.json();
  setSendLoading(false);

  if (!json.success) {
    alert(json.message || "Mesaj gönderilemedi.");
    return;
  }

  setNewSubject("");
  setNewMessage("");
  fetchThreads();
  alert("Mesaj başarıyla gönderildi.");
}

  return (
    <section
      className={cx(
        "rounded-2xl border overflow-hidden",
        isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
      )}
    >
      <div className={cx("px-5 py-4 border-b", isDark ? "border-white/[0.07]" : "border-zinc-100")}>
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-[#E61A21]" />
          <h2 className={cx("text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}>
            {roleLabel} Mesaj Merkezi
          </h2>
        </div>
        <p className={cx("text-xs mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
          Yönetici, eğitmen ve öğrenci arasındaki gerçek mesajlar burada görünür.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
        <div
  className={cx(
    "lg:col-span-2 rounded-xl border p-4",
    isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-zinc-200 bg-zinc-50"
  )}
>
  <h3 className={cx("text-xs font-black mb-3", isDark ? "text-zinc-300" : "text-zinc-700")}>
    Yöneticiye Yeni Mesaj Gönder
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
    <input
      value={newSubject}
      onChange={(e) => setNewSubject(e.target.value)}
      placeholder="Mesaj konusu..."
      className={cx(
        "rounded-lg border px-3 py-2 text-xs outline-none",
        isDark
          ? "bg-white/[0.04] border-white/[0.08] text-white"
          : "bg-white border-zinc-200 text-zinc-900"
      )}
    />

    <input
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Mesaj içeriği..."
      className={cx(
        "rounded-lg border px-3 py-2 text-xs outline-none",
        isDark
          ? "bg-white/[0.04] border-white/[0.08] text-white"
          : "bg-white border-zinc-200 text-zinc-900"
      )}
    />

    <button
      onClick={sendNewThread}
      disabled={sendLoading}
      className="flex items-center justify-center gap-1 rounded-lg bg-[#E61A21] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
    >
      <Send size={12} />
      {sendLoading ? "Gönderiliyor..." : "Gönder"}
    </button>
  </div>
</div>
        <div className="space-y-2">
          <h3 className={cx("text-xs font-semibold", isDark ? "text-zinc-400" : "text-zinc-500")}>
            Gelen / Giden Konular
          </h3>

          {threads.length === 0 ? (
            <div className={cx("rounded-xl border p-5 text-center", isDark ? "border-white/[0.08] text-zinc-500" : "border-zinc-200 text-zinc-400")}>
              Henüz mesaj yok.
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => openThread(thread)}
                className={cx(
                  "w-full text-left rounded-xl border px-4 py-3 transition",
                  selectedThread?.id === thread.id
                    ? "border-[#E61A21] bg-[#E61A21]/10"
                    : isDark
                    ? "border-white/[0.08] hover:bg-white/[0.04]"
                    : "border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <p className={cx("text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}>
                  {thread.subject}
                </p>
                <p className={cx("text-[11px] mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                  Gönderen: {thread.created_by_name || thread.created_by_role}
                </p>
              </button>
            ))
          )}
        </div>

        <div className={cx("rounded-xl border p-4", isDark ? "border-white/[0.08]" : "border-zinc-200")}>
          {!selectedThread ? (
            <p className={cx("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>
              Mesaj detayını görmek için bir konu seçin.
            </p>
          ) : (
            <>
              <h3 className={cx("text-sm font-bold mb-3", isDark ? "text-white" : "text-zinc-900")}>
                {selectedThread.subject}
              </h3>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {threadMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cx(
                      "rounded-xl border px-3 py-2",
                      msg.sender_role === role
                        ? "bg-[#E61A21]/10 border-[#E61A21]/20"
                        : isDark
                        ? "bg-white/[0.04] border-white/[0.08]"
                        : "bg-zinc-50 border-zinc-200"
                    )}
                  >
                    <p className={cx("text-[11px] font-bold", isDark ? "text-zinc-300" : "text-zinc-700")}>
                      {msg.sender_name} · {msg.sender_role}
                    </p>
                    <p className={cx("text-xs mt-1", isDark ? "text-zinc-400" : "text-zinc-600")}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Yanıt yaz..."
                  className={cx(
                    "flex-1 rounded-lg border px-3 py-2 text-xs outline-none",
                    isDark
                      ? "bg-white/[0.04] border-white/[0.08] text-white"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900"
                  )}
                />

                <button
                  onClick={sendReply}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-lg bg-[#E61A21] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Send size={12} />
                  Yanıtla
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}