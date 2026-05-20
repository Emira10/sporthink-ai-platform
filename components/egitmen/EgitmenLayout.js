import { useEffect, useState } from "react";
import EgitmenSidebar from "./EgitmenSidebar";
import EgitmenTopbar from "./EgitmenTopbar";

export default function EgitmenLayout({
  children,
  pageTitle = "Dashboard",
  pageSubtitle = "Eğitmen paneline genel bakış",
  showTopbar = true,
}) {
  const [isDark, setIsDark] = useState(true);
  const [userName, setUserName] = useState("Eğitmen");

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

    if (nextMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-all ${
        isDark ? "bg-[#1f201d] text-white" : "bg-[#F5F5F5] text-black"
      }`}
    >
      <EgitmenSidebar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        userName={userName}
      />

      <main className="ml-24 md:ml-64 p-8 md:p-10">
        {showTopbar && (
          <EgitmenTopbar
            title={pageTitle}
            subtitle={pageSubtitle}
            isDark={isDark}
            userName={userName}
          />
        )}

        {typeof children === "function"
          ? children({ isDark, userName })
          : children}
      </main>
    </div>
  );
}