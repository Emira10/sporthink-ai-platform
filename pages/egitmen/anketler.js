import { useEffect, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";

export default function Anketler() {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    fetchSurveys();
  }, []);

  async function fetchSurveys() {
    const { data, error } = await supabase
      .from("training_surveys")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return alert(error.message);
    setSurveys(data || []);
  }

  async function createSurvey(e) {
    e.preventDefault();

    if (!title.trim()) return alert("Anket başlığı yaz.");

    const { error } = await supabase.from("training_surveys").insert([
      {
        title,
        description,
        is_active: true,
      },
    ]);

    if (error) return alert(error.message);

    setTitle("");
    setDescription("");
    fetchSurveys();
  }

  async function openSurvey(survey) {
    setSelectedSurvey(survey);

    const { data, error } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("survey_id", survey.id)
      .order("created_at", { ascending: true });

    if (error) return alert(error.message);
    setQuestions(data || []);

    const { data: answerData, error: answersError } = await supabase
  .from("survey_answers")
  .select(`
    *,
    survey_questions (
      question
    )
  `)
  .eq("survey_id", String(survey.id))
  .order("created_at", { ascending: false });

if (answersError) {
  console.error(answersError);
}

setAnswers(answerData || []);
  }

  async function addQuestion(e) {
    e.preventDefault();

    if (!selectedSurvey) return alert("Önce anket seç.");
    if (!question.trim()) return alert("Soru yaz.");

    const { error } = await supabase.from("survey_questions").insert([
      {
        survey_id: selectedSurvey.id,
        question,
        question_type: "text",
      },
    ]);

    if (error) return alert(error.message);

    setQuestion("");
    openSurvey(selectedSurvey);
  }

  async function deleteSurvey(survey) {
  if (!window.confirm(`${survey.title} anketi silinsin mi?`)) return;

  const res = await fetch("/api/egitmen/delete-survey", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ survey_id: survey.id }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Anket silinemedi.");
    return;
  }

  fetchSurveys();
}

  return (
    <EgitmenLayout
      pageTitle="Eğitim Sonrası Anketler"
      pageSubtitle="Anket oluştur, soru ekle ve geri bildirimleri yönet"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <form
          onSubmit={createSurvey}
          className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60"
        >
          <p className="text-[#E61A21] text-[10px] font-black tracking-[0.3em] uppercase mb-3">
            Yeni Anket
          </p>

          <h2 className="text-2xl font-black italic uppercase mb-6">
            Anket Oluştur
          </h2>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Anket Başlığı"
            className="w-full mb-4 bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama"
            className="w-full mb-6 bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold min-h-[110px]"
          />

          <button className="w-full bg-[#E61A21] text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs">
            + Anketi Kaydet
          </button>
        </form>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60">
          <h2 className="text-2xl font-black italic uppercase mb-6">
            Anket Listesi
          </h2>

          <div className="space-y-4">
            {surveys.length === 0 ? (
              <p className="text-zinc-400 font-black">Henüz anket yok.</p>
            ) : (
              surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="border border-zinc-200 rounded-2xl p-5 flex justify-between gap-4"
                >
                  <div>
                    <h3 className="font-black italic uppercase">
                      {survey.title}
                    </h3>
                    <p className="text-zinc-500 font-bold text-sm mt-1">
                      {survey.description || "Açıklama yok"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openSurvey(survey)}
                      className="bg-black text-white px-4 py-3 rounded-xl text-xs font-black"
                    >
                      Sorular
                    </button>

                    <button
                      onClick={() => deleteSurvey(survey)}
                      className="bg-red-500 text-white px-4 py-3 rounded-xl text-xs font-black"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedSurvey && (
            <div className="mt-8 border-t pt-8">
              <h3 className="text-xl font-black italic uppercase mb-4">
                {selectedSurvey.title} - Sorular
              </h3>

              <form onSubmit={addQuestion} className="flex gap-3 mb-6">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Anket sorusu yaz"
                  className="flex-1 bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold"
                />

                <button className="bg-[#E61A21] text-white px-6 rounded-2xl font-black text-xs uppercase">
                  Ekle
                </button>
              </form>

              {questions.length === 0 ? (
                <p className="text-zinc-400 font-black">Henüz soru yok.</p>
              ) : (
                questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-3 font-bold"
                  >
                    {index + 1}. {q.question}
                  </div>
                ))
              )}

              <div className="mt-10 border-t pt-8">
  <h3 className="text-xl font-black italic uppercase mb-6">
    Öğrenci Yanıtları
  </h3>

  {answers.length === 0 ? (
    <p className="text-zinc-400 font-black">
      Henüz cevap yok.
    </p>
  ) : (
    <div className="space-y-4">
      {answers.map((a) => (
        <div
          key={a.id}
          className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5"
        >
          <p className="font-black text-sm uppercase mb-2">
            {a.student_name || "Kullanıcı"}
          </p>

          <p className="text-zinc-600 font-bold text-sm">
            <div className="space-y-2">
  <p className="font-black text-xs text-[#E61A21] uppercase">
    {a.survey_questions?.question || "Soru"}
  </p>

  <p className="text-zinc-700 font-bold text-sm">
    {a.answer}
  </p>
</div>
          </p>
        </div>
      ))}
    </div>
  )}
</div>

            </div>
          )}
        </div>
      </div>
    </EgitmenLayout>
  );
}