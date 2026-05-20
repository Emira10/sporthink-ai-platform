import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";

export default function Sinavlar() {
  const router = useRouter();

  const [exams, setExams] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(60);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  async function fetchExams() {
    const { data, error } = await supabase
      .from("final_exams")
      .select("id, title, description, passing_score, duration_minutes, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Sınavlar alınamadı: " + error.message);
      return;
    }

    setExams(data || []);
  }

  async function addExam(e) {
  e.preventDefault();

  if (!title.trim()) {
    alert("Sınav başlığı yazmalısın.");
    return;
  }

  setLoading(true);

  const res = await fetch("/api/egitmen/create-exam", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
      passing_score: passingScore,
      duration_minutes: duration,
    }),
  });

  const json = await res.json();

  setLoading(false);

  if (!json.ok) {
    alert("Hata: " + json.message);
    return;
  }

  setTitle("");
  setDescription("");
  setPassingScore(60);
  setDuration(30);
  fetchExams();
}

  function goToQuestions(exam) {
    if (!exam?.id) {
      alert("Bu sınavın ID bilgisi bulunamadı.");
      return;
    }

    router.push({
      pathname: "/egitmen/sinav-sorulari",
      query: { exam_id: exam.id },
    });
  }

  async function deleteExam(exam) {
  if (!window.confirm(`${exam.title} sınavı silinsin mi?`)) return;

  const res = await fetch("/api/egitmen/manage-exam", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exam_id: exam.id }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Sınav silinemedi.");
    return;
  }

  fetchExams();
}

async function toggleExamActive(exam) {
  const res = await fetch("/api/egitmen/toggle-exam-status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: exam.id,
      is_active: !exam.is_active,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Durum güncellenemedi.");
    return;
  }

  fetchExams();
}

async function quickEditExam(exam) {
  const newTitle = window.prompt("Sınav başlığı:", exam.title);
  if (newTitle === null) return;

  const newPassing = window.prompt("Geçme puanı:", exam.passing_score);
  if (newPassing === null) return;

  const newDuration = window.prompt("Süre dakika:", exam.duration_minutes);
  if (newDuration === null) return;

  const res = await fetch("/api/egitmen/manage-exam", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      exam_id: exam.id,
      title: newTitle.trim(),
      passing_score: Number(newPassing),
      duration_minutes: Number(newDuration),
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Sınav güncellenemedi.");
    return;
  }

  fetchExams();
}

  return (
    <EgitmenLayout
      pageTitle="Online Sınavlar"
      pageSubtitle="Kapsamlı sınav oluştur, düzenle ve yönet"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <form
          onSubmit={addExam}
          className="xl:col-span-1 bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60"
        >
          <h2 className="text-2xl font-black italic uppercase mb-6">
            Sınav Oluştur
          </h2>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 p-4 rounded-2xl border bg-zinc-100 outline-none font-bold"
            placeholder="Sınav Başlığı"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mb-4 p-4 rounded-2xl border bg-zinc-100 outline-none font-bold"
            placeholder="Açıklama"
          />

          <input
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(e.target.value)}
            className="w-full mb-4 p-4 rounded-2xl border bg-zinc-100 outline-none font-bold"
            placeholder="Geçme Puanı"
          />

          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mb-6 p-4 rounded-2xl border bg-zinc-100 outline-none font-bold"
            placeholder="Süre"
          />

          <button
            disabled={loading}
            className="w-full bg-[#E61A21] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            {loading ? "Kaydediliyor..." : "+ Sınavı Kaydet"}
          </button>
        </form>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-xl shadow-zinc-200/60">
          <h2 className="text-2xl font-black italic uppercase mb-6">
            Sınav Listesi
          </h2>

          {exams.length === 0 ? (
            <p className="text-zinc-400 font-black uppercase text-xs">
              Henüz sınav eklenmedi.
            </p>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="border border-zinc-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="font-black italic uppercase text-lg">
                      {exam.title}
                    </h3>

                    <p className="text-sm text-zinc-500 font-bold mt-1">
                      {exam.description || "Açıklama yok"}
                    </p>

                    <p className="text-xs font-black text-zinc-400 mt-3 uppercase">
                      Süre: {exam.duration_minutes} dk | Geçme:{" "}
                      {exam.passing_score}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => goToQuestions(exam)}
                      className="bg-black text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Sorular
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/egitmen/sinav-sonuclari")}
                      className="bg-[#E61A21] text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Sonuçlar
                    </button>

                    <button
  type="button"
  onClick={() => quickEditExam(exam)}
  className="bg-blue-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
>
  Düzenle
</button>

<button
  type="button"
  onClick={() => toggleExamActive(exam)}
  className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white ${
    exam.is_active ? "bg-amber-500" : "bg-emerald-600"
  }`}
>
  {exam.is_active ? "Pasifleştir" : "Aktifleştir"}
</button>

<button
  type="button"
  onClick={() => deleteExam(exam)}
  className="bg-zinc-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
>
  Sil
</button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </EgitmenLayout>
  );
}