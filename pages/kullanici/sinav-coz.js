import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function SinavCoz() {
  const router = useRouter();
  const { exam_id } = router.query;

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (router.isReady && exam_id) {
      fetchExam();
      fetchQuestions();
    }
  }, [router.isReady, exam_id]);

  async function fetchExam() {
    const { data, error } = await supabase
      .from("final_exams")
      .select("*")
      .eq("id", exam_id)
      .single();

    if (error) {
      alert("Sınav alınamadı: " + error.message);
      return;
    }

    setExam(data);
  }

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from("final_exam_questions")
      .select("*")
      .eq("exam_id", exam_id)
      .order("created_at", { ascending: true });

    if (error) {
      alert("Sorular alınamadı: " + error.message);
      return;
    }

    setQuestions(data || []);
  }

  async function getUserId() {
  const savedId = localStorage.getItem("userId");
  if (savedId) return Number(savedId);

  const email = localStorage.getItem("userEmail");
  if (!email) return null;

  const { data } = await supabase
    .from("kullanicilar")
    .select("kullanici_id")
    .eq("e_posta", email)
    .single();

  if (data?.kullanici_id) {
    localStorage.setItem("userId", data.kullanici_id);
    return Number(data.kullanici_id);
  }

  return null;
}

async function addXp(amount) {
  const userId = await getUserId();
  if (!userId) return;

  const { data: profile } = await supabase
    .from("user_learning_profile")
    .select("*")
    .eq("kullanici_id", userId)
    .single();

  if (profile) {
    const newXp = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 500) + 1;

    await supabase
      .from("user_learning_profile")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("kullanici_id", userId);
  } else {
    await supabase.from("user_learning_profile").insert({
      kullanici_id: userId,
      xp: amount,
      level: 1,
      mood: "Fena Değil",
    });
  }
}

async function completeMissionByKey(key) {
  const userId = await getUserId();
  if (!userId) return;

  const { data: mission } = await supabase
    .from("daily_missions")
    .select("*")
    .eq("mission_key", key)
    .single();

  if (!mission) return;

  const today = new Date().toISOString().slice(0, 10);

  await supabase.from("user_daily_missions").upsert({
    kullanici_id: userId,
    mission_id: mission.id,
    progress_count: mission.target_count,
    is_completed: true,
    completed_at: new Date().toISOString(),
    mission_date: today,
  });
}

  async function submitExam() {
    let score = 0;
    let total = 0;

    questions.forEach((q) => {
      total += Number(q.points || 10);

      if (answers[q.id] === q.correct_answer) {
        score += Number(q.points || 10);
      }
    });

    const percent =
  total > 0 ? Math.round((score / total) * 100) : 0;

const isPassed = percent >= Number(exam?.passing_score || 60);

    const finalResult = {
      score,
      total,
      isPassed,
    };

    setResult(finalResult);

    if (isPassed) {
      await completeMissionByKey("solve_quiz");
      await addXp(80);
    }

    await supabase.from("final_exam_results").insert([
  {
    exam_id,
    exam_title: exam?.title || "Sınav",
    student_name: localStorage.getItem("userName") || "Kullanıcı",
    score: percent,
    total_points: 100,
    is_passed: isPassed,
  },
]);

const saveNormalRes = await fetch("/api/quizzes/save-normal-result", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    kullanici_id: Number(localStorage.getItem("userId")),
    exam_id: String(exam_id),
    exam_title: exam?.title || "Online Sınav",
    score: percent,
    correct_count: score,
    total_questions: questions.length,
  }),
});

const saveNormalJson = await saveNormalRes.json();

if (!saveNormalJson.ok) {
  alert("NORMAL sınav sonucu kaydedilemedi: " + saveNormalJson.error);
  return;
}

    await fetch("/api/notifications/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: localStorage.getItem("userId"),
    title: isPassed
      ? "Quiz Başarıyla Tamamlandı"
      : "Quiz Sonucu Açıklandı",
    message: isPassed
      ? "Sınavı başarıyla geçtin ve XP kazandın."
      : "Sınav sonucu sisteme kaydedildi.",
    type: "quiz",
  }),
});

const studentName =
  localStorage.getItem("userName") || "Kullanıcı";

await supabase.from("activity_logs").insert({
  activity_type: isPassed ? "quiz_success" : "quiz_failed",
  user_name: studentName,
  activity_text: isPassed
    ? `${studentName} online sınavdan %${percent} başarı elde etti`
    : `${studentName} online sınavdan %${percent} sonuç aldı`,
});

  }

  if (!router.isReady || !exam_id) {
    return <div className="p-10 font-black">Sınav yükleniyor...</div>;
  }

  if (result) {
    return (
      <div className="min-h-screen bg-zinc-50 p-10">
        <div className="max-w-3xl mx-auto bg-white rounded-[2rem] p-10 border text-center">
          <h1 className="text-4xl font-black italic uppercase mb-6">
            Sınav Sonucu
          </h1>

          <p className="text-6xl font-black text-[#E61A21] mb-4">
            {result.score}/{result.total}
          </p>

          <p
            className={`text-2xl font-black uppercase ${
              result.isPassed ? "text-green-600" : "text-red-600"
            }`}
          >
            {result.isPassed ? "Başarılı" : "Başarısız"}
          </p>

          <button
            onClick={() => router.push("/kullanici/sinavlar")}
            className="mt-8 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs"
          >
            Sınavlara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-10">
      <div className="max-w-5xl mx-auto">
        <p className="text-[#E61A21] text-xs font-black tracking-[0.3em] uppercase mb-4">
          Online Sınav
        </p>

        <h1 className="text-4xl font-black italic uppercase mb-4">
          {exam?.title || "Sınav"}
        </h1>

        <p className="text-zinc-500 font-bold mb-10">
          Soruları cevaplayıp sınavı tamamlayın.
        </p>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white border border-zinc-200 rounded-[2rem] p-8"
            >
              <h2 className="text-xl font-black mb-6">
                {index + 1}. {q.question}
              </h2>

              {[
                ["A", q.option_a],
                ["B", q.option_b],
                ["C", q.option_c],
                ["D", q.option_d],
              ]
                .filter((item) => item[1])
                .map(([letter, text]) => (
                  <label
                    key={letter}
                    className={`block border rounded-2xl p-4 mb-3 cursor-pointer font-bold ${
                      answers[q.id] === letter
                        ? "border-[#E61A21] bg-red-50"
                        : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={letter}
                      checked={answers[q.id] === letter}
                      onChange={() =>
                        setAnswers({ ...answers, [q.id]: letter })
                      }
                      className="mr-3"
                    />
                    {letter}) {text}
                  </label>
                ))}
            </div>
          ))}
        </div>

        <button
          onClick={submitExam}
          className="mt-8 w-full bg-[#E61A21] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs"
        >
          Sınavı Bitir
        </button>
      </div>
    </div>
  );
}
