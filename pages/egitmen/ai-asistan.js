import { useEffect, useRef, useState } from "react";

export default function AIAsistan() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Merhaba! Ben SporThink AI 🚀 Eğitim, quiz, içerik ve öğrenci performansı için sana akıllı öneriler sunabilirim.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "Quiz sonuçlarını nasıl analiz edebilirim?",
    "Öğrencilerin motivasyonunu artırmak için öneri ver.",
    "Yeni eğitim içeriği için plan hazırla.",
    "Başarısı düşük öğrenciler için çözüm öner.",
  ];

  async function sendMessage(e, quickText = null) {
    if (e) e.preventDefault();

    const userText = quickText || input.trim();
    if (!userText || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI Connection Error");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ HATA: " + error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#E61A21_0%,transparent_28%),radial-gradient(circle_at_bottom_right,#2563eb_0%,transparent_30%)] opacity-30"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-red-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <aside className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#E61A21] flex items-center justify-center text-3xl shadow-2xl shadow-red-600/40">
                🤖
              </div>
              <span className="absolute -right-1 -bottom-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-[#111]"></span>
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                AI Asistan
              </h1>
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest">
                Online • Gemini Aktif
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Bugünkü Rol
              </p>
              <p className="mt-1 text-sm font-bold">
                Eğitim, quiz ve öğrenci analizi danışmanı
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-black text-[#E61A21]">AI</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">
                  Akıllı Yanıt
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-2xl font-black text-blue-400">24/7</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">
                  Destek
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.25em] mb-3">
            Hızlı Komutlar
          </h3>

          <div className="space-y-3">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => sendMessage(null, item)}
                disabled={loading}
                className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-[#E61A21]/20 border border-white/10 hover:border-[#E61A21]/50 transition-all text-sm text-zinc-300 hover:text-white"
              >
                ✨ {item}
              </button>
            ))}
          </div>
        </aside>

        <main className="bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl overflow-hidden min-h-[82vh] flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div>
              <h2 className="text-3xl font-black italic tracking-tight">
                SporThink Neural Chat
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Eğitim kararlarını yapay zekâ ile güçlendir.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                Sistem Aktif
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-[1.5rem] px-6 py-4 leading-7 whitespace-pre-wrap shadow-xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#E61A21] to-red-800 text-white rounded-tr-sm"
                      : "bg-black/50 border border-white/10 text-zinc-100 rounded-tl-sm"
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">
                    {msg.role === "user" ? "Sen" : "SporThink AI"}
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-black/50 border border-white/10 rounded-[1.5rem] rounded-tl-sm px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#E61A21] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#E61A21] rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-[#E61A21] rounded-full animate-bounce delay-300"></span>
                    <span className="text-sm text-zinc-400 ml-2">
                      AI düşünüyor...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef}></div>
          </div>

          <form
            onSubmit={sendMessage}
            className="p-5 border-t border-white/10 bg-black/40"
          >
            <div className="flex gap-3 bg-white/5 border border-white/10 rounded-[1.5rem] p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Sorunu yaz... örn: Quiz başarısı düşük öğrenciler için öneri ver"
                className="flex-1 bg-transparent px-5 py-4 outline-none text-white placeholder:text-zinc-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-[#E61A21] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/30 transition-all hover:scale-105"
              >
                {loading ? "Bekle" : "Gönder"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}