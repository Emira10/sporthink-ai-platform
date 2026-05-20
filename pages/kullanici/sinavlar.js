import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function KullaniciSinavlar() {
  const router = useRouter();
  const { type } = router.query;

  const [exams, setExams] = useState([]);
  const [aiExams, setAiExams] = useState([]);

  const isAiPage = type === "ai";

  useEffect(() => {
    if (!router.isReady) return;

    if (isAiPage) {
      fetchAiExams();
    } else {
      fetchExams();
    }
  }, [router.isReady, type]);

  async function fetchExams() {
    const { data, error } = await supabase
      .from("final_exams")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Sınavlar alınamadı: " + error.message);
      return;
    }

    setExams(data || []);
  }

  async function fetchAiExams() {
  const res = await fetch("/api/quizzes/get-all-ai");
  const data = await res.json();

  if (!res.ok) {
    console.error("AI exams error:", data.error);
    return;
  }

  setAiExams(data || []);
}

  const isEmpty = isAiPage ? aiExams.length === 0 : exams.length === 0;

  return (
    <div className="min-h-screen bg-zinc-50 p-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-[#E61A21] text-xs font-black tracking-[0.3em] uppercase mb-4">
          SporThink Kullanıcı
        </p>

        <h1 className="text-5xl font-black italic uppercase mb-4">
          {isAiPage ? "AI Sınavlar" : "Online Sınavlar"}
        </h1>

        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-10">
          {isAiPage
            ? "Yapay zeka tarafından oluşturulan sınavları buradan çözebilirsiniz."
            : "Size atanmış aktif sınavları buradan çözebilirsiniz."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {isEmpty && (
            <div className="bg-white rounded-[2rem] p-8 border text-zinc-400 font-black">
              Henüz aktif sınav yok.
            </div>
          )}

          {!isAiPage &&
            exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60"
              >
                <h2 className="text-2xl font-black italic uppercase mb-3">
                  {exam.title}
                </h2>

                <p className="text-zinc-500 font-bold mb-5">
                  {exam.description || "Açıklama yok"}
                </p>

                <p className="text-xs font-black text-zinc-400 uppercase mb-6">
                  Geçme: {exam.passing_score} | Süre: {exam.duration_minutes} dk
                </p>

                <button
                  onClick={() =>
                    router.push({
                      pathname: "/kullanici/sinav-coz",
                      query: { exam_id: exam.id },
                    })
                  }
                  className="w-full bg-[#E61A21] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Sınava Başla
                </button>
              </div>
            ))}

          {isAiPage &&
            aiExams.map((exam, index) => (
              <div
                key={exam.course_id}
                className="bg-white border border-red-200 rounded-[2rem] p-8 shadow-xl shadow-red-200/40"
              >
                <h2 className="text-2xl font-black italic uppercase mb-3 text-[#E61A21]">
                  🤖 AI Sınavı
                </h2>

                <p className="text-zinc-500 font-bold mb-5">
                  Yapay zeka tarafından oluşturulan sınav
                </p>

                <p className="text-xs font-black text-red-400 uppercase mb-6">
                  Otomatik oluşturuldu
                </p>

                <button
  onClick={() => router.push(`/kullanici/quiz?id=${exam.egitim_id}`)}
  className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
>
  AI Sınavını Başlat 🚀
</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}