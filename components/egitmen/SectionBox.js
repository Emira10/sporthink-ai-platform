export default function SectionBox({
  title,
  subtitle,
  children,
  isDark = true,
}) {
  return (
    <section
      className={`rounded-[2rem] border p-5 md:p-6 ${
        isDark
          ? "bg-white/5 border-white/5"
          : "bg-white border-zinc-200 shadow-sm"
      }`}
    >
      {(title || subtitle) && (
        <div className="mb-5">
          {title ? (
            <h3
              className={`text-lg md:text-xl font-black italic uppercase ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {title}
            </h3>
          ) : null}

          {subtitle ? (
            <p
              className={`mt-2 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] ${
                isDark ? "text-zinc-500" : "text-zinc-600"
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      )}

      {children}
    </section>
  );
}