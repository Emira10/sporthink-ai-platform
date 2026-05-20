import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";

const isValidUUID = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export default function SinavSorulari() {
  const router = useRouter();

  const [examId, setExamId] = useState("");
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [pageError, setPageError] = useState("");

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [points, setPoints] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const id = router.query.exam_id;

    if (!id || Array.isArray(id)) {
      setPageError("Sınav seçilmedi. Lütfen Online Sınavlar sayfasından bir sınav seç.");
      return;
    }

    if (!isValidUUID(id)) {
      setPageError("Geçersiz sınav ID. Lütfen sınavı listeden seç.");
      return;
    }

    setExamId(id);
  }, [router.isReady, router.query.exam_id]);

  useEffect(() => {
    if (!examId) return;
    fetchExam(examId);
    fetchQuestions(examId);
  }, [examId]);

  async function fetchExam(id) {
    const { data, error } = await supabase
      .from("final_exams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setPageError("Sınav bulunamadı: " + error.message);
      return;
    }

    setExam(data);
  }

  async function fetchQuestions(id) {
    const { data, error } = await supabase
      .from("final_exam_questions")
      .select("*")
      .eq("exam_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      alert("Sorular alınamadı: " + error.message);
      return;
    }

    setQuestions(data || []);
  }

  async function addQuestion(e) {
  e.preventDefault();

  if (!examId) return alert("Sınav seçilmedi.");

  if (!question.trim() || !optionA.trim() || !optionB.trim()) {
    return alert("Soru, A ve B zorunlu.");
  }

  setLoading(true);

  const res = await fetch("/api/egitmen/create-exam-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exam_id: examId,
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
      points,
    }),
  });

  const json = await res.json();
  setLoading(false);

  if (!json.ok) {
    alert("Hata: " + json.message);
    return;
  }

  setQuestion("");
  setOptionA("");
  setOptionB("");
  setOptionC("");
  setOptionD("");
  setCorrectAnswer("A");
  setPoints(10);

  fetchQuestions(examId);
}

  async function deleteQuestion(id) {
  const ok = confirm("Silmek istiyor musun?");
  if (!ok) return;

  const res = await fetch("/api/egitmen/delete-exam-question", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert("Silinemedi: " + json.message);
    return;
  }

  fetchQuestions(examId);
}

  if (!router.isReady) {
    return (
      <EgitmenLayout pageTitle="Yükleniyor...">
        <div className="p-10 text-center font-black text-lg">
          Sınav yükleniyor...
        </div>
      </EgitmenLayout>
    );
  }

  if (pageError) {
    return (
      <EgitmenLayout pageTitle="Sınav Soruları">
        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 text-center">
          <p className="text-red-500 font-black mb-5">{pageError}</p>

          <button
            onClick={() => router.push("/egitmen/sinavlar")}
            className="bg-[#E61A21] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Online Sınavlara Dön
          </button>
        </div>
      </EgitmenLayout>
    );
  }

  return (
    <EgitmenLayout
      pageTitle="Sınav Soruları"
      pageSubtitle={exam ? exam.title : "Yükleniyor..."}
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
            Soru Ekle
          </h2>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
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
                      {i + 1}. {q.question}
                    </h3>

                    <button
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