import { useEffect, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";

export default function SinavSonuclari() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    const { data } = await supabase
      .from("final_exam_results")
      .select("*")
      .order("submitted_at", { ascending: false });

    setResults(data || []);
  }

  return (
    <EgitmenLayout
      pageTitle="Sınav Sonuçları"
      pageSubtitle="Öğrenci başarı durumları"
    >
      <div className="bg-white p-8 rounded-2xl border">
        <h2 className="text-2xl font-black mb-6">
          Sonuç Listesi ({results.length})
        </h2>

        {results.length === 0 ? (
          <p className="text-zinc-400">Henüz sonuç yok</p>
        ) : (
          results.map((r) => (
            <div key={r.id} className="border p-4 mb-3 rounded-xl">
              <p className="font-black">
                {r.student_name || "Öğrenci"}
              </p>
              <p>Puan: {r.score}</p>
              <p>
                Durum:{" "}
                <span className={r.is_passed ? "text-green-500" : "text-red-500"}>
                  {r.is_passed ? "Geçti" : "Kaldı"}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </EgitmenLayout>
  );
}