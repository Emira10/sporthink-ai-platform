import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function QuizDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (id) loadQuiz();
  }, [id]);

  async function loadQuiz() {
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    const { data: questionData } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", id);

    setQuiz(quizData);
    setQuestions(questionData || []);
  }

  if (!quiz) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{quiz.title}</h1>

      {questions.map((q, i) => (
        <div key={q.id}>
          <p>{i + 1}. {q.question_text}</p>
        </div>
      ))}
    </div>
  );
}