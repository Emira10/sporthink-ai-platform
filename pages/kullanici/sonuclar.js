import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Sonuclar() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    const { data, error } = await supabase
      .from("final_exam_results")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setResults(data || []);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black italic uppercase mb-6">
          Başarı Sonuçlarım
        </h1>

        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="bg-white border p-8 rounded-2xl text-zinc-400 font-black">
              Henüz sınav sonucu yok.
            </div>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-zinc-200 rounded-2xl p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-black text-lg">
                    Sınav ID: {r.exam_id}
                  </h3>

                  <p className="text-zinc-500 font-bold text-sm">
                    Puan: {r.score} / {r.total_points}
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl font-black text-xs ${
                    r.is_passed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.is_passed ? "Başarılı" : "Başarısız"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}