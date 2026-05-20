import {
  IconVideo,
  IconFileTypePdf,
  IconEye,
  IconPencil,
  IconTrash,
  IconToggleRight,
  IconToggleLeft,
  IconPlayerPlay,
  IconFileText,
} from "@tabler/icons-react";

export default function CourseTable({
  courses = [],
  onDelete,
  onEdit,
  onToggleActive,
  isDark = true,
}) {
  function isPdf(course) {
    const type = String(course.content_type || course.type || "").toLowerCase();
    const url = String(course.file_url || course.video_url || "").toLowerCase();
    return type.includes("pdf") || url.includes(".pdf");
  }

  function getYoutubeId(url) {
    if (!url) return null;
    if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0];
    if (url.includes("/embed/")) return url.split("/embed/")[1]?.split("?")[0];
    return null;
  }

  function getVideoThumb(course) {
    if (course.thumbnail_url) return course.thumbnail_url;
    const id = getYoutubeId(course.video_url);
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    return null;
  }

  const pdfCourses = courses.filter(isPdf);
  const videoCourses = courses.filter((c) => !isPdf(c));

  function ActionButtons({ course, compact = false }) {
    const openUrl = course.file_url || course.video_url;

    return (
      <div className={compact ? "flex gap-2" : "flex flex-wrap gap-2 pt-4"}>
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className={compact
              ? "w-9 h-9 rounded-xl bg-[#E61A21] text-white flex items-center justify-center"
              : "inline-flex items-center gap-2 rounded-xl bg-[#E61A21] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-white hover:bg-red-700 transition-all"}
          >
            {isPdf(course) ? <IconFileText size={14} /> : <IconPlayerPlay size={14} />}
            {!compact && (isPdf(course) ? "PDF Aç" : "Videoyu Aç")}
          </a>
        )}

        <button
          type="button"
          onClick={() => onEdit?.(course)}
          className={compact
            ? "w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"
            : "inline-flex items-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-blue-500 hover:bg-blue-500/20 transition-all"}
        >
          <IconPencil size={14} />
          {!compact && "Düzenle"}
        </button>

        <button
          type="button"
          onClick={() => onToggleActive?.(course)}
          className={compact
            ? `w-9 h-9 rounded-xl flex items-center justify-center ${
                course.is_active === false ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
              }`
            : `inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                course.is_active === false
                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              }`}
        >
          {course.is_active === false ? <IconToggleLeft size={15} /> : <IconToggleRight size={15} />}
          {!compact && (course.is_active === false ? "Aktifleştir" : "Pasifleştir")}
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(course.id)}
          className={compact
            ? "w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
            : "inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-red-500 hover:bg-red-500/20 transition-all"}
        >
          <IconTrash size={14} />
          {!compact && "Sil"}
        </button>
      </div>
    );
  }

  function VideoCard({ course }) {
    const thumb = getVideoThumb(course);

    return (
      <div className={`rounded-[2rem] overflow-hidden border transition-all hover:-translate-y-1 ${
        isDark ? "border-white/5 bg-white/[0.03]" : "border-zinc-200 bg-white shadow-sm"
      }`}>
        <div className="relative aspect-video bg-black overflow-hidden">
          {thumb ? (
            <img src={thumb} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <IconVideo size={42} className="text-zinc-500" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <span className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-[10px] font-black uppercase">
            <IconVideo size={13} />
            Video
          </span>

          <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
            course.is_active === false ? "bg-zinc-900/70 text-zinc-300" : "bg-emerald-500 text-white"
          }`}>
            {course.is_active === false ? "Pasif" : "Aktif"}
          </span>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E61A21] mb-2">
            {course.category || "Genel"}
          </p>

          <h3 className={`text-lg font-black leading-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {course.title}
          </h3>

          <p className={`text-xs leading-6 line-clamp-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {course.description || "Video eğitim içeriği."}
          </p>

          <ActionButtons course={course} />
        </div>
      </div>
    );
  }

  function PdfCard({ course }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border p-2 transition-all hover:-translate-y-1 hover:shadow-2xl ${
        isDark
          ? "border-red-500/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-red-500/[0.06]"
          : "border-red-100 bg-gradient-to-br from-white via-red-50/40 to-orange-50/40 shadow-sm"
      }`}
    >
      <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-[#E61A21]/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-20 h-28 shrink-0">
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-red-500/10 border border-red-200/60" />

          <div className="relative h-full rounded-2xl bg-white shadow-xl border border-red-100 overflow-hidden">
            <div className="h-11 bg-[#E61A21] flex items-center justify-between px-4">
              <span className="text-white text-[10px] font-black tracking-widest">PDF</span>
              <IconFileTypePdf size={16} className="text-white" />
            </div>

            <div className="p-4 space-y-2.5">
              <div className="h-2.5 bg-zinc-900 rounded-full w-5/6" />
              <div className="h-2 bg-zinc-300 rounded-full w-full" />
              <div className="h-2 bg-zinc-200 rounded-full w-4/5" />
              <div className="h-2 bg-zinc-200 rounded-full w-3/5" />

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="h-8 rounded-lg bg-red-50 border border-red-100" />
                <div className="h-8 rounded-lg bg-zinc-50 border border-zinc-100" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E61A21] to-orange-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0 relative">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-[#E61A21] text-[10px] font-black uppercase tracking-widest">
              <IconFileText size={14} />
              Digital Document
            </span>

            <span
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${
                course.is_active === false
                  ? "bg-zinc-500/10 text-zinc-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {course.is_active === false ? "Pasif" : "Aktif"}
            </span>
          </div>

          <h3 className={`text-base font-black leading-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {course.title}
          </h3>

          <p className={`text-[11px] uppercase tracking-[0.25em] font-black mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
            {course.category || "Doküman Eğitimi"}
          </p>

          <p className={`text-sm leading-7 mb-5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {course.description || "Bu PDF içeriği, öğrencilerin doküman üzerinden öğrenmesini destekleyen yapılandırılmış eğitim materyalidir."}
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className={`rounded-2xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-white/70 border border-red-100"}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Format</p>
              <p className="text-sm font-black text-[#E61A21]">PDF</p>
            </div>
            <div className={`rounded-2xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-white/70 border border-red-100"}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tür</p>
              <p className={`text-sm font-black ${isDark ? "text-white" : "text-zinc-900"}`}>Doküman</p>
            </div>
            <div className={`rounded-2xl p-3 ${isDark ? "bg-white/[0.04]" : "bg-white/70 border border-red-100"}`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Durum</p>
              <p className={`text-sm font-black ${course.is_active === false ? "text-zinc-500" : "text-emerald-500"}`}>
                {course.is_active === false ? "Pasif" : "Aktif"}
              </p>
            </div>
          </div>

          <ActionButtons course={course} />
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-8">
      {videoCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <IconVideo size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500">
                Video Library
              </p>
              <h2 className={`text-xl font-black uppercase italic ${isDark ? "text-white" : "text-zinc-900"}`}>
                Video Eğitimleri
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {videoCourses.map((course) => (
              <VideoCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {pdfCourses.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-[#E61A21] flex items-center justify-center">
              <IconFileTypePdf size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E61A21]">
                Document Library
              </p>
              <h2 className={`text-xl font-black uppercase italic ${isDark ? "text-white" : "text-zinc-900"}`}>
                PDF / Doküman Eğitimleri
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pdfCourses.map((course) => (
              <PdfCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}