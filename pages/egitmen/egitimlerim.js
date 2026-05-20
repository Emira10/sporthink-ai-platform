import { useEffect, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import CourseTable from "../../components/egitmen/CourseTable";
import EmptyState from "../../components/egitmen/EmptyState";
import { supabase } from "../../lib/supabaseClient";
import {
  IconCirclePlus,
  IconUpload,
  IconUserPlus,
  IconSearch,
  IconFilter,
  IconLoader2,
} from "@tabler/icons-react";

export default function Egitimlerim() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [contentType, setContentType] = useState("video");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTrainingId, setSelectedTrainingId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchCourses();
    async function fetchUsers() {
      const { data } = await supabase
        .from("kullanicilar")
        .select("kullanici_id, ad, soyad, e_posta")
        .order("ad", { ascending: true });
      setUsers(data || []);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [search, category, courses]);

  async function fetchCourses() {
    setLoading(true);
    const { data } = await supabase
      .from("courses_data")
      .select("*")
      .order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }

  function filterCourses() {
    let temp = [...courses];
    if (search) {
      temp = temp.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category !== "All") {
      temp = temp.filter((c) => c.category === category);
    }
    setFilteredCourses(temp);
  }

  async function handleDelete(courseId) {
  const confirmed = window.confirm("Silmek istediğine emin misin?");
  if (!confirmed) return;

  const res = await fetch("/api/egitmen/delete-course", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course_id: courseId }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Eğitim silinemedi.");
    return;
  }

  alert("Eğitim başarıyla silindi.");
  fetchCourses();
}

async function handleToggleActive(course) {
  const res = await fetch("/api/egitmen/update-course", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: course.id,
      is_active: !course.is_active,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Durum güncellenemedi.");
    return;
  }

  fetchCourses();
}

async function handleQuickEdit(course) {
  const title = window.prompt("Yeni eğitim başlığı:", course.title);
  if (title === null) return;

  const category = window.prompt("Yeni kategori:", course.category || "");
  if (category === null) return;

  const res = await fetch("/api/egitmen/update-course", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: course.id,
      title: title.trim(),
      category: category.trim(),
      content_type: course.content_type,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Eğitim güncellenemedi.");
    return;
  }

  alert("Eğitim güncellendi.");
  fetchCourses();
}

  async function handleUploadCourse() {
    if (!newTitle.trim()) return alert("Eğitim başlığı gerekli.");
    if (!newCategory.trim()) return alert("Kategori gerekli.");
    if (!selectedFile) return alert("PDF veya video dosyası seç.");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    const uploadRes = await fetch("/api/organizasyon/upload-training-file", {
      method: "POST",
      body: formData,
    });
    const uploadJson = await uploadRes.json();
    if (!uploadJson.ok) {
      setUploading(false);
      alert(uploadJson.message || "Dosya yüklenemedi.");
      return;
    }
    const uploadedUrl = uploadJson.url;
    const { error } = await supabase.from("courses_data").insert({
      title: newTitle.trim(),
      category: newCategory.trim(),
      content_type: contentType,
      file_url: uploadedUrl,
      video_url: contentType === "video" ? uploadedUrl : null,
    });
    setUploading(false);
    if (error) {
      alert("Eğitim kaydedilemedi: " + error.message);
      return;
    }

    await supabase.from("activity_logs").insert({
  activity_type: "course_created",
  user_name: "Eğitmen",
  activity_text: `${newTitle.trim()} eğitimi yayınlandı`,
});

    setNewTitle("");
    setNewCategory("");
    setContentType("video");
    setSelectedFile(null);
    alert("Eğitim başarıyla eklendi.");
    fetchCourses();
  }

  async function handleAssignTraining() {
    if (!selectedUserId) return alert("Öğrenci seç.");
    if (!selectedTrainingId) return alert("Eğitim seç.");
    const res = await fetch("/api/egitmen/assign-training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: selectedUserId,
        training_id: selectedTrainingId,
        due_date: dueDate || null,
        is_active: true,
      }),
    });
    const json = await res.json();
    if (!json.ok) {
      alert(json.message || "Atama yapılamadı.");
      return;
    }
    alert("Eğitim öğrenciye atandı ✅");
    setSelectedUserId("");
    setSelectedTrainingId("");
    setDueDate("");
  }

  const categories = ["All", ...new Set(courses.map((c) => c.category))];

  const inputClass = (isDark) =>
    `w-full rounded-xl px-4 py-3 border outline-none transition-all duration-200 text-sm font-semibold
    ${
      isDark
        ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50 focus:bg-white/[0.06]"
        : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm focus:border-[#E61A21]/50 focus:shadow-md"
    }`;

  const selectClass = (isDark) =>
    `w-full rounded-xl px-4 py-3 border outline-none transition-all duration-200 text-sm font-semibold
    ${
      isDark
        ? "bg-white/[0.03] border-white/10 text-white focus:border-[#E61A21]/50"
        : "bg-white border-zinc-200 text-zinc-900 shadow-sm focus:border-[#E61A21]/50"
    }`;

  return (
    <EgitmenLayout
      pageTitle="Eğitimlerim"
      pageSubtitle="Kurslarını yönet, filtrele ve analiz et"
    >
      {({ isDark }) => (
        <>
          {/* ── Yeni Eğitim Ekle ── */}
          <div
            style={{ borderTop: "3px solid #22C55E" }}
            className={`rounded-[1.5rem] p-6 mb-6 transition-all ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10">
                <IconCirclePlus size={18} strokeWidth={1.75} className="text-green-500" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-green-500">
                  İçerik Yönetimi
                </p>
                <h3 className={`text-base font-black uppercase italic ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Yeni Eğitim / PDF / Video Ekle
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Eğitim başlığı"
                className={inputClass(isDark)}
              />
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Kategori"
                className={inputClass(isDark)}
              />
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className={selectClass(isDark)}
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
              </select>
              <input
                type="file"
                accept={contentType === "pdf" ? "application/pdf" : "video/*"}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className={inputClass(isDark)}
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={handleUploadCourse}
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E61A21] text-white font-black text-sm uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {uploading ? (
                  <IconLoader2 size={16} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                ) : (
                  <IconUpload size={16} strokeWidth={2} aria-hidden="true" />
                )}
                {uploading ? "Yükleniyor..." : "Eğitimi Yayınla"}
              </button>

              {selectedFile && (
                <span className={`text-xs font-bold truncate max-w-[200px] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          {/* ── Öğrenciye Eğitim Ata ── */}
          <div
            style={{ borderTop: "3px solid #3B82F6" }}
            className={`rounded-[1.5rem] p-6 mb-6 transition-all ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                <IconUserPlus size={18} strokeWidth={1.75} className="text-blue-500" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
                  Atama Merkezi
                </p>
                <h3 className={`text-base font-black uppercase italic ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Öğrenciye Eğitim Ata
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={selectClass(isDark)}
              >
                <option value="">Öğrenci seç</option>
                {users.map((u) => (
                  <option key={u.kullanici_id} value={u.kullanici_id}>
                    {u.ad} {u.soyad} — {u.e_posta}
                  </option>
                ))}
              </select>

              <select
                value={selectedTrainingId}
                onChange={(e) => setSelectedTrainingId(e.target.value)}
                className={selectClass(isDark)}
              >
                <option value="">Eğitim seç</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass(isDark)}
              />

              <button
                type="button"
                onClick={handleAssignTraining}
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-[#3B82F6] text-white font-black text-sm uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-blue-900/30"
              >
                <IconUserPlus size={16} strokeWidth={2} aria-hidden="true" />
                Ata
              </button>
            </div>
          </div>

          {/* ── Search & Filter ── */}
          <div
            className={`rounded-[1.5rem] p-5 mb-6 ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <IconSearch
                  size={16}
                  strokeWidth={2}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Kurs ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${inputClass(isDark)} pl-10`}
                />
              </div>

              {/* Category filter */}
              <div className="relative md:w-56">
                <IconFilter
                  size={16}
                  strokeWidth={2}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  aria-hidden="true"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${selectClass(isDark)} pl-10`}
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Course Table ── */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2
                size={22}
                strokeWidth={1.75}
                className="animate-spin text-[#E61A21]"
                aria-hidden="true"
              />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Yükleniyor...
              </span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyState message="Sonuç bulunamadı" />
          ) : (
            <CourseTable
  courses={filteredCourses}
  onDelete={handleDelete}
  onEdit={handleQuickEdit}
  onToggleActive={handleToggleActive}
  isDark={isDark}
/>
          )}
        </>
      )}
    </EgitmenLayout>
  );
}