export default function StatCard({
  title,
  value,
  subtitle,
  icon = "📌",
  isDark = true,
}) {
  return (
    <div
      className={`rounded-[2rem] border p-5 transition-all ${
        isDark
          ? "bg-white/5 border-white/5"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
            {title}
          </p>
          <h3
            className={`mt-4 text-2xl md:text-3xl font-black italic ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {value}
          </h3>
          {subtitle ? (
            <p
              className={`mt-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] ${
                isDark ? "text-zinc-500" : "text-zinc-600"
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#E61A21] text-white flex items-center justify-center text-xl shadow-lg shadow-red-600/20">
          {icon}
        </div>
      </div>
    </div>
  );
}