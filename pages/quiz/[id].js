import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function QuizSolvePage() {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchQuizData();
  }, [id]);

  async function fetchQuizData() {
    try {
      setLoading(true);
      console.log("جاري جلب بيانات الكويز للرقم:", id);

      // تأكدي أن اسم الجدول في سوبابيس هو quizzes أو quiz
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes") 
        .select("*")
        .eq("id", id)
        .single();

      if (quizError) {
        console.error("خطأ في جلب الكويز:", quizError.message);
      }

      const { data: questionData, error: qError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", id)
        .order("created_at", { ascending: true });

      if (qError) {
        console.error("خطأ في جلب الأسئلة:", qError.message);
      }

      console.log("بيانات الكويز المستلمة:", quizData);
      console.log("الأسئلة المستلمة:", questionData);

      setQuiz(quizData || null);
      setQuestions(questionData || []);
    } catch (err) {
      console.error("حدث خطأ غير متوقع:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(qid, option) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  }

  function getSafeUserName(userEmail) {
    const rawName = localStorage.getItem("userName");
    const cleaned = rawName?.trim();

    if (
      !cleaned ||
      cleaned.toLowerCase() === "undefined" ||
      cleaned.toLowerCase() === "user undefined" ||
      cleaned.toLowerCase() === "kullanıcı" ||
      cleaned.toLowerCase() === "user"
    ) {
      return userEmail;
    }

    return cleaned;
  }

  async function handleSubmit() {
    try {
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        alert("Kullanıcı bulunamadı!");
        return;
      }

      const userName = getSafeUserName(userEmail);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("email", userEmail)
        .maybeSingle();

      if (!profile?.id) {
        alert("Profil bulunamadı!");
        return;
      }

      if (
        !profile.full_name ||
        profile.full_name.toLowerCase() === "undefined" ||
        profile.full_name.toLowerCase() === "user undefined"
      ) {
        await supabase
          .from("profiles")
          .update({ full_name: userName })
          .eq("id", profile.id);
      }

      setSubmitting(true);

      let correct = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) correct++;
      });

      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert([
          {
            quiz_id: id,
            user_id: profile.id,
            score: correct,
            total_questions: questions.length,
          },
        ])
        .select()
        .single();

      if (attemptError) {
        alert("Quiz sonucu kaydedilemedi!");
        console.error(attemptError);
        setSubmitting(false);
        return;
      }

      const { error: answersError } = await supabase
        .from("quiz_attempt_answers")
        .insert(
          questions.map((q) => ({
            attempt_id: attempt.id,
            question_id: q.id,
            selected_answer: answers[q.id] || "",
            is_correct: answers[q.id] === q.correct_answer,
          }))
        );

      if (answersError) {
        alert("Cevaplar kaydedilemedi!");
        console.error(answersError);
        setSubmitting(false);
        return;
      }


const successRate = Math.round((correct / questions.length) * 100);

if (successRate < 70) {
  alert(
    `Puanın: ${correct}/${questions.length} (%${successRate}). Geçmek için en az %70 almalısın. Lütfen tekrar dene.`
  );

  setAnswers({});
  setSubmitting(false);
  return;
}

await supabase
  .from("user_progress")
  .upsert(
    {
      kullanici_id: Number(profile.id),
      course_id: String(quiz.course_id),
      progress_percent: 100,
      status: "completed",
      can_complete: true,
      completed_at: new Date().toISOString(),
    },
    {
      onConflict: "kullanici_id,course_id",
    }
  );

alert(
  `Tebrikler! Puanın: ${correct}/${questions.length} (%${successRate}). Quiz başarıyla tamamlandı.`
);

router.push("/kullanici/egitimler");

    } catch (err) {
      console.error(err);
      alert("Hata oluştu!");
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{padding: 20, color: 'black', background: 'white'}}>Loading... (جاري التحميل)</div>;
  
  if (!quiz) return (
    <div style={{padding: 20, color: 'black', background: 'white'}}>
      <h3>Quiz bulunamadı! (لم يتم العثور على الكويز)</h3>
      <p>ID: {id}</p>
      <button onClick={() => fetchQuizData()}>Tekrar Dene</button>
    </div>
  );

  return (
    <div style={{ padding: 20, background: 'white', color: 'black', minHeight: '100vh' }}>
      <h2>{quiz.title}</h2>

      {questions.length === 0 && <p>Bu quizde henüz soru yok.</p>}

      {questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
          <p><strong>{i + 1}. {q.question_text}</strong></p>

          {["A", "B", "C", "D"].map((opt) => {
            const text = q[`option_${opt.toLowerCase()}`];
            if (!text) return null;

            return (
              <div key={opt} style={{ margin: '5px 0' }}>
                <button 
                  onClick={() => handleSelect(q.id, opt)}
                  style={{
                    backgroundColor: answers[q.id] === opt ? '#4CAF50' : '#f0f0f0',
                    color: answers[q.id] === opt ? 'white' : 'black',
                    padding: '8px 15px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {opt}) {text}
                </button>
              </div>
            );
          })}
        </div>
      ))}

      <button 
        onClick={handleSubmit} 
        disabled={submitting}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: 20
        }}
      >
        {submitting ? "Kaydediliyor..." : "Bitir (إنهاء)"}
      </button>
    </div>
  );
}