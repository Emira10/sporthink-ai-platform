import Link from "next/link";
import { useRouter } from "next/router";
import yoneticiMenu from "../../utils/yoneticiMenu";
// استيراد الأيقونات الاحترافية - تأكدي من تثبيت lucide-react عبر npm install lucide-react
import { 
  LayoutDashboard, Users, ShieldCheck, Building2, Award, 
  UserPlus, GraduationCap, LineChart, BarChart3, Megaphone, 
  Map, Sparkles, Database, Settings2, Sun, Moon, LogOut, UserCircle
} from "lucide-react";

export default function YoneticiSidebar({
  isDark = true,
  onToggleTheme,
  userName = "Yönetici",
}) {
  const router = useRouter();

  // خريطة الأيقونات الاحترافية بناءً على الأقسام
  const getIcon = (label, isActive) => {
    const iconProps = {
      size: 20,
      strokeWidth: isActive ? 2.5 : 2,
      className: "transition-all duration-300"
    };

    switch (label) {
      case "Dashboard": return <LayoutDashboard {...iconProps} />;
      case "Kullanıcılar": return <Users {...iconProps} />;
      case "Rol & Yetki": return <ShieldCheck {...iconProps} />;
      case "Organizasyon": return <Building2 {...iconProps} />;
      case "Sertifikalar": return <Award {...iconProps} />;
      case "Eğitim Atamaları": return <UserPlus {...iconProps} />;
      case "Eğitim Yönetimi": return <GraduationCap {...iconProps} />;
      case "İlerleme": return <LineChart {...iconProps} />;
      case "Raporlar": return <BarChart3 {...iconProps} />;
      case "Duyurular": return <Megaphone {...iconProps} />;
      case "Yol Haritaları": return <Map {...iconProps} />;
      case "AI Asistan": return <Sparkles {...iconProps} />;
      case "Profilim": return <UserCircle {...iconProps} />;
      case "Sistem": return <Database {...iconProps} />;
      case "Ayarlar": return <Settings2 {...iconProps} />;
      default: return <LayoutDashboard {...iconProps} />;
    }
  };

  return (
    <>
      <style>{`
        /* ── SPORTHINK PRO ADMIN SIDEBAR ── */
        .st-sidebar {
          font-family: 'Inter', sans-serif;
          position: fixed;
          left: 0; top: 0;
          height: 100%;
          width: 80px;
          z-index: 50;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .st-sidebar { width: 280px; }
        }

        /* Glassmorphism Effect */
        .st-sidebar-dark {
          background: rgba(10, 10, 12, 0.95) !important;
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }

        /* Logo Styling */
        .st-logo-container {
          padding: 32px 24px;
          margin-bottom: 20px;
        }

        .st-logo-mark {
          width: 40px; height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #E61A21 0%, #B01218 100%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: white;
          box-shadow: 0 8px 20px rgba(230, 26, 33, 0.3);
        }

        /* Nav Items */
        .st-nav-link {
          margin: 4px 16px;
          padding: 12px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          color: #888;
          text-decoration: none !important;
        }

        .st-nav-link:hover {
          background: rgba(230, 26, 33, 0.05);
          color: #E61A21;
        }

        .st-nav-active {
          background: rgba(230, 26, 33, 0.1) !important;
          color: #E61A21 !important;
          box-shadow: inset 0 0 0 1px rgba(230, 26, 33, 0.2);
        }

        .st-nav-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        /* Section Header */
        .st-section-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #444;
          padding: 20px 30px 10px;
        }

        .st-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <aside className={`st-sidebar ${isDark ? "st-sidebar-dark" : "bg-white border-r"}`}>
        {/* Header / Logo */}
        <div className="st-logo-container">
          <Link href="/yonetici/dashboard" className="flex items-center gap-3 decoration-none">
            <div className="st-logo-mark text-xl">S</div>
            <div className="hidden md:block">
              <h1 className={`text-lg font-black tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
                SPORT<span className="text-[#E61A21]">THINK</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-40">Admin Engine</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="st-scroll flex-1 overflow-y-auto overflow-x-hidden">
          <p className="st-section-title hidden md:block">Main Management</p>
          {yoneticiMenu.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`st-nav-link ${isActive ? "st-nav-active" : ""}`}
              >
                <span className={isActive ? "text-[#E61A21]" : "text-current"}>
                  {getIcon(item.label, isActive)}
                </span>
                <span className="st-nav-label hidden md:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Controls */}
        <div className="p-4 mt-auto border-t border-white/5">
          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors mb-2 text-zinc-500"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden md:block text-xs font-bold uppercase tracking-wider">
              {isDark ? "Aydınlık Mod" : "Karanlık Mod"}
            </span>
          </button>

          {/* Logout */}
          <button 
            onClick={() => router.push("/")}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
          >
            <LogOut size={18} />
            <span className="hidden md:block text-xs font-bold uppercase tracking-wider">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}