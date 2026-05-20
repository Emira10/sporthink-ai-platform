import React from 'react';
import { Cpu, MoreVertical } from 'lucide-react';
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";
export default function TrainingManagementPage() {
  const [egitimler, setEgitimler] = React.useState([]);
const [statsData, setStatsData] = React.useState({
  activeCount: 0,
  totalParticipants: 0,
  completionRate: 0,
});
const [loading, setLoading] = React.useState(true);
const [aiLoading, setAiLoading] = React.useState(false);
const [openMenuId, setOpenMenuId] = React.useState(null);
const [showAll, setShowAll] = React.useState(false);
const [quizModalOpen, setQuizModalOpen] = React.useState(false);
const [selectedCourseTitle, setSelectedCourseTitle] = React.useState("");
const [quizQuestions, setQuizQuestions] = React.useState([]);

const [editModalOpen, setEditModalOpen] = React.useState(false);
const [editingCourse, setEditingCourse] = React.useState(null);

const [editTitle, setEditTitle] = React.useState("");
const [editCategory, setEditCategory] = React.useState("");
const [editDescription, setEditDescription] = React.useState("");

const [aiTitle, setAiTitle] = React.useState("");
const [aiQuestionCount, setAiQuestionCount] = React.useState(5);

async function fetchEgitimler() {
  setLoading(true);
  const res = await fetch("/api/yonetici/egitim-yonetimi");
  const data = await res.json();

  setEgitimler(data.egitimler || []);
  setStatsData(data.stats || {});
  setLoading(false);
}

React.useEffect(() => {
  fetchEgitimler();
}, []);

async function handleAiCreateCourse() {
  setAiLoading(true);

  if (!aiTitle.trim()) {
  alert("Lütfen AI ile oluşturulacak eğitim/quiz konusunu yazın.");
  setAiLoading(false);
  return;
}

const newCourse = {
  title: aiTitle,
    category: "Yazılım Geliştirme",
    description:
      "Bu eğitim, React uygulamalarında performans optimizasyonu, component memoization ve render yönetimi konularını kapsar.",
    content:
      "1. React performans temelleri\n2. Gereksiz render sorunları\n3. useMemo ve useCallback kullanımı\n4. Component optimizasyonu\n5. Final quiz",
  };

  const res = await fetch("/api/yonetici/egitim-yonetimi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCourse),
  });

  const data = await res.json();

  // 🔴 مهم جدًا
  if (!res.ok) {
    alert(data.error || "AI kurs oluşturulamadı");
    setAiLoading(false);
    return;
  }

  // ✅ الآن آمن
  const courseId = data.egitim.id;
  const quizRes = await fetch("/api/ai/generate-quiz", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    course_id: courseId,
    title: newCourse.title,
    question_count: Number(aiQuestionCount),
  }),
});

const quizData = await quizRes.json();

if (!quizRes.ok) {
  alert("Quiz hatası: " + (quizData.error || "Bilinmeyen hata"));
  setAiLoading(false);
  return;
}


alert("AI kurs + quiz başarıyla oluşturuldu 🔥");

fetchEgitimler();
setAiTitle("");
setAiLoading(false);
}


async function handleShowQuiz(item) {
  const res = await fetch(`/api/ai/get-quiz?course_id=${item.id}`);
  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Sorular getirilemedi");
    return;
  }

  setSelectedCourseTitle(item.title);
  setQuizQuestions(data.questions || []);
  setQuizModalOpen(true);
}

function handleEditCourse(item) {
  setEditingCourse(item);

  setEditTitle(item.title || "");
  setEditCategory(item.category || "");
  setEditDescription(item.description || "");

  setEditModalOpen(true);
}

async function handleSaveEdit() {
  if (!editingCourse) return;

  const res = await fetch("/api/yonetici/update-course", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: editingCourse.id,
      title: editTitle,
      category: editCategory,
      description: editDescription,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Güncelleme başarısız");
    return;
  }

  alert("Kurs başarıyla güncellendi 🔥");

  setEditModalOpen(false);
  fetchEgitimler();
}

async function handleDeleteCourse(id) {
  const confirmDelete = confirm("Bu kurs silinsin mi?");

  if (!confirmDelete) return;

  console.log("DELETE ID:", id);

  const res = await fetch("/api/yonetici/delete-course", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Silme işlemi başarısız");
    return;
  }

  alert("Kurs başarıyla silindi 🗑️");

  fetchEgitimler();
}

  return (
    <YoneticiLayout 
      pageTitle="EĞİTİM YÖNETİMİ" 
      pageSubtitle="Eğitim içeriklerini oluştur، AI ile optimize et ve süreci yönet."
    >
      {({ isDark }) => (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Header Actions - الأزرار العلوية */}
          <div className="flex flex-wrap gap-4 justify-end">

            <input
  value={aiTitle}
  onChange={(e) => setAiTitle(e.target.value)}
  placeholder="ÖR: Siber Güvenlik için 10 soruluk quiz oluştur"
  className={`px-5 py-3 rounded-xl font-bold text-sm border outline-none ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500"
      : "bg-white border-gray-200 text-gray-700"
  }`}
/>

<input
  type="number"
  min="1"
  max="20"
  value={aiQuestionCount}
  onChange={(e) => setAiQuestionCount(e.target.value)}
  className={`w-24 px-4 py-3 rounded-xl font-bold text-sm border outline-none ${
    isDark
      ? "bg-white/5 border-white/10 text-white"
      : "bg-white border-gray-200 text-gray-700"
  }`}
/>

            <button
  onClick={handleAiCreateCourse}
  disabled={aiLoading}
  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
    isDark
      ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
      : "bg-white border-gray-200 text-gray-700 hover:shadow-md"
  } ${aiLoading ? "opacity-60 cursor-not-allowed" : ""}`}
>
  <Cpu size={18} className="text-[#E61A21]" />
  {aiLoading ? "AI Kurs Oluşturuyor..." : "AI ile Kurs Oluştur"}
</button>
          </div>


          {/* Course List - جدول الدورات */}
          <div className={`rounded-3xl border overflow-hidden ${
            isDark ? "bg-[#111] border-white/5" : "bg-white border-gray-100 shadow-sm"
          }`}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className={`font-bold text-lg italic ${isDark ? "text-white" : "text-gray-800"}`}>Mevcut Eğitim Programları</h2>
              <button
  onClick={() => setShowAll(!showAll)}
  className="text-sm text-[#E61A21] font-bold"
>
  {showAll ? "Daha Az Göster" : "Tümünü Gör"}
</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? "bg-white/5 text-gray-500" : "bg-gray-50/50 text-gray-400"}`}>
                  <tr>
                    <th className="px-8 py-4">Eğitim Adı</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Katılımcı</th>
                    <th className="px-6 py-4">Durum</th>
                    <th className="px-6 py-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-50"}`}>
                  {(showAll ? egitimler : egitimler.slice(0, 5)).map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E61A21] to-[#1a1a1a] flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            ST
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-800"}`}>{item.title}</p>
                            <p className="text-[11px] text-gray-500">Son güncelleme: {new Date(item.updated_at).toLocaleDateString("tr-TR")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-gray-500">{item.category}</td>
                      <td className="px-6 py-5 text-sm text-gray-500">{item.participant_count || 0} Öğrenci</td>
                      <td className="px-6 py-5">
                        <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-green-500/20">Aktif</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="relative inline-block">
  <button
    onClick={() =>
      setOpenMenuId(openMenuId === item.id ? null : item.id)
    }
    className="p-2 text-gray-500 hover:text-[#E61A21] transition-colors"
  >
    <MoreVertical size={18} />
  </button>

  {openMenuId === item.id && (
    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
      <button
        onClick={() => handleShowQuiz(item)}
        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50"
      >
        Detay Gör
      </button>

      <button
        onClick={() => handleEditCourse(item)}
        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50"
      >
        Düzenle
      </button>

      <button
        onClick={() => handleDeleteCourse(item.id)}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#E61A21] hover:bg-red-50"
      >
        Sil
      </button>
    </div>
  )}
</div>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {quizModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-6">
    <div className="w-full max-w-3xl rounded-3xl bg-white p-7 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black text-zinc-900">
          {selectedCourseTitle} - Quiz Soruları
        </h2>

        <button
          onClick={() => setQuizModalOpen(false)}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-black"
        >
          Kapat
        </button>
      </div>

      <div className="space-y-5 max-h-[65vh] overflow-y-auto">
        {quizQuestions.length === 0 ? (
          <p className="text-zinc-500 font-bold">Bu eğitime ait soru bulunamadı.</p>
        ) : (
          quizQuestions.map((q, index) => (
            <div key={q.id || index} className="rounded-2xl border p-5">
              <p className="font-black text-zinc-900 mb-3">
                {index + 1}. {q.question}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(q.options || []).map((opt, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                      opt === q.correct_answer
                        ? "bg-green-100 border-green-400 text-green-700"
                        : "bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {opt}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs font-black text-green-600">
                Doğru Cevap: {q.correct_answer}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

{editModalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-6">
    <div className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-zinc-900">
          Kurs Düzenle
        </h2>

        <button
          onClick={() => setEditModalOpen(false)}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-black"
        >
          Kapat
        </button>
      </div>

      <div className="space-y-4">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Kurs başlığı"
          className="w-full px-5 py-4 rounded-2xl border font-bold"
        />

        <input
          value={editCategory}
          onChange={(e) => setEditCategory(e.target.value)}
          placeholder="Kategori"
          className="w-full px-5 py-4 rounded-2xl border font-bold"
        />

        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Kurs açıklaması"
          rows={5}
          className="w-full px-5 py-4 rounded-2xl border font-bold"
        />

        <button
          onClick={handleSaveEdit}
          className="w-full py-4 rounded-2xl bg-[#E61A21] text-white font-black"
        >
          Kaydet
        </button>
      </div>
    </div>
  </div>
)}

        </div>
      )}
    </YoneticiLayout>
  );
}