import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EgitmenLayout from "../../../components/egitmen/EgitmenLayout";
import { supabase } from "../../../lib/supabaseClient";

export default function DuzenleEgitimPage() {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    video_url: "",
    type: "Video",
    is_mandatory: false,
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  async function fetchCourse() {
    setPageLoading(true);

    const { data, error } = await supabase
      .from("courses_data")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("Kurs bilgileri alınamadı!");
      setPageLoading(false);
      return;
    }

    setFormData({
      title: data.title || "",
      category: data.category || "",
      video_url: data.video_url || "",
      type: data.type || "Video",
      is_mandatory: data.is_mandatory || false,
    });

    setPageLoading(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("courses_data")
      .update({
        title: formData.title,
        category: formData.category,
        video_url: formData.video_url,
        type: formData.type,
        is_mandatory: formData.is_mandatory,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Güncelleme sırasında hata oluştu!");
      return;
    }

    alert("Kurs başarıyla güncellendi!");
    router.push("/egitmen/egitimlerim");
  }

  return (
    <EgitmenLayout
      pageTitle="Eğitimi Düzenle"
      pageSubtitle="Mevcut kurs bilgilerini güncelle"
    >
      <div className="max-w-3xl">
        {pageLoading ? (
          <p className="text-zinc-500">Yükleniyor...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-white/5 bg-white/5 p-6 md:p-8 space-y-6"
          >
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Eğitim Başlığı
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none focus:border-[#E61A21]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Kategori
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none focus:border-[#E61A21]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                Video URL
              </label>
              <input
                type="text"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none focus:border-[#E61A21]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                İçerik Türü
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none focus:border-[#E61A21]"
              >
                <option value="Video">Video</option>
                <option value="PDF">PDF</option>
                <option value="SCORM">SCORM</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="is_mandatory"
                type="checkbox"
                name="is_mandatory"
                checked={formData.is_mandatory}
                onChange={handleChange}
                className="w-5 h-5 accent-[#E61A21]"
              />
              <label
                htmlFor="is_mandatory"
                className="text-sm font-bold text-zinc-300"
              >
                Bu eğitim zorunlu mu?
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#E61A21] py-4 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-700 transition-all"
            >
              {loading ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
            </button>
          </form>
        )}
      </div>
    </EgitmenLayout>
  );
}