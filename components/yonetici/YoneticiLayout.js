import { useEffect, useState } from "react";
import YoneticiSidebar from "./YoneticiSidebar";
import YoneticiTopbar from "./YoneticiTopbar";

export default function YoneticiLayout({
  children,
  pageTitle = "Dashboard",
  pageSubtitle = "Yönetici paneline genel bakış",
  showTopbar = true,
}) {
  const [isDark, setIsDark] = useState(true);
  const [userName, setUserName] = useState("Amira"); // استخدام اسمك الافتراضي بناءً على ملفك

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedName = localStorage.getItem("userName");

    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    if (savedName && savedName !== "User undefined") {
      setUserName(savedName);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDark;
    setIsDark(nextMode);
    localStorage.setItem("theme", nextMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextMode);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .st-admin-root {
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          transition: background 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Ambient Noise - تأثير النسيج الذي أضفتيه يعطي عمقاً رائعاً */
        .st-admin-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23g)' opacity='0.035'/%3E%3C/svg%3E");
          opacity: ${isDark ? '0.4' : '0.2'};
        }

        /* المدار الأحمر (Orb) - جعلته يتفاعل مع حركة الماوس أو يظل ثابتاً خلف المحتوى */
        .st-ambient-orb {
          position: fixed;
          top: -10%;
          right: -5%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(230, 26, 33, ${isDark ? '0.06' : '0.03'}) 0%,
            transparent 70%
          );
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          display: block;
        }

        .st-admin-main {
          position: relative;
          z-index: 2;
          margin-left: 80px;
          min-height: 100vh;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 1024px) {
          .st-admin-main {
            margin-left: 280px; /* متوافق مع عرض السايدبار الجديد */
            padding: 40px 60px;
          }
        }

        /* تحسين سلاسة ظهور المحتوى */
        .st-admin-content {
          animation: st-fade-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes st-fade-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Custom Scrollbar الفخم */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(230, 26, 33, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        ::-webkit-scrollbar-thumb:hover { background: #E61A21; }
      `}</style>

      <div
        className={`st-admin-root ${isDark ? "st-admin-dark" : "st-admin-light"}`}
        style={{
          background: isDark
            ? "#080809" 
            : "#F8FAFC",
          color: isDark ? "#FFFFFF" : "#0F172A",
        }}
      >
        <div className="st-ambient-orb" />

        <YoneticiSidebar
          isDark={isDark}
          onToggleTheme={toggleTheme}
          userName={userName}
        />

        <main className="st-admin-main">
          <div className="st-admin-content">
            {showTopbar && (
              <YoneticiTopbar
                title={pageTitle}
                subtitle={pageSubtitle}
                isDark={isDark}
                userName={userName}
              />
            )}

            <div className="mt-8">
              {typeof children === "function"
                ? children({ isDark, userName })
                : children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}