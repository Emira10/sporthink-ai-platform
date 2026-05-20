import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  User,
  Mail,
  Building2,
  ShieldCheck,
  CalendarDays,
  Star,
  Lock,
  Pencil,
  Palette,
  ChevronRight,
  Camera,
} from "lucide-react";

import KullaniciLayout from "../../components/KullaniciLayout";

export default function Profilim() {
  const [isDark, setIsDark] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState({
    name: "Kullanıcı",
    email: "-",
    department: "Genel",
    role: "Öğrenci",
    joined: "2026",
    level: 1,
    updatedAt: null,
    profilePhoto: null,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
        setLoading(true);
      const theme = localStorage.getItem("theme");
      setIsDark(theme !== "light");

      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(`/api/kullanici/profile?kullanici_id=${userId}`);
      const json = await res.json();

      if (json.ok && json.profile) {
        const nextProfile = {
          name: json.profile.name || "Kullanıcı",
          email: json.profile.email || "-",
          department: json.profile.department || "Genel",
          role: json.profile.role || "Öğrenci",
          joined: json.profile.joined
            ? new Date(json.profile.joined).getFullYear()
            : "2026",
          level: json.profile.level || 1,
          profilePhoto: json.profile.profilePhoto || null,
          updatedAt: json.profile.updatedAt || null,
        };

        setProfile(nextProfile);

        setForm({
          name: nextProfile.name,
          email: nextProfile.email,
          password: "",
        });
      }
    } catch (error) {
      console.error("Profil yüklenemedi:", error);
    } finally {
  setLoading(false);
}
  }

  function openModal(type) {
    setActiveModal(type);
    setForm({
      name: profile.name,
      email: profile.email,
      password: "",
    });
  }

  function closeModal() {
    setActiveModal(null);
  }

  function showToast(message, type = "success") {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 3000);
}

  function toggleThemeFromProfile() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  async function saveProfile() {
    try {
      setSaving(true);

      const userId = localStorage.getItem("userId");

      const res = await fetch("/api/kullanici/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kullanici_id: userId,
          name: form.name,
          email: form.email,
        }),
      });

      const json = await res.json();

      if (!json.ok) {
        alert(json.message || "Profil güncellenemedi");
        return;
      }

      setProfile((prev) => ({
        ...prev,
        name: json.profile.name,
        email: json.profile.email,
      }));

      localStorage.setItem("userName", json.profile.name);
      localStorage.setItem("userEmail", json.profile.email);

      closeModal();
      showToast("Profil başarıyla güncellendi");
    } catch (error) {
      console.error(error);
      showToast("Profil güncellenemedi", "error");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (!form.password || form.password.length < 6) {
      alert("Şifre en az 6 karakter olmalı");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });

    if (error) {
      alert("Şifre güncellenemedi: " + error.message);
      return;
    }

    closeModal();
    showToast("Şifre başarıyla güncellendi");
  }

  async function uploadProfilePhoto(e) {
  try {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Kullanıcı bulunamadı");

    const fileExt = file.name.split(".").pop();
    const fileName = `profile-${userId}-${Math.random()}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, {
  cacheControl: "3600",
  upsert: true,
  contentType: file.type,
});

    if (uploadError) {
      alert("Fotoğraf yüklenemedi: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    const res = await fetch("/api/kullanici/update-profile-photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kullanici_id: userId,
        profil_foto_url: publicUrl,
      }),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Fotoğraf kaydedilemedi");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      profilePhoto: publicUrl,
    }));

    alert("Profil fotoğrafı güncellendi");
  } catch (error) {
    console.error(error);
    alert("Fotoğraf yüklenemedi");
  }
}

async function removeProfilePhoto() {
  try {
    const userId = localStorage.getItem("userId");

    const res = await fetch("/api/kullanici/update-profile-photo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kullanici_id: userId,
        profil_foto_url: null,
      }),
    });

    const json = await res.json();

    if (!json.ok) {
      alert("Fotoğraf silinemedi");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      profilePhoto: null,
    }));

    alert("Fotoğraf kaldırıldı");
  } catch (error) {
    console.error(error);
    alert("Fotoğraf silinemedi");
  }
}

  const info = [
    { icon: Mail, label: "E-posta", value: profile.email },
    { icon: Building2, label: "Departman", value: profile.department },
    { icon: ShieldCheck, label: "Rol", value: profile.role },
    { icon: CalendarDays, label: "Katılım", value: profile.joined },
  ];

  const settings = [
    {
      icon: Lock,
      title: "Şifre Güncelle",
      desc: "Hesap güvenliği ayarları",
      action: () => openModal("password"),
    },
    {
      icon: Pencil,
      title: "Profil Düzenle",
      desc: "Kişisel bilgileri düzenle",
      action: () => openModal("profile"),
    },
    {
      icon: Palette,
      title: "Tema Ayarı",
      desc: isDark ? "Açık moda geç" : "Koyu moda geç",
      action: toggleThemeFromProfile,
    },
  ];

  if (loading) {
  return (
    <KullaniciLayout pageTitle="Profilim">
      <div className="max-w-6xl mx-auto">

        <div className="animate-pulse rounded-2xl h-[320px] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />

        <div className="mt-5 animate-pulse rounded-2xl h-[220px] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />

      </div>

        {toast && (
  <div className="fixed top-5 right-5 z-[9999]">

    <div
      className={`px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300
      ${
        toast.type === "error"
          ? "bg-red-500/90 border-red-400 text-white"
          : "bg-emerald-500/90 border-emerald-400 text-white"
      }`}
    >
      <p className="text-sm font-black">
        {toast.message}
      </p>
    </div>

  </div>
)}

    </KullaniciLayout>
  );
}

  return (
    <KullaniciLayout pageTitle="Profilim">
      <div className="max-w-6xl mx-auto space-y-5">
        <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-transparent blur-3xl rounded-full" />

          <div className="relative z-10 p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-[2px] shadow-lg shadow-rose-500/20">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                    {profile.profilePhoto ? (
  <img
    src={profile.profilePhoto}
    alt="Profil"
    className="w-full h-full rounded-2xl object-cover"
  />
) : (
  <User className="w-10 h-10 text-rose-500" />
)}
                  </div>
                </div>

                <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 cursor-pointer">
  <Camera className="w-4 h-4 text-white" />

  <input
    type="file"
    accept="image/*"
    onChange={uploadProfilePhoto}
    className="hidden"
  />
</label>

{profile.profilePhoto && (
  <button
    type="button"
    onClick={removeProfilePhoto}
    className="absolute top-0 right-0 w-7 h-7 rounded-lg bg-red-500 text-white text-xs font-black shadow-lg"
  >
    ×
  </button>
)}

              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {profile.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 mt-2">

  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
    ● Aktif Kullanıcı
  </span>

  <span className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700/60 text-[11px] font-bold text-slate-600 dark:text-slate-300">
    Son Güncelleme:{" "}
{profile.updatedAt
  ? new Date(profile.updatedAt).toLocaleDateString("tr-TR")
  : "Henüz yok"}
  </span>

</div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      Level {profile.level}
                    </span>
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                  SporThink AI destekli eğitim platformu kullanıcı profili.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {info.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-rose-500" />
                          </div>

                          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                            {item.label}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-900 dark:text-white break-words">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/20 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Hesap Ayarları
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Profil ve hesap yönetimi
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {settings.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={item.action}
                  className="group w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 hover:border-rose-300 dark:hover:border-rose-500/40 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-rose-500" />
                    </div>

                    <div className="text-left">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-all" />
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {activeModal === "profile" ? "Profil Düzenle" : "Şifre Güncelle"}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {activeModal === "profile"
                ? "Ad soyad ve e-posta bilgilerini güncelle."
                : "Yeni şifreni belirle."}
            </p>

            {activeModal === "profile" ? (
              <div className="space-y-3">
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                />

                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="E-posta"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                />
              </div>
            ) : (
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Yeni şifre"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
              />
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-black"
              >
                Vazgeç
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={activeModal === "profile" ? saveProfile : savePassword}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-black shadow-md shadow-rose-500/20 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </KullaniciLayout>
  );
}