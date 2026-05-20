import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

// --- هذا المكون هو القالب اللي بيحتوي على الأزرار اللي بدك إياها تضل ثابتة ---
function KullaniciPageLayout({ children, activePage }) {
  const router = useRouter();

  const menuItems = [
    { id: "sistem", label: "SİSTEM", icon: "⚙️", path: "/dashboard" },
    { id: "egitim", label: "EĞİTİM YÖNETİMİ", icon: "🎓", path: "/dashboard" },
    { id: "olcme", label: "ÖLÇME VE DEĞERLENDİRME", icon: "🎯", path: "/dashboard" },
    { id: "oyunlastirma", label: "OYUNLAŞTIRMA", icon: "🏆", path: "/dashboard" },
    { id: "sosyal", label: "SOSYAL GRUPLAR", icon: "👥", path: "/dashboard" },
    { id: "yapay", label: "YAPAY ZEKA", icon: "🤖", path: "/dashboard" },
    { id: "rapor", label: "RAPORLAMA", icon: "📊", path: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* SIDEBAR FIXED - نفس اللي بالصورة الثانية بالظبط */}
      <aside className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col sticky h-screen top-0">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <div className="w-10 h-10 bg-[#E61A21] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-500/20">S</div>
          <span className="font-black text-lg tracking-tighter">SPORTHINK</span>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-[11px] transition-all ${
                activePage === item.id 
                  ? "bg-[#E61A21] text-white shadow-lg shadow-red-500/40" 
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-zinc-100 space-y-1">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-zinc-400 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-50 rounded-2xl">
            <span>🌙</span> KARANLIK
          </button>
          <button onClick={() => router.push("/")} className="w-full flex items-center gap-4 px-4 py-3 text-zinc-400 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-50 rounded-2xl">
            <span>🚪</span> ÇIKIŞ
          </button>
        </div>
      </aside>

      {/* CONTENT - هنا يظهر الأنكيت بدون ما يختفي السايدبار */}
      <main className="flex-1 p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function KullaniciAnketler() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      const { data } = await supabase.from("training_surveys").select("*").eq("is_active", true);
      if (data) setSurveys(data);
    };
    fetchSurveys();
  }, []);

  const openSurvey = async (survey) => {
    setSelectedSurvey(survey);
    const { data } = await supabase.from("survey_questions").select("*").eq("survey_id", survey.id);
    if (data) setQuestions(data);
  };

  const submitSurvey = async () => {
  if (!selectedSurvey || questions.length === 0) {
    alert("Anket veya soru bulunamadı.");
    return;
  }

  const rows = questions.map((q) => ({
    survey_id: String(selectedSurvey.id),
    question_id: String(q.id),
    answer: answers[q.id] || "",
    student_name: localStorage.getItem("userName") || "Kullanıcı",
  }));

  const { data, error } = await supabase
    .from("survey_answers")
    .insert(rows)
    .select();

  if (error) {
    alert("Anket kaydedilemedi: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Anket kaydedilemedi: veri eklenmedi.");
    return;
  }

  setDone(true);
};

  // --- واجهة عرض الأنكيت داخل الـ Layout ---
  return (
    <KullaniciPageLayout activePage="olcme">
      {!selectedSurvey && !done && (
        <div className="max-w-4xl">
          <p className="text-[#E61A21] font-black text-[10px] tracking-[0.3em] mb-2">SPORTHINK ÖLÇME MERKEZİ</p>
          <h1 className="text-5xl font-black italic uppercase mb-12">Eğitim Sonrası Anketler</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {surveys.map(s => (
              <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50">
                <div className="text-3xl mb-6">📋</div>
                <h2 className="font-black text-2xl mb-2">{s.title}</h2>
                <p className="text-zinc-400 text-sm mb-8">{s.description}</p>
                <button onClick={() => openSurvey(s)} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#E61A21] transition-all">
                  Ankete Başla →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSurvey && !done && (
        <div className="max-w-2xl bg-white p-12 rounded-[3.5rem] shadow-2xl border border-zinc-50">
          <button onClick={() => setSelectedSurvey(null)} className="text-[#E61A21] font-black text-[10px] uppercase tracking-widest mb-8 block">← Geri Dön</button>
          <h2 className="text-3xl font-black italic mb-8 uppercase">{selectedSurvey.title}</h2>
          <div className="space-y-8">
            {questions.map((q, i) => (
              <div key={q.id}>
                <p className="font-bold mb-3">{i+1}. {q.question}</p>
                <textarea 
                  className="w-full bg-zinc-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-red-100"
                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                />
              </div>
            ))}
          </div>
          <button onClick={submitSurvey} className="w-full bg-[#E61A21] text-white py-5 rounded-2xl font-black uppercase mt-10 shadow-lg shadow-red-500/30">Anketi Gönder</button>
        </div>
      )}

      {done && (
        <div className="text-center py-20 bg-white rounded-[4rem] shadow-xl max-w-2xl border border-zinc-50">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-4xl font-black italic mb-4">TEŞEKKÜRLER</h2>
          <p className="text-zinc-400 font-bold">Anket başarıyla kaydedildi.</p>
          <button onClick={() => {setDone(false); setSelectedSurvey(null);}} className="mt-8 bg-zinc-900 text-white px-10 py-4 rounded-xl font-black">LİSTEYE DÖN</button>
        </div>
      )}
    </KullaniciPageLayout>
  );
}