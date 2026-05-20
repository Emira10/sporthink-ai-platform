import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('kullanici');
  const [showForgot, setShowForgot] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDark(false);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  alert("Hatalı e-posta veya şifre");
  setLoading(false);
  return;
}

      const fullName = `${data.ad} ${data.soy_ad}`;
      const role = data.rol || selectedRole;

      const user = data.user;

      localStorage.setItem("userName", user.email);
      if (role === 'egitmen') {
  router.push('/egitmen');
} else if (role === 'yonetici') {
  router.push('/yonetici/dashboard');
} else {
  router.push('/dashboard');
}
    } catch (err) {
      console.error('Error:', err.message);
      alert('Giriş yapılırken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen transition-colors duration-700 font-sans selection:bg-[#E61A21]/30 overflow-hidden ${
        isDark ? 'bg-[#050505]' : 'bg-[#f8f8f8]'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-[110] p-3 rounded-xl border transition-all duration-300 hover:scale-110 ${
          isDark
            ? 'bg-white/5 border-white/10 text-yellow-400'
            : 'bg-white border-black/5 text-gray-600 shadow-sm'
        }`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {isDark && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[35%] h-[35%] bg-red-600/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-red-900/5 blur-[100px] rounded-full pointer-events-none"></div>
        </>
      )}

      <div className="text-center relative z-10 animate-fadeIn w-full max-w-md px-6">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative w-20 h-20 flex items-center justify-center mb-1">
            <div
              className={`absolute inset-0 rounded-full border-2 border-t-[#E61A21] border-r-transparent animate-spin-slow ${
                isDark ? 'border-b-zinc-800' : 'border-b-zinc-200'
              }`}
            ></div>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border rotate-12 text-[#E61A21] text-3xl font-black italic shadow-xl transition-all duration-500 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'
              }`}
            >
              S
            </div>
          </div>
          <span
            className={`text-4xl font-black tracking-tighter italic uppercase ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}
          >
            SPOR<span className="text-[#E61A21]">THINK</span>
          </span>
        </div>

        <div
          className={`backdrop-blur-3xl p-8 rounded-[3rem] border transition-all duration-700 shadow-2xl ${
            isDark
              ? 'bg-white/[0.02] border-white/5 shadow-black/40'
              : 'bg-white border-zinc-200/50 shadow-zinc-200'
          }`}
        >
          <h2
            className={`text-[9px] font-black mb-6 uppercase tracking-[0.3em] italic ${
              isDark ? 'text-white/60' : 'text-zinc-400'
            }`}
          >
            Giriş Yap
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <RoleButton
              label="Kullanıcı"
              active={selectedRole === 'kullanici'}
              onClick={() => setSelectedRole('kullanici')}
              icon="👤"
              isDark={isDark}
            />
            <RoleButton
              label="Eğitmen"
              active={selectedRole === 'egitmen'}
              onClick={() => setSelectedRole('egitmen')}
              icon="🎓"
              isDark={isDark}
            />
            <RoleButton
              label="Yönetici"
              active={selectedRole === 'yonetici'}
              onClick={() => setSelectedRole('yonetici')}
              icon="🛡️"
              isDark={isDark}
            />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest ml-4 opacity-40">
                E-Posta
              </label>
              <input
                name="email"
                type="email"
                placeholder="ornek@sporthink.com"
                required
                className={`w-full border rounded-2xl p-4 text-xs outline-none focus:border-[#E61A21] transition-all duration-300 ${
                  isDark
                    ? 'bg-white/[0.03] border-white/5 text-white'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest ml-4 opacity-40">
                Şifre
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className={`w-full border rounded-2xl p-4 text-xs outline-none focus:border-[#E61A21] transition-all duration-300 ${
                  isDark
                    ? 'bg-white/[0.03] border-white/5 text-white'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#E61A21] text-white font-black py-5 rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Bağlan 🚀'
              )}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className={`text-[8px] uppercase tracking-[0.2em] font-black transition-colors hover:text-[#E61A21] ${
                isDark ? 'text-zinc-600' : 'text-zinc-400'
              }`}
            >
              Şifremi Unuttum
            </button>
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-sm p-8 rounded-[3rem] border shadow-2xl relative ${
              isDark
                ? 'bg-[#0a0a0a] border-white/10 text-white'
                : 'bg-white border-zinc-200 text-zinc-900'
            }`}
          >
            <button
              onClick={() => setShowForgot(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-red-500 transition-colors"
            >
              ✕
            </button>

            <h3 className="text-xl font-black uppercase mb-2 italic tracking-tighter">
              Kurtarma
            </h3>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-6 text-left">
              Sıfırlama linki e-postanıza gönderilecek.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="E-posta"
                className={`w-full border rounded-xl p-4 text-xs outline-none ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-zinc-50 border-zinc-200'
                }`}
              />
              <button
                type="button"
                className="w-full bg-[#E61A21] text-white font-black py-4 rounded-xl uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-red-600/20"
              >
                Talimat Gönder
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function RoleButton({ label, active, onClick, icon, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] border transition-all duration-500 group ${
        active
          ? 'bg-[#E61A21] border-[#E61A21] shadow-lg shadow-red-600/30 scale-105'
          : isDark
          ? 'bg-white/5 border-white/5 hover:border-white/10'
          : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
      }`}
    >
      <span
        className={`text-xl transition-transform duration-500 ${
          active ? 'scale-110' : 'grayscale opacity-30 group-hover:opacity-60'
        }`}
      >
        {icon}
      </span>
      <span className={`text-[8px] font-black uppercase tracking-tight ${active ? 'text-white' : 'text-zinc-500'}`}>
        {label}
      </span>
    </button>
  );
}