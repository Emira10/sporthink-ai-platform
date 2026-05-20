import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function AiQuizPage() {
  const router = useRouter();
  const { id } = router.query;

const [questions, setQuestions] = useState([]);
const [answers, setAnswers] = useState({});
const [score, setScore] = useState(null);
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [finalScore, setFinalScore] = useState(null);

useEffect(() => {
  if (!id) return;

  fetch(`/api/quizzes/get-by-course?id=${id}`)
    .then((res) => res.json())
    .then((data) => setQuestions(Array.isArray(data) ? data : []));
}, [id]);

  function handleSelect(index, option) {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  }

  async function handleSubmit() {
  if (submitting || submitted) return;

  setSubmitting(true);

  let correct = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.correct_answer) correct++;
  });

  const percent =
    questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Kullanıcı bilgisi bulunamadı.");
    setSubmitting(false);
    return;
  }

  const res = await fetch("/api/quizzes/save-ai-result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kullanici_id: userId,
      course_id: id,
      score: percent,
      correct_count: correct,
      total_questions: questions.length,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert("AI sınav sonucu kaydedilemedi: " + json.error);
    setSubmitting(false);
    return;
  }

  await fetch("/api/notifications/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      title: "AI Sınav Tamamlandı",
      message: `AI sınav sonucunuz: ${percent}%`,
      type: "quiz",
    }),
  });

  if (percent >= 60) {
  await fetch("/api/kullanici/complete-training", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kullanici_id: userId,
      training_id: id,
    }),
  });
}

  setScore(correct);
  setFinalScore(percent);
  setSubmitted(true);
  setSubmitting(false);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

  return (
    <div className="min-h-screen bg-zinc-50 p-10">
      <div className="max-w-4xl mx-auto">
        <p className="text-[#E61A21] text-xs font-black tracking-[0.3em] uppercase mb-4">
          SporThink AI Sınav
        </p>

        <h1 className="text-5xl font-black italic uppercase mb-8">
          AI Sınavı
        </h1>

        {submitted && (
  <div className="mb-8 bg-white border rounded-[2rem] p-8 text-center shadow-xl">
    <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
      AI Sınav Sonucu
    </p>

    <h2 className="text-5xl font-black text-[#E61A21]">
      %{finalScore}
    </h2>

    <p className="mt-3 text-zinc-500 font-bold">
      {score} / {questions.length} doğru cevap
    </p>
  </div>
)}

        {questions.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-8 border text-zinc-400 font-black">
            Bu sınav için soru bulunamadı.
          </div>
        ) : (
          <>
            {questions.map((q, i) => (
              <div
                key={q.id || i}
                className="bg-white border border-zinc-200 rounded-[2rem] p-8 mb-6 shadow-xl shadow-zinc-200/60"
              >
                <h2 className="text-xl font-black mb-5">
                  {i + 1}. {q.question}
                </h2>

                <div className="space-y-3">
                  {(q.options || []).map((opt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(i, opt)}
                      className={`w-full text-left p-4 rounded-2xl font-bold border ${
                        answers[i] === opt
                          ? "bg-[#E61A21] text-white border-[#E61A21]"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
  disabled={submitting || submitted}
  onClick={handleSubmit}
  className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
>
  {submitting ? "Kaydediliyor..." : submitted ? "Sınav Tamamlandı" : "Sınavı Bitir"}
</button>

            {score !== null && (
              <div className="mt-8 bg-white border rounded-[2rem] p-8 text-center">
                <h2 className="text-3xl font-black text-[#E61A21]">
                  Sonuç: {score} / {questions.length}
                </h2>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}