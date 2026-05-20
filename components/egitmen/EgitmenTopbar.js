export default function EgitmenTopbar({
  title = "Dashboard",
  subtitle = "Eğitmen paneline genel bakış",
  isDark = true,
  userName = "Eğitmen",
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E61A21] mb-3">
          Sporthink • Eğitmen
        </p>

        <h1
          className={`text-3xl md:text-5xl font-black italic tracking-tight uppercase ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          {title}
        </h1>

        <p
          className={`mt-3 text-xs md:text-sm font-bold uppercase tracking-[0.2em] ${
            isDark ? "text-zinc-500" : "text-zinc-600"
          }`}
        >
          {subtitle}
        </p>
      </div>

      <div
        className={`rounded-[2rem] border px-5 py-4 min-w-[220px] ${
          isDark
            ? "bg-white/5 border-white/5"
            : "bg-white border-zinc-200 shadow-sm"
        }`}
      >
        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-black">
          Hoş geldin
        </p>
        <p
          className={`mt-2 text-lg font-black ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          {userName}
        </p>
      </div>
    </div>
  );
}