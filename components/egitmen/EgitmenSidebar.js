import Link from "next/link";
import { useRouter } from "next/router";
import { IconSun, IconMoon, IconLogout } from "@tabler/icons-react";
import egitmenMenu from "../../utils/egitmenMenu";

export default function EgitmenSidebar({
  isDark = true,
  onToggleTheme,
  userName = "Eğitmen",
}) {
  const router = useRouter();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-24 md:w-64 border-r z-50 transition-all ${
        isDark
          ? "bg-[#1a1b18] border-white/10"
          : "bg-white border-zinc-200"
      }`}
    >
      <div className="flex h-full flex-col overflow-y-auto overscroll-contain scrollbar-hide">

        {/* Logo */}
        <div
          onClick={() => router.push("/egitmen")}
          className="flex items-center gap-3 px-5 py-6 cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 bg-[#E61A21] rounded-xl flex items-center justify-center font-black italic text-white shadow-lg shadow-red-900/20">
            S
          </div>
          <span
            className={`hidden md:block font-black tracking-tight text-sm uppercase ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            SPOR<span className="text-[#E61A21]">THINK</span>
          </span>
        </div>

        {/* User info */}
        <div className="hidden md:block px-5 pb-5 shrink-0">
          <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-black">
            Eğitmen Paneli
          </p>
          <p
            className={`mt-1 text-sm font-bold truncate ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {userName}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {egitmenMenu.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative w-full flex items-center gap-3 rounded-none md:rounded-xl px-4 py-3 transition-all ${
                  isActive
                    ? isDark
                      ? "bg-[#E61A21]/10 text-[#E61A21]"
                      : "bg-[#FBE3E3] text-[#E61A21]"
                    : isDark
                    ? "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#E61A21]" />
                )}

                <Icon
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="shrink-0"
                />

                <span className="hidden md:block text-[13px] font-bold leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div
          className={`mx-3 mt-6 pt-4 pb-5 border-t shrink-0 ${
            isDark ? "border-white/10" : "border-zinc-200"
          }`}
        >
          <button
            onClick={onToggleTheme}
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 transition-all ${
              isDark
                ? "border border-white/20 text-yellow-400 hover:bg-white/5"
                : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {isDark ? (
              <IconSun size={20} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <IconMoon size={20} strokeWidth={1.75} aria-hidden="true" />
            )}
            <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-3 w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-red-500 hover:bg-red-500/10 transition-all"
          >
            <IconLogout size={20} strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden md:block font-black text-[10px] uppercase tracking-widest">
              Çıkış
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </aside>
  );
}