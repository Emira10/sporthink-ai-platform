import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";

export default function QuizSorulariPage() {
  const router = useRouter();
  const { quizId } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [points, setPoints] = useState(10);

  useEffect(() => {
    if (!router.isReady || !quizId) return;
    fetchQuiz();
    fetchQuestions();
  }, [router.isReady, quizId]);

  async function fetchQuiz() {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();


    setQuiz(data);
  }

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    if (error) {
      alert("Sorular alınamadı: " + error.message);
      return;
    }

    setQuestions(data || []);
  }

  async function addQuestion(e) {
    e.preventDefault();

    if (!quizId) return alert("Quiz seçilmedi.");
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      return alert("Soru, A ve B seçenekleri zorunludur.");
    }

    setLoading(true);

    const res = await fetch("/api/egitmen/create-quiz-question", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    quiz_id: quizId,
    question_text: questionText,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    correct_answer: correctAnswer,
    points,
  }),
});

const json = await res.json();

if (!json.ok) {
  alert("Soru eklenemedi: " + json.message);
  setLoading(false);
  return;
}

    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setPoints(10);

    fetchQuestions();
    setLoading(false);
  }

  async function deleteQuestion(id) {
    if (!confirm("Bu soru silinsin mi?")) return;

    const res = await fetch("/api/egitmen/delete-quiz-question", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ id }),
});

const json = await res.json();

if (!json.ok) {
  alert("Soru silinemedi: " + json.message);
  return;
}

    fetchQuestions();
  }

  return (
    <EgitmenLayout
      pageTitle="Quiz Soruları"
      pageSubtitle={quiz ? quiz.title : "Quiz yükleniyor..."}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <form
          onSubmit={addQuestion}
          className="xl:col-span-1 bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60"
        >
          <p className="text-[#E61A21] text-[10px] font-black tracking-[0.3em] uppercase mb-3">
            Yeni Soru
          </p>

          <h2 className="text-2xl font-black italic uppercase mb-6">
            Quiz Sorusu Ekle
          </h2>

          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Soruyu yaz"
            className="w-full mb-4 bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold min-h-[110px]"
          />

          <Input label="A Seçeneği" value={optionA} onChange={setOptionA} />
          <Input label="B Seçeneği" value={optionB} onChange={setOptionB} />
          <Input label="C Seçeneği" value={optionC} onChange={setOptionC} />
          <Input label="D Seçeneği" value={optionD} onChange={setOptionD} />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold"
            >
              <option value="A">Doğru: A</option>
              <option value="B">Doğru: B</option>
              <option value="C">Doğru: C</option>
              <option value="D">Doğru: D</option>
            </select>

            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold"
              placeholder="Puan"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#E61A21] text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/25 disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "+ Soruyu Kaydet"}
          </button>
        </form>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#E61A21] text-[10px] font-black tracking-[0.3em] uppercase mb-3">
                Kayıtlı Sorular
              </p>
              <h2 className="text-2xl font-black italic uppercase">
                Soru Listesi
              </h2>
            </div>

            <span className="bg-zinc-100 px-4 py-2 rounded-xl text-xs font-black">
              {questions.length} Soru
            </span>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 font-black uppercase tracking-widest text-xs">
              Henüz soru eklenmedi.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="border border-zinc-200 rounded-2xl p-5">
                  <div className="flex justify-between gap-4">
                    <h3 className="font-black text-lg">
                      {i + 1}. {q.question_text}
                    </h3>

                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="text-red-500 text-xs font-black uppercase"
                    >
                      Sil
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm font-bold text-zinc-600">
                    <p>A) {q.option_a}</p>
                    <p>B) {q.option_b}</p>
                    <p>C) {q.option_c || "-"}</p>
                    <p>D) {q.option_d || "-"}</p>
                  </div>

                  <p className="mt-4 text-xs font-black uppercase text-[#E61A21]">
                    Doğru cevap: {q.correct_answer} | Puan: {q.points}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </EgitmenLayout>
  );
}

function Input({ label, value, onChange }) {
  return (
    <input
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full mb-4 bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 outline-none font-bold"
    />
  );
}