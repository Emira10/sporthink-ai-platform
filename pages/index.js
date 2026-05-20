import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  BrainCircuit,
  Activity,
  Trophy,
  Target,
  BarChart3,
  Dumbbell,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default function SporThinkLoginUltra() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ من الكود القديم: اختيار نوع الدخول الحقيقي
  const [selectedRole, setSelectedRole] = useState("kullanici");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  // ✅ نفس منطق الدخول القديم، لكن داخل التصميم الجديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      const user = data?.user;

      if (!user) {
        alert("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
  .from("kullanicilar")
  .select("kullanici_id, ad, soyad, e_posta, tur_id")
  .eq("e_posta", user.email)
  .single();

if (profileError || !profileData) {
  alert("Kullanıcı profili bulunamadı.");
  setLoading(false);
  return;
}

const fullName = `${profileData.ad || ""} ${profileData.soyad || ""}`.trim();

localStorage.setItem("userId", String(profileData.kullanici_id));
localStorage.setItem("userName", fullName || profileData.e_posta);
localStorage.setItem("userEmail", profileData.e_posta);
localStorage.setItem("userRole", String(profileData.tur_id));
localStorage.setItem("selectedRole", selectedRole);

      await supabase
  .from("kullanicilar")
  .update({
    son_giris_tarihi: new Date().toISOString(),
  })
  .eq("e_posta", email);

      // ✅ نفس التحويلات القديمة
      if (selectedRole === "egitmen") {
        router.push("/egitmen");
      } else if (selectedRole === "yonetici") {
        router.push("/yonetici/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error:", err?.message || err);
      alert("Giriş yapılırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      alert("Lütfen e-posta adresinizi yazın.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });

    if (error) {
      alert("Şifre sıfırlama bağlantısı gönderilemedi.");
      return;
    }

    alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    setShowForgot(false);
    setForgotEmail("");
  };

  const leftCards = [
    { icon: BarChart3, title: "Performans Analizi", value: "+97%" },
    { icon: BrainCircuit, title: "AI Öğrenme", value: "Akıllı" },
    { icon: Target, title: "Hedef Takibi", value: "Canlı" },
    { icon: Trophy, title: "Başarı Haritası", value: "Seviye" },
  ];

  const roles = [
    { key: "kullanici", label: "Kullanıcı", icon: User, desc: "Öğrenme Paneli" },
    { key: "egitmen", label: "Eğitmen", icon: GraduationCap, desc: "Eğitim Yönetimi" },
    { key: "yonetici", label: "Yönetici", icon: ShieldCheck, desc: "Yönetim Paneli" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(230,26,33,0.28),transparent_34%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.10),transparent_30%),linear-gradient(120deg,#050505_0%,#0b0b0d_45%,#f7f7f7_45%,#ffffff_100%)]" />
      <div className="absolute left-1/2 top-0 h-full w-[90px] -translate-x-1/2 -skew-x-[10deg] bg-gradient-to-b from-red-900 via-red-600 to-black shadow-[0_0_70px_rgba(230,26,33,0.75)]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[size:58px_58px]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative flex min-h-[52vh] flex-col justify-between px-8 py-8 sm:px-14 lg:min-h-screen lg:px-20 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-3 rounded-full border border-red-500/30 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-red-200 shadow-[0_0_35px_rgba(230,26,33,0.24)] backdrop-blur-xl">
              <Sparkles size={15} className="text-red-500" />
              AI Powered Learning
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl xl:text-6xl">
              Spor ve <span className="text-red-500 drop-shadow-[0_0_22px_rgba(230,26,33,0.8)]">Yapay Zeka</span>
            </h1>
            <p className="max-w-lg text-base font-semibold leading-8 text-zinc-300 sm:text-lg">
              Veri odaklı antrenman, akıllı öğrenme ve performans analizi tek bir elit platformda birleşir.
            </p>
          </motion.div>

          <div className="relative mx-auto my-10 h-[360px] w-[360px] max-w-full sm:h-[460px] sm:w-[460px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-red-500/40 shadow-[0_0_60px_rgba(230,26,33,0.42)]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full border border-white/20"
            />
            <div className="absolute inset-16 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.97),rgba(230,26,33,0.26)_46%,rgba(0,0,0,0.0)_70%)] blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-20 flex items-center justify-center rounded-full border border-red-500/50 bg-black/70 shadow-[inset_0_0_70px_rgba(230,26,33,0.35),0_0_90px_rgba(230,26,33,0.55)] backdrop-blur-xl"
            >
              <BrainCircuit className="h-28 w-28 text-white drop-shadow-[0_0_28px_rgba(230,26,33,1)]" />
            </motion.div>

            <motion.div
              animate={{ x: [0, 16, 0], y: [0, -10, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-26 left-3 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-black/70 px-5 py-4 shadow-[0_0_35px_rgba(230,26,33,0.36)] backdrop-blur-xl"
            >
              <Dumbbell className="text-red-500" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">SporThink</p>
                <p className="font-black">Veri Odaklı Eğitim</p>
              </div>
            </motion.div>

            {leftCards.map((item, index) => {
              const Icon = item.icon;
              const positions = [
                "left-0 top-24",
                "right-0 top-14",
                "right-0 bottom-24",
                "left-4 bottom-0",
              ];
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.12 }}
                  className={`absolute ${positions[index]} hidden w-36 rounded-2xl border border-white/10 bg-black/65 p-4 shadow-[0_0_24px_rgba(230,26,33,0.26)] backdrop-blur-xl sm:block`}
                >
                  <Icon className="mb-3 text-red-500" size={23} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{item.title}</p>
                  <p className="mt-1 text-sm font-black text-white">{item.value}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              "Akıllı Analiz",
              "Kişiselleştirilmiş Eğitim",
              "7/24 Erişim",
              "İlerlemeni Takip Et",
            ].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-center backdrop-blur-xl"
              >
                <Activity className="mx-auto mb-2 text-red-500" size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(230,26,33,0.15),transparent_32%),radial-gradient(circle_at_55%_80%,rgba(0,0,0,0.22),transparent_35%)]" />
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-[560px] rounded-[2.4rem] border border-red-500/35 bg-[#08090d]/90 p-6 shadow-[0_0_70px_rgba(230,26,33,0.28)] backdrop-blur-2xl sm:p-10"
          >
            <div className="absolute -inset-[1px] -z-10 rounded-[2.4rem] bg-gradient-to-br from-red-500/70 via-transparent to-white/10 blur-[1px]" />
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white to-red-700 text-5xl font-black text-black shadow-[0_0_50px_rgba(230,26,33,0.45)]">
                S<span className="text-red-700">T</span>
              </div>
              <h2 className="text-3xl font-black tracking-[0.24em] sm:text-4xl">
                SPORT<span className="text-red-500">HINK</span>
              </h2>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.26em] text-zinc-400">
                AI Destekli Online Eğitim Platformu
              </p>
              <p className="mt-7 text-xl font-bold text-zinc-100">
                Teknolojiyle düşün, <span className="text-red-500">sporla geliş!</span>
              </p>
            </div>

            {/* ✅ بدل Kayıt Ol: نقلنا الثلاثة Roles من القديم */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const active = selectedRole === role.key;
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => setSelectedRole(role.key)}
                    className={`group rounded-2xl border p-4 text-center transition-all duration-500 ${
                      active
                        ? "border-red-500 bg-gradient-to-br from-red-700 to-red-500 text-white shadow-[0_0_32px_rgba(230,26,33,0.42)] scale-[1.03]"
                        : "border-white/10 bg-black/30 text-zinc-500 hover:border-red-500/40 hover:bg-red-500/10 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={26}
                      className={`mx-auto mb-3 transition-all ${active ? "text-white" : "text-zinc-500 group-hover:text-red-400"}`}
                    />
                    <p className="text-xs font-black uppercase tracking-wider">{role.label}</p>
                    <p className={`mt-1 hidden text-[9px] font-bold uppercase tracking-widest sm:block ${active ? "text-white/70" : "text-zinc-600"}`}>
                      {role.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 transition-all focus-within:border-red-500/60 focus-within:shadow-[0_0_26px_rgba(230,26,33,0.22)]">
                <Mail className="text-zinc-400 group-focus-within:text-red-500" size={21} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="Kullanıcı Adı / E-posta"
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-500"
                />
              </label>

              <label className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 transition-all focus-within:border-red-500/60 focus-within:shadow-[0_0_26px_rgba(230,26,33,0.22)]">
                <Lock className="text-zinc-400 group-focus-within:text-red-500" size={21} />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Şifre"
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-zinc-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-400 hover:text-red-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-red-600"
                  />
                  Beni Hatırla
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgot(true);
                  }}
                  className="font-bold text-red-500 hover:text-red-400"
                >
                  Şifremi Unuttum?
                </button>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 py-4 text-base font-black text-white shadow-[0_0_38px_rgba(230,26,33,0.36)] transition-all hover:shadow-[0_0_55px_rgba(230,26,33,0.58)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="transition-transform group-hover:translate-x-1" size={21} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="my-7 flex items-center gap-4 text-xs font-bold text-zinc-500">
              <div className="h-px flex-1 bg-white/10" />
              SporThink
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm font-semibold leading-7 text-zinc-400">
              “Bugünün sporcusu, yarının lideridir.”
              <br />
              <span className="text-red-500">SporThink</span> ile potansiyelini keşfet.
            </p>
          </motion.div>
        </div>
      </section>

      {showForgot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#09090b] p-7 text-white shadow-[0_0_55px_rgba(230,26,33,0.25)]"
          >
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="absolute right-5 top-5 text-zinc-500 transition-colors hover:text-red-500"
            >
              ✕
            </button>

            <h3 className="mb-2 text-2xl font-black uppercase tracking-tight">Kurtarma</h3>
            <p className="mb-5 text-xs font-semibold leading-6 text-zinc-500">
              Şifre sıfırlama bağlantısı e-posta adresinize gönderilecek.
            </p>

            <input
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              type="email"
              placeholder="E-posta"
              className="mb-4 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm outline-none transition-all focus:border-red-500/60"
            />

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full rounded-2xl bg-gradient-to-r from-red-700 to-red-500 py-4 text-sm font-black text-white shadow-[0_0_35px_rgba(230,26,33,0.3)]"
            >
              Talimat Gönder
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}
