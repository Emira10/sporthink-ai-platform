import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function KullaniciAI({ isDark }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const [recommendation, setRecommendation] = useState("");
  const [recLoading, setRecLoading] = useState(false);

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Başlangıç");
  const [duration, setDuration] = useState("7 Gün");
  const [studyPlan, setStudyPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  async function getUserInfo() {
    const { data } = await supabase.auth.getUser();
    return {
      user_id: data?.user?.id || null,
      user_email: data?.user?.email || "unknown",
    };
  }

  async function loadHistory() {
    const res = await fetch("/api/ai/history");
    const json = await res.json();
    if (json.success) setChat(json.history || []);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);
    const user = await getUserInfo();

    const res = await fetch("/api/ai/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, ...user }),
    });

    const json = await res.json();

    if (json.success) {
      setChat((prev) => [
        ...prev,
        {
          role: "user",
          text: message,
          created_at: new Date().toISOString(),
        },
        {
          role: "ai",
          text: json.answer,
          created_at: new Date().toISOString(),
        },
      ]);
      setMessage("");
    } else {
      alert("Hata: " + (json.error || "AI yanıt veremedi"));
    }

    setLoading(false);
  }

  async function createRecommendation() {
    setRecLoading(true);
    const user = await getUserInfo();

    const res = await fetch("/api/ai/recommendation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const json = await res.json();

    if (json.success) {
      setRecommendation(json.recommendation);
    } else {
      alert("Hata: " + (json.error || "Öneri oluşturulamadı"));
    }

    setRecLoading(false);
  }

  async function createStudyPlan() {
    if (!topic.trim()) {
      alert("Konu yazmalısın");
      return;
    }

    setPlanLoading(true);
    const user = await getUserInfo();

    const res = await fetch("/api/ai/study-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        level,
        duration,
        ...user,
      }),
    });

    const json = await res.json();

    if (json.success) {
      setStudyPlan(json.plan);
    } else {
      alert("Hata: " + (json.error || "Plan oluşturulamadı"));
    }

    setPlanLoading(false);
  }

  return (
    <div className={`min-h-screen p-4 md:p-10 transition-all duration-300 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
      
      {/* Başlık Bölümü */}
      <div className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
          🤖 Yapay Zeka <span className="text-[#E61A21]">Fonksiyonları</span>
        </h1>
        <p className={`font-bold opacity-70 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          AI mentor, öğrenme önerileri ve kişisel çalışma planları.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* AI CHAT BÖLÜMÜ */}
        <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-white/[0.03] border-white/10 shadow-none' : 'bg-white border-zinc-200 shadow-xl'}`}>
          <h2 className="text-2xl font-black italic mb-2 uppercase">AI Mentor Chat</h2>
          <p className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-widest">Sorularını yapay zekaya sor</p>

          <div className={`h-[380px] overflow-y-auto rounded-[2rem] p-6 mb-6 space-y-4 scrollbar-hide ${isDark ? 'bg-black/20' : 'bg-zinc-50 border border-zinc-100'}`}>
            {chat.length === 0 && (
              <div className="h-full flex items-center justify-center text-zinc-500 italic opacity-50">
                <p>Henüz bir konuşma başlatılmadı.</p>
              </div>
            )}
            {chat.map((c, i) => (
              <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm font-bold shadow-sm ${
                  c.role === "user" 
                  ? "bg-[#E61A21] text-white rounded-tr-none" 
                  : (isDark ? "bg-white/10 text-zinc-200 rounded-tl-none border border-white/5" : "bg-white text-zinc-800 rounded-tl-none border border-zinc-200")
                }`}>
                  {c.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bir soru yaz..."
              className={`flex-1 p-4 rounded-2xl border outline-none font-bold text-xs transition-all ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#E61A21]' : 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:border-[#E61A21]'
              }`}
            />
            <button onClick={sendMessage} disabled={loading} className="bg-[#E61A21] px-8 rounded-2xl text-white font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-600/20">
              {loading ? "..." : "GÖNDER"}
            </button>
          </div>
        </div>

        {/* ÖNERİ BÖLÜMÜ */}
        <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-white/[0.03] border-white/10 shadow-none' : 'bg-white border-zinc-200 shadow-xl'}`}>
          <h2 className="text-2xl font-black italic mb-2 uppercase text-[#E61A21]">AI Recommendation</h2>
          <p className="text-[10px] font-bold text-zinc-500 mb-8 uppercase tracking-widest">Bugün ne çalışman gerektiğini AI analiz etsin</p>
          
          <button onClick={createRecommendation} disabled={recLoading} className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#E61A21] to-[#ff4d52] text-white font-black shadow-xl shadow-red-500/30 hover:opacity-90 transition-all uppercase">
            {recLoading ? "Oluşturuluyor..." : "Öneri Oluştur"}
          </button>

          <div className={`mt-6 p-8 rounded-[2rem] min-h-[220px] border italic font-bold text-sm leading-relaxed ${isDark ? 'bg-black/20 border-white/5 text-zinc-400' : 'bg-zinc-50 border-zinc-100 text-zinc-600'}`}>
            {recommendation || "Henüz bir öneri oluşturulmadı."}
          </div>
        </div>
      </div>

      {/* ÇALIŞMA PLANI BÖLÜMÜ */}
      <div className={`mt-8 p-10 rounded-[3rem] border transition-all ${isDark ? 'bg-white/[0.03] border-white/10 shadow-none' : 'bg-white border-zinc-200 shadow-xl'}`}>
        <div className="mb-8">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">AI Study Plan Generator</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase mt-1">Konu, seviye ve süre seç; AI sana özel çalışma planı oluştursun.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Konu (Örn: React, SQL...)"
            className={`md:col-span-1 p-4 rounded-2xl border outline-none font-bold text-xs transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white focus:border-[#E61A21]' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#E61A21]'
            }`}
          />
          <select value={level} onChange={(e) => setLevel(e.target.value)} className={`p-4 rounded-2xl border font-bold text-xs outline-none ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200'}`}>
            <option className="bg-zinc-900 text-white">Başlangıç</option>
            <option className="bg-zinc-900 text-white">Orta</option>
            <option className="bg-zinc-900 text-white">İleri</option>
          </select>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className={`p-4 rounded-2xl border font-bold text-xs outline-none ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200'}`}>
            <option className="bg-zinc-900 text-white">3 Gün</option>
            <option className="bg-zinc-900 text-white">7 Gün</option>
            <option className="bg-zinc-900 text-white">14 Gün</option>
            <option className="bg-zinc-900 text-white">30 Gün</option>
          </select>
          <button onClick={createStudyPlan} disabled={planLoading} className="bg-[#E61A21] text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-600/20 uppercase">
            {planLoading ? "..." : "Plan Oluştur"}
          </button>
        </div>

        {studyPlan && (
          <div className={`p-8 rounded-[2rem] border animate-fadeIn whitespace-pre-wrap text-sm font-bold leading-relaxed shadow-inner ${
            isDark ? 'bg-black/40 border-white/10 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
          }`}>
            {studyPlan}
          </div>
        )}
      </div>
    </div>
  );
}