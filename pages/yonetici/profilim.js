import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";
import { supabase } from "../../lib/supabaseClient";

import {
  Pencil,
  Lock,
  Palette,
  Camera,
  Users,
  BookOpen,
  Pin,
  ShieldCheck,
  MonitorCheck,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
.yp-root{font-family:'Outfit',sans-serif;}
@keyframes yp-breathe{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes yp-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
`;

function tk(isDark) {
  return {
    surface: isDark ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.9)",
    surface2: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,1)",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#fff" : "#0A0A0A",
    muted: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.46)",
    faint: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.25)",
    shadow: isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 2px 20px rgba(0,0,0,0.07)",
    red: "#E61A21",
  };
}

function dateTR(value) {
  if (!value) return "Henüz yok";
  return new Date(value).toLocaleDateString("tr-TR");
}

export default function YoneticiProfilim() {
  const [profile, setProfile] = useState({
    name: "Yönetici",
    email: "-",
    role: "Yönetici / Admin",
    department: "İnsan Kaynakları / Yönetim",
    joined: null,
    updatedAt: null,
    lastLogin: null,
    profilePhoto: null,
  });

  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeTrainings: 0,
    pendingAnnouncements: 0,
  });

  const [security, setSecurity] = useState({
    authorityLevel: "Tam Yetkili",
    panelAccess: "Yönetici Paneli",
    systemStatus: "Aktif",
    lastLogin: null,
  });

  const [form, setForm] = useState({ name: "", email: "", department: "", password: "" });
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailsModal, setDetailsModal] = useState(null);
  const [detailsData, setDetailsData] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  function showToast(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function openSummaryDetails(card) {
  try {
    let type = "users";

    if (card.label.includes("Eğitim")) {
      type = "trainings";
    }

    if (card.label.includes("İşlem")) {
      type = "pending";
    }

    const res = await fetch(
      `/api/yonetici/summary-details?type=${type}`
    );

    const json = await res.json();

    if (!json.ok) {
      throw new Error(json.message);
    }

    setDetailsData(json.items || []);
    setDetailsModal(card);
  } catch (error) {
    console.error(error);
    showToast("Detaylar alınamadı", "err");
  }
}

  async function loadProfile() {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(`/api/yonetici/profile?kullanici_id=${userId}`);
      const json = await res.json();

      if (!json.ok) throw new Error(json.message);

      setProfile(json.profile);
      setSummary(json.summary);
      setSecurity(json.security);

      setForm({
        name: json.profile.name || "",
        email: json.profile.email || "",
        department: json.profile.department || "",
        password: "",
      });
    } catch (e) {
      console.error(e);
      showToast("Profil yüklenemedi", "err");
    } finally {
      setLoading(false);
    }
  }

  function openModal(type) {
    setActiveModal(type);
    setForm({
      name: profile.name,
      email: profile.email,
      department: profile.department,
      password: "",
    });
  }

  function closeModal() {
    setActiveModal(null);
  }

  async function saveProfile() {
    try {
      setSaving(true);
      const userId = localStorage.getItem("userId");

      const res = await fetch("/api/yonetici/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kullanici_id: userId,
          name: form.name,
          email: form.email,
          department: form.department,
        }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message);

      setProfile((prev) => ({
        ...prev,
        name: json.profile.name,
        email: json.profile.email,
        department: json.profile.department,
        updatedAt: json.profile.updatedAt,
      }));

      localStorage.setItem("userName", json.profile.name);
      localStorage.setItem("userEmail", json.profile.email);

      closeModal();
      showToast("Yönetici profili güncellendi ✓");
    } catch (e) {
      showToast(e.message || "Güncelleme hatası", "err");
    } finally {
      setSaving(false);
    }
  }

  async function savePassword() {
    if (!form.password || form.password.length < 6) {
      showToast("Şifre en az 6 karakter olmalı", "err");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: form.password });

    if (error) {
      showToast("Şifre güncellenemedi", "err");
      return;
    }

    closeModal();
    showToast("Şifre başarıyla güncellendi ✓");
  }

  async function uploadPhoto(e) {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const userId = localStorage.getItem("userId");
      const ext = file.name.split(".").pop();
      const fileName = `yonetici-${userId}-${Math.random()}-${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (error) throw error;

      const { data } = supabase.storage.from("profile-images").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      const res = await fetch("/api/yonetici/update-profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullanici_id: userId, profil_foto_url: publicUrl }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message);

      setProfile((prev) => ({
        ...prev,
        profilePhoto: publicUrl,
        updatedAt: json.updatedAt,
      }));

      showToast("Profil fotoğrafı güncellendi ✓");
    } catch (e) {
      showToast("Fotoğraf yüklenemedi", "err");
    }
  }

  async function removePhoto() {
    try {
      const userId = localStorage.getItem("userId");

      const res = await fetch("/api/yonetici/update-profile-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullanici_id: userId, profil_foto_url: null }),
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.message);

      setProfile((prev) => ({
        ...prev,
        profilePhoto: null,
        updatedAt: json.updatedAt,
      }));

      showToast("Fotoğraf kaldırıldı ✓");
    } catch (e) {
      showToast("Fotoğraf silinemedi", "err");
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      <YoneticiLayout pageTitle="Yönetici Profilim" pageSubtitle="Yetki, güvenlik ve hesap yönetimi">
        {({ isDark, onToggleTheme }) => {
          const t = tk(isDark);

          if (loading) {
            return (
              <div className="yp-root" style={{ display: "grid", gap: "16px" }}>
                <div style={{ height: 190, borderRadius: 24, background: t.surface, border: `1px solid ${t.border}` }} />
                <div style={{ height: 140, borderRadius: 22, background: t.surface, border: `1px solid ${t.border}` }} />
                <div style={{ height: 160, borderRadius: 22, background: t.surface, border: `1px solid ${t.border}` }} />
              </div>
            );
          }

          const summaryCards = [
  { icon: Users, label: "Toplam Kullanıcı", value: summary.totalUsers, color: "#E61A21" },
  { icon: BookOpen, label: "Aktif Eğitim", value: summary.activeTrainings, color: "#3B82F6" },
  { icon: Pin, label: "Bekleyen İşlem", value: summary.pendingAnnouncements, color: "#F59E0B" },
];

          const securityCards = [
  { icon: ShieldCheck, label: "Yetki Seviyesi", value: security.authorityLevel },
  { icon: MonitorCheck, label: "Panel Erişimi", value: security.panelAccess },
  { icon: CheckCircle2, label: "Sistem Durumu", value: security.systemStatus },
  { icon: Clock3, label: "Son Giriş", value: security.lastLogin ? dateTR(security.lastLogin) : "Bugün" },
];

          return (
            <div className="yp-root" style={{ position: "relative" }}>
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 80, opacity: 0 }}
                    style={{
                      position: "fixed",
                      top: 24,
                      right: 24,
                      zIndex: 99999,
                      padding: "13px 20px",
                      borderRadius: 16,
                      fontWeight: 800,
                      fontSize: 13,
                      background: toast.type === "ok" ? "rgba(16,185,129,.92)" : "rgba(239,68,68,.92)",
                      color: "#fff",
                    }}
                  >
                    {toast.msg}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "grid", gap: 18 }}>
                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 24,
                    padding: 22,
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    boxShadow: t.shadow,
                  }}
                >
                  <div style={{ position: "absolute", inset: "0 0 auto 0", height: 2, background: "linear-gradient(90deg,transparent,#E61A21,transparent)" }} />

                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 104, height: 104, borderRadius: 24, padding: 2, background: "linear-gradient(145deg,#E61A21,#ff4d52)" }}>
                        <div style={{ width: "100%", height: "100%", borderRadius: 22, background: isDark ? "#09090B" : "#fff", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "#E61A21", fontSize: 34, fontWeight: 900 }}>
                          {profile.profilePhoto ? (
                            <img src={profile.profilePhoto} alt="Profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            "Y"
                          )}
                        </div>
                      </div>

                      <label style={{ position: "absolute", bottom: -8, right: -8, width: 34, height: 34, borderRadius: 12, background: "linear-gradient(135deg,#E61A21,#ff4d52)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
                        📷
                        <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
                      </label>

                      {profile.profilePhoto && (
                        <button onClick={removePhoto} style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: 10, border: "none", background: "#E61A21", color: "#fff", fontWeight: 900 }}>
                          ×
                        </button>
                      )}
                    </div>

                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "yp-breathe 2.5s infinite" }} />
                        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.34em", textTransform: "uppercase", color: "#10B981" }}>
                          Aktif Yönetici
                        </span>
                      </div>

                      <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: "clamp(34px,4vw,52px)", lineHeight: 0.9, color: t.text }}>
                        {profile.name}
                      </h1>

                      <p style={{ marginTop: 8, fontSize: 13, color: t.muted, fontWeight: 500 }}>
                        SportThink yönetim paneli profil ve güvenlik merkezi.
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                        {[profile.role, profile.email, profile.department, `Katılım: ${dateTR(profile.joined)}`, `Son Güncelleme: ${dateTR(profile.updatedAt)}`].map((x) => (
                          <span key={x} style={{ padding: "7px 11px", borderRadius: 12, background: x.includes("Yönetici") ? "rgba(230,26,33,.1)" : t.surface2, border: `1px solid ${x.includes("Yönetici") ? "rgba(230,26,33,.25)" : t.border}`, color: x.includes("Yönetici") ? "#E61A21" : t.muted, fontSize: 11, fontWeight: 800 }}>
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 18 }}>
                  <section style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
                    {securityCards.map((c) => (
                      <div key={c.label} style={{ padding: 14, borderRadius: 18, background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 34, height: 34, borderRadius: 11, background: "rgba(230,26,33,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><c.icon size={17} color="#E61A21" strokeWidth={2.4} /></div>
                          <div>
                            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: ".2em", color: t.faint, textTransform: "uppercase" }}>{c.label}</p>
                            <p style={{ fontSize: 13, fontWeight: 900, color: t.text }}>{c.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>

                  <section style={{ borderRadius: 22, padding: 18, background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                    <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: ".28em", color: "#E61A21", textTransform: "uppercase", marginBottom: 12 }}>Yönetici Özeti</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                      {summaryCards.map((s) => (
                        <motion.button
  key={s.label}
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  onClick={() => openSummaryDetails(s)}
  style={{ padding: "14px 10px", borderRadius: 16, background: t.surface2, border: `1px solid ${t.border}`, textAlign: "center" }}>
                          <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
  <s.icon size={20} color={s.color} strokeWidth={2.4} />
</div>
                          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</div>
                          <p style={{ fontSize: 9, fontWeight: 900, color: t.faint, textTransform: "uppercase" }}>{s.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                </div>

                <section style={{ borderRadius: 22, padding: 18, background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
                  <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: ".28em", color: "#E61A21", textTransform: "uppercase" }}>Account Control</p>
                  <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: t.text, marginTop: 2 }}>Hesap Ayarları</h2>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginTop: 14 }}>
                    {[
  [Pencil, "Profil Düzenle", "Ad, e-posta ve departman bilgilerini yönet", () => openModal("profile")],
  [Lock, "Şifre Güncelle", "Yönetici hesabı güvenliğini güncelle", () => openModal("password")],
  [Palette, "Tema Ayarı", "Panel görünüm modunu değiştir", onToggleTheme],
  [Camera, "Profil Fotoğrafı", "Yönetici profil görselini güncelle", () => document.querySelector("#yonetici-photo-input")?.click()],
].map(([Icon, title, desc, action]) => (

                      <motion.button key={title} whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.97 }} onClick={action} style={{ padding: "16px 12px", borderRadius: 18, background: t.surface2, border: `1px solid ${t.border}`, color: t.text, cursor: "pointer", textAlign: "left" }}>
                        <div
  style={{
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "rgba(230,26,33,.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  }}
>
  <Icon size={18} color="#E61A21" strokeWidth={2.4} />
</div>

<p style={{ fontSize: 12, fontWeight: 900 }}>{title}</p>
<p style={{ fontSize: 10, color: t.muted, marginTop: 4, lineHeight: 1.4 }}>
  {desc}
</p>

                      </motion.button>
                    ))}
                  </div>

                  <input id="yonetici-photo-input" type="file" accept="image/*" onChange={uploadPhoto} style={{ display: "none" }} />
                </section>
              </div>

              {detailsModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      background: "rgba(0,0,0,.72)",
      backdropFilter: "blur(14px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: 390,
        borderRadius: 24,
        padding: 24,
        background: isDark ? "rgba(9,9,11,.98)" : "#fff",
        border: `1px solid ${t.border}`,
        boxShadow: "0 20px 60px rgba(0,0,0,.5)",
      }}
    >
      <button
        onClick={() => setDetailsModal(null)}
        style={{
          float: "right",
          border: "none",
          background: "rgba(230,26,33,.1)",
          color: "#E61A21",
          width: 32,
          height: 32,
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        <X size={18} />
      </button>

      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 16,
          background: `${detailsModal.color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <detailsModal.icon size={24} color={detailsModal.color} />
      </div>

      <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 32, color: t.text }}>
        {detailsModal.label}
      </h3>

      <div
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 18,
          background: t.surface2,
          border: `1px solid ${t.border}`,
        }}
      >
        <p style={{ fontSize: 10, color: t.faint, fontWeight: 900, letterSpacing: ".2em", textTransform: "uppercase" }}>
          Güncel Değer
        </p>
        <p style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 44, color: detailsModal.color }}>
          {detailsModal.value}
        </p>
      </div>

      <div
  style={{
    marginTop: 18,
    display: "grid",
    gap: 10,
    maxHeight: 240,
    overflowY: "auto",
  }}
>
  {detailsData.map((item, index) => (
    <div
      key={index}
      style={{
        padding: 12,
        borderRadius: 14,
        background: t.surface2,
        border: `1px solid ${t.border}`,
      }}
    >
      {/* USERS */}
      {detailsModal.label.includes("Kullanıcı") && (
        <>
          <p style={{ fontSize: 13, fontWeight: 800, color: t.text }}>
            {(item.ad || "") + " " + (item.soyad || "")}
          </p>

          <p style={{ fontSize: 11, color: t.muted }}>
            {item.e_posta}
          </p>
        </>
      )}

      {/* TRAININGS */}
      {detailsModal.label.includes("Eğitim") && (
        <>
          <p style={{ fontSize: 13, fontWeight: 800, color: t.text }}>
            {item.title}
          </p>

          <p style={{ fontSize: 11, color: t.muted }}>
            Tür: {item.type || "Genel"}
          </p>
        </>
      )}

      {/* ANNOUNCEMENTS */}
      {detailsModal.label.includes("İşlem") && (
        <>
          <p style={{ fontSize: 13, fontWeight: 800, color: t.text }}>
            {item.title}
          </p>

          <p style={{ fontSize: 11, color: t.muted }}>
            {dateTR(item.created_at)}
          </p>
        </>
      )}
    </div>
  ))}
</div>

    </div>
  </div>
)}

              {activeModal && (
                <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,.72)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                  <div style={{ width: "100%", maxWidth: 420, borderRadius: 26, padding: 26, background: isDark ? "rgba(9,9,11,.98)" : "#fff", border: `1px solid ${t.border}`, boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
                    <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: t.text }}>
                      {activeModal === "profile" ? "Profil Düzenle" : "Şifre Güncelle"}
                    </h3>

                    <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                      {activeModal === "profile" ? (
                        <>
                          <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ad Soyad" style={{ padding: 13, borderRadius: 14, background: t.surface2, border: `1px solid ${t.border}`, color: t.text }} />
                          <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="E-posta" style={{ padding: 13, borderRadius: 14, background: t.surface2, border: `1px solid ${t.border}`, color: t.text }} />
                          <input value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} placeholder="Departman" style={{ padding: 13, borderRadius: 14, background: t.surface2, border: `1px solid ${t.border}`, color: t.text }} />
                        </>
                      ) : (
                        <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Yeni şifre" style={{ padding: 13, borderRadius: 14, background: t.surface2, border: `1px solid ${t.border}`, color: t.text }} />
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                      <button onClick={closeModal} style={{ flex: 1, padding: 13, borderRadius: 14, border: `1px solid ${t.border}`, background: "transparent", color: t.muted, fontWeight: 900 }}>İptal</button>
                      <button disabled={saving} onClick={activeModal === "profile" ? saveProfile : savePassword} style={{ flex: 1, padding: 13, borderRadius: 14, border: "none", background: "linear-gradient(135deg,#E61A21,#ff4d52)", color: "#fff", fontWeight: 900 }}>
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </YoneticiLayout>
    </>
  );
}