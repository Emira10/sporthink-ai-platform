import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import KullaniciLayout from "../components/KullaniciLayout";
import { supabase } from "../lib/supabaseClient";
import { 
  Brain, Zap, Trophy, Medal, Target, CheckCircle2, 
  Sparkles, TrendingUp, Clock, BookOpen, Award,
  ChevronRight, Flame, Star, Crown, Users,
  MessageSquare, Lightbulb, BarChart3, Calendar,
  Bell, Megaphone, ArrowRight, Play, Loader2
} from "lucide-react";

export default function Dashboard() {
  const [userName, setUserName] = useState("Kullanıcı");

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    if (savedName && savedName !== "undefined") setUserName(savedName);
  }, []);

  return (
    <KullaniciLayout pageTitle="Dashboard">
      <SystemControlCenter userName={userName} />
    </KullaniciLayout>
  );
}

function SystemControlCenter({ userName }) {
    const router = useRouter();
  const [scan, setScan] = useState(false);
  const [panel, setPanel] = useState("center");
  const [profile, setProfile] = useState(null);
  const [xp, setXp] = useState(0);
  const [mood, setMood] = useState("Fena Değil");
  const [coachMsg, setCoachMsg] = useState("Bugün küçük bir adım bile seni hedefine yaklaştırır.");
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [duyurular, setDuyurular] = useState([]);
  const [newUserNotifications, setNewUserNotifications] = useState([]);

  const levelTarget = 500;
  const currentLevel = profile?.level || 1;
  const xpInCurrentLevel = xp % 500;
  const levelPercent = Math.min(100, Math.round((xpInCurrentLevel / levelTarget) * 100));

  useEffect(() => {
    fetchSystemData();
  }, []);

  async function getUserId() {
    let userId = localStorage.getItem("userId");
    if (userId) return Number(userId);

    const email = localStorage.getItem("userEmail");
    if (!email) return null;

    const { data } = await supabase
      .from("kullanicilar")
      .select("kullanici_id")
      .eq("e_posta", email)
      .single();

    if (data?.kullanici_id) {
      localStorage.setItem("userId", data.kullanici_id);
      return Number(data.kullanici_id);
    }

    return null;
  }

  async function fetchSystemData() {
    const userId = await getUserId();
    if (!userId) return;

    const profileRes = await fetch(`/api/kullanici/dashboard?kullanici_id=${userId}`);
const profileJson = await profileRes.json();

let prof = profileJson.profile;

    if (!prof) {
  const createRes = await fetch("/api/kullanici/create-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullanici_id: userId }),
  });

  const createJson = await createRes.json();
  prof = createJson.profile;
}
    if (prof) {
      setProfile(prof);
      setXp(prof.xp || 0);
      setMood(prof.mood || "Fena Değil");
    }

    const missionRes = await fetch("/api/kullanici/missions");
const missionJson = await missionRes.json();

const missionRows = missionJson.data || [];

    const { data: userMissionRows } = await supabase
      .from("user_daily_missions")
      .select("*")
      .eq("kullanici_id", userId)
      .eq("mission_date", new Date().toISOString().slice(0, 10));

    const mergedMissions = (missionRows || []).map((m) => {
      const userMission = (userMissionRows || []).find((um) => um.mission_id === m.id);
      return {
        ...m,
        progress_count: userMission?.progress_count || 0,
        is_completed: userMission?.is_completed || false,
      };
    });

    setMissions(mergedMissions);

    const badgeRes = await fetch(`/api/kullanici/badges?kullanici_id=${userId}`);
const badgeJson = await badgeRes.json();

setBadges(badgeJson.badges || []);
setEarnedBadges(badgeJson.earned || []);

const rankingRes = await fetch("/api/kullanici/ranking");
const rankingJson = await rankingRes.json();

setRanking(rankingJson.data || []);

    const res = await fetch("/api/duyurular/role?role=kullanici&module=all");
    const json = await res.json();

    if (json.success) {
      setDuyurular(json.data || []);
    }

    const usersRes = await fetch("/api/yonetici/kullanicilar");
const usersJson = await usersRes.json();

if (usersJson.ok) {
  const newUsers = (usersJson.users || [])
    .filter((u) => Number(u.tur_id) === 1)
    .sort(
      (a, b) =>
        new Date(b.kayit_tarihi || b.created_at || 0) -
        new Date(a.kayit_tarihi || a.created_at || 0)
    )
    .slice(0, 5);

  setNewUserNotifications(newUsers);
}

  }

  async function saveMood(newMood, msg) {
    const userId = await getUserId();
    setMood(newMood);
    setCoachMsg(msg);

    if (!userId) return;

    await fetch("/api/kullanici/mood", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    kullanici_id: userId,
    mood: newMood,
    message: msg,
  }),
});
  }

  async function addXp(amount) {
    const userId = await getUserId();
    if (!userId) return;

    const newXp = xp + amount;
    const newLevel = Math.floor(newXp / 500) + 1;

    setXp(newXp);

    await supabase
      .from("user_learning_profile")
      .update({ xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
      .eq("kullanici_id", userId);

    await checkBadges(userId, newXp);
    await fetchSystemData();
  }

  async function completeMission(mission) {
    const userId = await getUserId();
    if (!userId || mission.is_completed) return;

    await fetch("/api/kullanici/complete-mission", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    kullanici_id: userId,
    mission_id: mission.id,
    xp_reward: mission.xp_reward || 50,
  }),
});

await fetchSystemData();

    await fetch("/api/certificates/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, template_key: "success_level" }),
    });

    setCoachMsg(`Harika! "${mission.title}" görevi tamamlandı. +${mission.xp_reward || 50} XP kazandın.`);
  }

  async function checkBadges(userId, currentXp) {
    const firstBadge = badges.find((b) => b.badge_key === "first_step");
    const halfBadge = badges.find((b) => b.badge_key === "half_way");

    if (firstBadge && currentXp >= 50) {
      await supabase.from("user_badges").upsert({ kullanici_id: userId, badge_id: firstBadge.id });
    }

    if (halfBadge && currentXp >= 250) {
      await supabase.from("user_badges").upsert({ kullanici_id: userId, badge_id: halfBadge.id });
    }
  }

  async function runScan() {
    const userId = await getUserId();
    setScan(true);
    const msg = "Sistem analiz edildi: Bugün bir görev tamamlamak XP kazanımı için en iyi adım.";

    setTimeout(() => {
      setScan(false);
      setCoachMsg(msg);
    }, 1500);

    if (userId) {
  await fetch("/api/kullanici/mood", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kullanici_id: userId,
      mood,
      message: msg,
    }),
  });
}
  }
function runAIAnaliz() {
  const analizler = [
  "Bugün görev tamamlama performansın oldukça yüksek görünüyor.",
  "Öğrenme hızın son 24 saatte arttı.",
  "XP kazanımına göre aktif kullanıcı seviyesindesin.",
  "Bugün quiz çözmek sana ekstra başarı puanı kazandırabilir.",
  "Son aktivitelerine göre istikrarlı ilerliyorsun.",
  "Son girişlerine göre sistem kullanım süren yükselmiş durumda.",
  "Bugün eğitim tamamlama ihtimalin oldukça yüksek görünüyor.",
  "Aktif öğrenme performansın sistem ortalamasının üstünde.",
  "Rozet kazanımına çok yakın görünüyorsun.",
  "Görev tamamlama istatistiklerin gelişiyor.",
  "Ders etkileşimlerin pozitif yönde ilerliyor.",
  "Bugün kısa bir eğitim bile seviyeni yükseltebilir.",
  "Son analizlere göre motivasyon seviyen stabil.",
  "Platform üzerindeki ilerlemen düzenli şekilde artıyor.",
];

  const random = analizler[Math.floor(Math.random() * analizler.length)];
  setCoachMsg(random);
}

function suggestLesson() {
  const dersler = [
  "Bugün SQL eğitimi incelemen önerilir.",
  "Python eğitimine devam etmen başarı oranını artırabilir.",
  "İnsan Kaynakları modülünde yeni içerikler mevcut.",
  "Veri analizi eğitimleri seviyene uygun görünüyor.",
  "Bugün kısa bir Excel eğitimi tamamlayabilirsin.",
  "Takım yönetimi eğitimleri sana uygun olabilir.",
  "AI destekli eğitim modülünü incelemen öneriliyor.",
  "Bugün iletişim becerileri eğitimine göz atabilirsin.",
  "Yeni eklenen liderlik eğitimleri ilgini çekebilir.",
  "Sunum teknikleri modülü gelişimine katkı sağlayabilir.",
  "Zaman yönetimi eğitimleri bugün için ideal görünüyor.",
  "Problem çözme eğitimleri performansını artırabilir.",
  "Yazılım geliştirme içerikleri seviyene uygun.",
  "Sistem bugün teknik eğitimleri öncelikli öneriyor.",
];

  const random = dersler[Math.floor(Math.random() * dersler.length)];
  setCoachMsg(random);
}

function motivationMessage() {
  const motivasyonlar = [
  "Harika gidiyorsun, devam et!",
  "Bugünkü ilerlemen gerçekten etkileyici.",
  "Başarı istikrarlı çalışmanın sonucudur.",
  "Her tamamlanan görev seni hedefe yaklaştırır.",
  "Küçük adımlar büyük başarılar oluşturur.",
  "Bugün gösterdiğin çaba geleceğini şekillendiriyor.",
  "Sistem seni aktif kullanıcı olarak görüyor.",
  "Her XP seni yeni bir seviyeye yaklaştırıyor.",
  "Disiplinli ilerleyişin dikkat çekiyor.",
  "Bugünkü performansın oldukça başarılı.",
  "Hedeflerine düşündüğünden daha yakınsın.",
  "Öğrenmeye devam ettikçe güçleniyorsun.",
  "Sürekli gelişim en büyük avantajındır.",
  "Başarı küçük ama sürekli adımlarla gelir.",
  "Bugün kendin için güzel bir yatırım yapıyorsun.",
];

  const random = motivasyonlar[Math.floor(Math.random() * motivasyonlar.length)];
  setCoachMsg(random);
}

  const moods = [
    { icon: Sparkles, label: "Harika", msg: "Enerjin yüksek! Bugün zorlayıcı bir eğitim önerilir.", color: "text-emerald-500" },
    { icon: Zap, label: "İyi", msg: "Bugün bir eğitim tamamlamak için ideal görünüyorsun.", color: "text-blue-500" },
    { icon: TrendingUp, label: "Fena Değil", msg: "Kısa ve odaklı bir dersle başlamak iyi olur.", color: "text-amber-500" },
    { icon: Clock, label: "Yorgun", msg: "Yorgunsan kısa bir video ile hafif ilerleyelim.", color: "text-orange-500" },
    { icon: MessageSquare, label: "Zor Gün", msg: "Bugün küçük bir hedef yeterli. 5 dakika bile başarıdır.", color: "text-rose-500" },
  ];

  const completedMissions = missions.filter((m) => m.is_completed).length;
  const userRank = ranking.findIndex((r) => r.kullanici_id === profile?.kullanici_id) + 1 || 0;

  const missionIcons = [Target, BookOpen, Play, CheckCircle2, Flame, Star];
  const badgeIcons = [Award, Medal, Trophy, Crown, Sparkles, Star];

    async function handleDuyuruClick(d) {
  if (d.action_type === "route" && d.action_url) {
    const userId = await getUserId();

    if (userId) {
      const completeRes = await fetch("/api/kullanici/complete-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kullanici_id: userId,
          mission_key: "read_announcement",
        }),
      });

      const completeJson = await completeRes.json();

      if (completeJson.success) {
        await fetchSystemData();
      }
    }

    router.push(d.action_url);
    return;
  }

  alert(`${d.title}\n\n${d.content}`);
}

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/80 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-black/25">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-rose-500/15 via-orange-500/8 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-500/10 via-violet-500/8 to-transparent blur-3xl rounded-full" />
        
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col xl:flex-row xl:items-center gap-7">
            {/* Left Content */}
            <div className="flex-1 flex items-start gap-5">
              {/* Avatar/Icon */}
              <div className="shrink-0 relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 mb-3">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Kisisel Komuta Merkezi</span>
                </div>
                
                {/* Welcome Title */}
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Hos Geldin,{" "}
                  <span className="relative inline-block">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">{userName}</span>
                    <Sparkles className="absolute -top-1 -right-5 w-4 h-4 text-amber-400 animate-pulse" />
                  </span>
                </h1>
                
                {/* Level & XP Info */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 border border-emerald-500/20">
                    <Star className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Level {currentLevel}</span>
                  </span>
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{xp} XP</span>
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Sonraki hedef {(currentLevel) * 500} XP</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-5 max-w-md">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Seviye Ilerlemesi</span>
                    <span className="text-rose-500">{levelPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ width: `${levelPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, value: completedMissions, label: "Gorev", gradient: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", iconColor: "#10b981" },
                { icon: Award, value: earnedBadges.length, label: "Rozet", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10 dark:bg-amber-500/20", iconColor: "#f59e0b" },
                { icon: Trophy, value: userRank > 0 ? `#${userRank}` : "—", label: "Siralama", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10 dark:bg-blue-500/20", iconColor: "#3b82f6" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="group relative p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-md shadow-slate-200/40 dark:shadow-black/15 hover:shadow-lg transition-all duration-400 hover:-translate-y-0.5"
                >
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-300`}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.iconColor }} />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mood Selector */}
          <div className="mt-7 pt-6 border-t border-slate-200/80 dark:border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Bugun nasil hissediyorsun?
            </p>
            <div className="flex flex-wrap gap-2.5">
              {moods.map((m) => {
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.label}
                    onClick={() => saveMood(m.label, m.msg)}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      mood === m.label
                        ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20 scale-[1.03]"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-300 dark:hover:border-rose-500/50 hover:shadow-sm"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${mood === m.label ? "text-white" : m.color}`} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {duyurular.length > 0 && (
        <section className="rounded-xl bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5 dark:from-rose-500/10 dark:via-orange-500/10 dark:to-amber-500/10 border border-rose-200/50 dark:border-rose-500/20 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Bildirim & Duyuru Merkezi</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {duyurular.slice(0, 3).map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => handleDuyuruClick(d)}
                className="group text-left p-4 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 hover:border-rose-300 dark:hover:border-rose-500/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{d.title}</h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{d.content}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {newUserNotifications.length > 0 && (
        <section className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Yeni Kullanıcı Bildirimleri
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {newUserNotifications.map((u) => (
              <div
                key={u.kullanici_id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50"
              >
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {u.ad} {u.soyad}
                </h4>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Yeni kullanıcı sisteme eklendi.
                </p>

                <button
                  onClick={() =>
                    setNewUserNotifications((prev) =>
                      prev.filter((x) => x.kullanici_id !== u.kullanici_id)
                    )
                  }
                  className="mt-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-all"
                >
                  Bildirimi Sil
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Panel Navigation */}
      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-inner">
        {[
          { id: "center", icon: BarChart3, label: "Ana Merkez" },
          { id: "missions", icon: Target, label: "Gorevler" },
          { id: "badges", icon: Medal, label: "Rozetler" },
          { id: "rank", icon: Trophy, label: "Siralama" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setPanel(t.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
              panel === t.id
                ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Center Panel */}
      {panel === "center" && (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Progress Card */}
          <div className="xl:col-span-2 p-7 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/15">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Egitim Ilerlemen</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Canli XP takibi</p>
              </div>
            </div>
            
            <div className="flex items-end gap-3 mb-7">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 leading-none">{levelPercent}%</span>
              <span className="text-lg text-slate-400 dark:text-slate-500 font-medium mb-1">tamamlandi</span>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Seviye ilerlemen canli olarak XP verisinden hesaplaniyor. Gorevleri tamamlayarak ve egitim izleyerek XP kazan!
              </p>
            </div>
            
            {/* Mini Stats */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { label: "Toplam XP", value: xp, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Seviye", value: currentLevel, icon: Star, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Hedef XP", value: currentLevel * 500, icon: Target, color: "text-rose-500", bg: "bg-rose-500/10" },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 text-center">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2.5`}>
                    <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Coach Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border border-violet-200/80 dark:border-violet-700/50 shadow-lg shadow-violet-200/25 dark:shadow-black/15">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">AI Kocun</h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Cevrimici
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-violet-200 dark:border-violet-700/50 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
                <MessageSquare className="w-3 h-3" />
                Ruh halin: <span className="text-violet-600 dark:text-violet-400 font-bold">{mood}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{coachMsg}</p>
            </div>
            
            <button 
              onClick={runAIAnaliz}
              disabled={scan}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {scan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analiz ediliyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Analiz Yap
                </>
              )}
            </button>
            
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {[
                { icon: Lightbulb, label: "Ders Oner", action: suggestLesson },
                { icon: Flame, label: "Motivasyon", action: motivationMessage },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={action.action}
                  className="flex items-center justify-center gap-1.5 p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-violet-200 dark:border-violet-700/50 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all duration-300"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Missions Panel */}
      {panel === "missions" && (
        <section className="p-7 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/15">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md shadow-rose-500/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Gunluk Gorevler</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{completedMissions}/{missions.length} gorev tamamlandi</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {missions.map((m, index) => {
              const IconComponent = missionIcons[index % missionIcons.length];
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    if (m.mission_key === "open_trainings") {
                      router.push("/kullanici/egitimler");
                    }
                    if (m.mission_key === "check_quiz") {
                      router.push("/kullanici/olcme-degerlendirme");
                    }
                    if (m.mission_key === "read_announcement") {
                      setActiveTab("ana-merkez");
                    }
                    if (m.mission_key === "check_dashboard") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={`group relative p-5 rounded-xl text-left transition-all duration-400 hover:-translate-y-0.5 ${
                    m.is_completed
                      ? "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 border-2 border-emerald-300 dark:border-emerald-600/50 shadow-md shadow-emerald-200/40 dark:shadow-emerald-900/25"
                      : "bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 hover:border-rose-300 dark:hover:border-rose-500/50 hover:shadow-lg"
                  }`}
                >
                  {m.is_completed && (
                    <span className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${
                    m.is_completed 
                      ? "bg-emerald-500/20" 
                      : "bg-gradient-to-br from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20"
                  }`}>
                    <IconComponent className={`w-6 h-6 ${m.is_completed ? "text-emerald-500" : "text-rose-500"}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{m.title}</h3>
                  <p className={`mt-2.5 text-xs font-bold flex items-center gap-1.5 ${m.is_completed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                    {m.is_completed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tamamlandi
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        +{m.xp_reward} XP
                      </>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Badges Panel */}
      {panel === "badges" && (
        <section className="p-7 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/15">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-500/20">
              <Medal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Rozet Koleksiyonum</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{earnedBadges.length}/{badges.length} rozet kazanildi</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((b, index) => {
              const earned = earnedBadges.some((eb) => eb.badge_id === b.id);
              const IconComponent = badgeIcons[index % badgeIcons.length];
              return (
                <div 
                  key={b.id} 
                  className={`relative p-5 rounded-xl text-center transition-all duration-400 ${
                    earned 
                      ? "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 border-2 border-amber-300 dark:border-amber-600/50 shadow-lg shadow-amber-200/40 dark:shadow-amber-900/25" 
                      : "bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 opacity-60 grayscale"
                  }`}
                >
                  {earned && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-md">
                      Kazanildi
                    </span>
                  )}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3.5 ${
                    earned 
                      ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md shadow-amber-500/20" 
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}>
                    <IconComponent className={`w-7 h-7 ${earned ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{b.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{b.description}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-3.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    earned 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    {earned ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Kazanildi
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3" />
                        +{b.xp_reward} XP
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Ranking Panel */}
      {panel === "rank" && (
        <section className="p-7 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/40 dark:shadow-black/15">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Gercek XP Siralamasi</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">En iyi 10 kullanici</p>
            </div>
          </div>
          
          <div className="space-y-2.5">
            {ranking.map((r, i) => {
              const isCurrentUser = r.kullanici_id === profile?.kullanici_id;
              const medalIcons = [Crown, Medal, Award];
              const MedalIcon = i < 3 ? medalIcons[i] : Users;
              
              return (
                <div 
                  key={r.kullanici_id} 
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isCurrentUser 
                      ? "bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 dark:from-rose-500/20 dark:via-orange-500/20 dark:to-amber-500/20 border-2 border-rose-300 dark:border-rose-500/50 shadow-md" 
                      : "bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base ${
                    i === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md shadow-amber-500/20" :
                    i === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md" :
                    i === 2 ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20" :
                    "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}>
                    {i < 3 ? <MedalIcon className="w-5 h-5" /> : `#${i + 1}`}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      {isCurrentUser ? "Sen" : `Kullanici ${r.kullanici_id}`}
                      {isCurrentUser && <Sparkles className="w-3.5 h-3.5 text-rose-500" />}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-emerald-500" />
                      Level {r.level}
                    </p>
                  </div>
                  
                  <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500/10 to-orange-500/10 dark:from-rose-500/20 dark:to-orange-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    {r.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}