export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  isDark = true,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2
          className={`text-2xl md:text-3xl font-black italic uppercase tracking-tight ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actionLabel ? (
        <button
          onClick={onAction}
          className="bg-[#E61A21] hover:bg-[#c91419] text-white rounded-2xl px-5 py-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-600/20"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}