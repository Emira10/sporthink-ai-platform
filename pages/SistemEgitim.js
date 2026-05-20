import { useRef } from "react";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  BookOpen, CheckCircle2, Zap, BarChart3, Bell,
  Brain, FileText, Play, HelpCircle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SistemEgitim({ userName, activeTab, trainings = [], onCompleteTraining }) {
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [quizMap, setQuizMap] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showPdfList, setShowPdfList] = useState(false);
  const [savedCourses, setSavedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noteTextMap, setNoteTextMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [videoProgressMap, setVideoProgressMap] = useState({});
  const [videoDuration, setVideoDuration] = useState(0);
  const [canCompleteMap, setCanCompleteMap] = useState({});
  const [roadmaps, setRoadmaps] = useState([]);
  const [showRoadmapPanel, setShowRoadmapPanel] = useState(false);
  const [pdfTimer, setPdfTimer] = useState(0);
  const [pdfCanComplete, setPdfCanComplete] = useState(false);
  const videoSectionRef = useRef(null);
  const coursesSectionRef = useRef(null);
  const youtubePlayerRef = useRef(null);
const youtubeIntervalRef = useRef(null);

function openTrainingFilter(filter) {
  setStatusFilter(filter);
  setShowPdfList(true);

  setTimeout(() => {
    coursesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

  const mergedCourses = [
  ...(courses || []),

  ...(trainings || []).map((t) => ({
    ...t,

    id:
      t.course_id ||
      t.training_id ||
      t.id,

    title:
      t.training_title ||
      t.title,

    category: "Organizasyon",

    type:
      t.type || "Zorunlu",

    description:
      t.description || "Departman eğitimi",

    assigned_count:
      t.assigned_count,

    completed_count:
      t.completed_count,

    isOrg: true,

    content_type:
      t.content_type,

    icerik_turu:
      t.icerik_turu,

    file_url:
      t.file_url ||
      t.dosya_url ||
      t.video_url,

    dosya_url:
      t.dosya_url,

    video_url:
      t.video_url,
  })),
];

  useEffect(() => {
    if (activeTab === 'courses') fetchData();
  }, [activeTab]);

  useEffect(() => {
  if (!selectedPdf || pdfCanComplete) return;

  if (pdfTimer <= 0) {
    setPdfCanComplete(true);
    return;
  }

  const timer = setTimeout(() => {
    setPdfTimer((prev) => prev - 1);
  }, 1000);

  return () => clearTimeout(timer);
}, [selectedPdf, pdfTimer, pdfCanComplete]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function getUserId() {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('userId') ||
      localStorage.getItem('kullanici_id') ||
      localStorage.getItem('profileId') ||
      localStorage.getItem('user_id') ||
      null
    );
  }

  async function resolveUserId() {
    let userId = getUserId();
    if (userId) return userId;
    const email = localStorage.getItem('userEmail');
    if (!email) return null;
    const { data, error } = await supabase
      .from('kullanicilar')
      .select('kullanici_id')
      .eq('e_posta', email)
      .single();
    if (!error && data?.kullanici_id) {
      localStorage.setItem('userId', data.kullanici_id);
      return data.kullanici_id;
    }
    return null;
  }

  function getYoutubeId(url) {
    if (!url) return null;
    if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0];
    if (url.includes('/embed/')) return url.split('/embed/')[1]?.split('?')[0];
    return null;
  }

  function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/quiz/g, "")
    .replace(/temelleri/g, "")
    .replace(/programlamaya/g, "")
    .replace(/programlama/g, "")
    .replace(/giriş/g, "")
    .replace(/girisi/g, "")
    .trim();
}

  function updateVideoWatchState(course, current, duration) {
  if (!course?.id || !duration) return;

  const percent = Math.min(
    100,
    Math.max(0, Math.floor((current / duration) * 100))
  );

  setVideoProgressMap((prev) => ({
    ...prev,
    [course.id]: percent,
  }));

  if (percent >= 90) {
    setCanCompleteMap((prev) => ({
      ...prev,
      [course.id]: true,
    }));
  }
}

function startYoutubeTracking(course, videoId) {
  if (!course?.id || !videoId) return;

  if (youtubeIntervalRef.current) {
    clearInterval(youtubeIntervalRef.current);
    youtubeIntervalRef.current = null;
  }

  const createPlayer = () => {
    if (!window.YT?.Player) return;

    youtubePlayerRef.current = new window.YT.Player("youtube-player-box", {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          youtubeIntervalRef.current = setInterval(() => {
            const player = youtubePlayerRef.current;

            if (!player?.getCurrentTime || !player?.getDuration) return;

            const current = player.getCurrentTime();
            const duration = player.getDuration();

            if (!duration || duration <= 0) return;

            updateVideoWatchState(course, current, duration);

            const second = Math.floor(current);
            if (second > 0 && second % 10 === 0) {
              trackVideoProgress(course, current, duration);
            }
          }, 1000);
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            const player = youtubePlayerRef.current;
            const duration = player?.getDuration?.() || 0;

            updateVideoWatchState(course, duration, duration);
            trackVideoProgress(course, duration, duration);
          }
        },
      },
    });
  };

  if (!window.YT?.Player) {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    window.onYouTubeIframeAPIReady = createPlayer;

    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  } else {
    createPlayer();
  }
}

  function getCourseImage(course) {
    if (course.img) return course.img;
    if (course.image_url) return course.image_url;
    if (course.thumbnail_url) return course.thumbnail_url;
    const youtubeId = getYoutubeId(course.video_url);
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    return null;
  }

  function isPdf(course) {
  const type = String(
    course.content_type ||
    course.icerik_turu ||
    course.type ||
    ""
  ).toLowerCase();

  const url = String(
    course.file_url ||
    course.dosya_url ||
    course.video_url ||
    ""
  ).toLowerCase();

  return type.includes("pdf") || url.includes(".pdf");
}

  async function fetchData() {
    setLoading(true);
    const userId = getUserId();
    if (userId) {
  const roadmapRes = await fetch(`/api/kullanici/roadmaps?kullanici_id=${userId}`);
  const roadmapJson = await roadmapRes.json();

  if (roadmapJson.ok) {
    setRoadmaps(roadmapJson.roadmaps || []);
  }
}
    const { data: cData } = await supabase
      .from('courses_data').select('*').order('created_at', { ascending: false });
    setCourses(cData || []);

    const { data: aData } = await supabase
      .from('announcements').select('*').order('created_at', { ascending: false }).limit(1);
    setAnnouncements(aData || []);

    const { data: qData, error: qError } = await supabase
  .from("quizzes")
  .select("id,title,course_id");

if (!qError) {
  const map = {};

  (qData || []).forEach((quiz) => {
    map[String(quiz.course_id)] = quiz;

    const key = normalizeText(quiz.title);
    if (key) map[key] = quiz;
  });

  setQuizMap(map);
}

    if (userId) {
      const savedRes = await fetch(
  `/api/kullanici/saved-course?kullanici_id=${userId}&course_id=dummy`
);
const savedJson = await savedRes.json();

if (savedJson.ok) {
  setSavedCourses(savedJson.saved || []);
}
      const { data: pData, error: pError } = await supabase
        .from('user_progress').select('*').eq('kullanici_id', Number(userId));
        const { data: notesData, error: notesError } = await supabase
  .from("user_course_notes")
  .select("*")
  .eq("kullanici_id", Number(userId))
  .order("created_at", { ascending: false });

if (!notesError) {
  const nMap = {};
  (notesData || []).forEach((n) => {
    if (!nMap[n.course_id]) nMap[n.course_id] = [];
    nMap[n.course_id].push(n);
  });
  setNotesMap(nMap);
}
      if (!pError) {
        const map = {};
        (pData || []).forEach((p) => { map[p.course_id] = p; });
        setProgressMap(map);

        const analyticsRes = await fetch(
    `/api/analytics/student-overview?user_id=${userId}`
  );

  const analyticsJson = await analyticsRes.json();

  if (analyticsJson.ok) {
    setAnalytics(analyticsJson.analytics);
    const a = analyticsJson.analytics;

if (a.averageProgress < 30) {
  setAiSuggestion(
    "Öğrenme ilerlemen düşük görünüyor. Kısa video eğitimlerle başlaman önerilir."
  );
} else if (a.averageProgress < 70) {
  setAiSuggestion(
    "Harika ilerliyorsun. Quiz aşamasına geçerek bilgini pekiştirmen önerilir."
  );
} else {
  setAiSuggestion(
    "Mükemmel performans gösteriyorsun. Yeni ileri seviye eğitimlere başlayabilirsin."
  );
}

if (a.completedCourses >= 5) {
  setAiSuggestion(
    "Birden fazla eğitimi başarıyla tamamladın. Liderlik ve ileri seviye içerikler öneriliyor."
  );
}

if (a.totalLearningMinutes >= 120) {
  setAiSuggestion(
    "Öğrenme süren oldukça yüksek. Düzenli ilerleme gösteriyorsun."
  );
}
  }
      }
    }
    setLoading(false);
  }

  function getProgress(courseId) { return progressMap[courseId]; }

  async function addXp(amount) {
    const userId = await resolveUserId();
    if (!userId) return;
    const { data: profile } = await supabase
      .from('user_learning_profile').select('*').eq('kullanici_id', Number(userId)).single();
    const newXp = (profile?.xp || 0) + amount;
    await supabase.from('user_learning_profile').upsert({
      kullanici_id: Number(userId), xp: newXp,
      level: Math.floor(newXp / 500) + 1, updated_at: new Date().toISOString(),
    });
  }

  async function completeMissionByKey(key) {
    const userId = await resolveUserId();
    if (!userId) return;
    const { data: mission } = await supabase.from('daily_missions').select('*').eq('mission_key', key).single();
    if (!mission) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase.from('user_daily_missions').select('*')
      .eq('kullanici_id', Number(userId)).eq('mission_id', mission.id).eq('mission_date', today).single();
    if (existing?.is_completed) return;
    await supabase.from('user_daily_missions').upsert({
      kullanici_id: Number(userId), mission_id: mission.id,
      progress_count: mission.target_count, is_completed: true,
      completed_at: new Date().toISOString(), mission_date: today,
    });
    await addXp(mission.xp_reward || 50);
  }

  async function saveProgress(course, percent, status) {
    const userId = await resolveUserId();
    if (!userId) { alert('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yap.'); return false; }
    const existing = getProgress(course.id);
    if (existing) {
      const { error } = await supabase.from('user_progress').update({
        progress_percent: percent, status, updated_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : existing.completed_at,
      }).eq('id', existing.id);
      if (error) { alert('İlerleme kaydedilemedi: ' + error.message); return false; }
    } else {
      const { error } = await supabase.from('user_progress').insert({
        kullanici_id: Number(userId), course_id: course.id,
        progress_percent: percent, status, started_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      });
      if (error) { alert('İlerleme kaydedilemedi: ' + error.message); return false; }
    }
    await fetchData();
    return true;
  }

  async function fetchCourseLessons(courseId) {
  const res = await fetch(`/api/kullanici/course-lessons?course_id=${courseId}`);
  const json = await res.json();

  if (json.ok) {
    setCourseLessons(json.lessons || []);
    setActiveLesson(json.lessons?.[0] || null);
  }
}

  async function handleStartCourse(course) {
    const existing = getProgress(course.id);
    const nextPercent = existing?.progress_percent ? Math.max(existing.progress_percent, 25) : 25;
    const saved = await saveProgress(course, nextPercent, 'in_progress');
    if (!saved) return;
    if (course.video_url) {
  const existing = getProgress(course.id);
  const last = existing?.last_position_seconds || 0;

  if (last > 0) {
    showToast(`Kaldığın yer: ${Math.floor(last / 60)}. dakika`);
  }

  window.open(course.video_url, "_blank");
  return;
}
    alert('Bu eğitim için video veya içerik bağlantısı bulunamadı.');
  }

  async function handleCompleteCourse(course) {
  const userId = await resolveUserId();

  if (!userId) {
    alert("Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yap.");
    return false;
  }

  const res = await fetch("/api/kullanici/complete-learning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kullanici_id: userId,
      course_id: course.id,
    }),
  });

  const json = await res.json();

  if (!json.ok) {
    alert(json.message || "Eğitim henüz tamamlanamaz.");
    return false;
  }

  await fetchData();
  showToast("Eğitim tamamlandı ✓");

  await fetch("/api/notifications/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    user_id: userId,
    title: "Sertifika Hazır",
    message: `${course.title || course.training_title} eğitimi başarıyla tamamlandı.`,
    type: "certificate",
  }),
});
  return true;
}

  function handleStartQuiz(courseId) {
    const quiz = quizMap[String(courseId)];
    if (!quiz?.id) { alert('Bu eğitim için henüz quiz eklenmedi.'); return; }
    window.location.href = `/quiz/${quiz.id}`;
  }

  const completedCount = Object.values(progressMap).filter(
    (p) => p.status === 'completed' || p.progress_percent === 100
  ).length;
  const inProgressCount = Object.values(progressMap).filter(
    (p) => p.status === 'in_progress' && p.progress_percent < 100
  ).length;
  const totalProgress = mergedCourses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + (getProgress(c.id)?.progress_percent || 0), 0) / mergedCourses.length)
    : 0;

  if (activeTab !== 'courses') return null;

  const pdfCourses = mergedCourses.filter((course) => isPdf(course));
  const videoCourses = mergedCourses.filter((course) => !isPdf(course));
  const filteredVideoCourses = videoCourses.filter((course) => {
  const title = String(
    course.training_title || course.title || ""
  ).toLowerCase();

  const matchesSearch = title.includes(
    searchTerm.toLowerCase()
  );

  const prog = getProgress(course.id);
  const percent = prog?.progress_percent || 0;

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "completed" && percent === 100) ||
    (statusFilter === "in_progress" &&
      percent > 0 &&
      percent < 100) ||
    (statusFilter === "not_started" &&
      percent === 0);

  const type = String(
    course.content_type ||
    course.icerik_turu ||
    course.type ||
    ""
  ).toLowerCase();

  const matchesType =
    typeFilter === "all" ||
    type.includes(typeFilter.toLowerCase());

  return (
    matchesSearch &&
    matchesStatus &&
    matchesType
  );
});

  function isSaved(courseId) {
  return savedCourses.some((s) => s.course_id === courseId);
}

async function toggleSaveCourse(course) {
  const userId = await resolveUserId();

  if (!userId) {
    alert("Kullanıcı bilgisi bulunamadı.");
    return;
  }

  const res = await fetch("/api/kullanici/saved-course", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kullanici_id: userId,
      course_id: course.id,
    }),
  });

  const json = await res.json();

  if (json.ok) {
    await fetchData();
    showToast(json.saved ? "Eğitim kaydedildi ✓" : "Kayıt kaldırıldı");
  }
}

async function saveCourseNote(course, type = "note") {
  const userId = await resolveUserId();

  if (!userId) {
    alert("Kullanıcı bilgisi bulunamadı.");
    return;
  }


  const noteText = noteTextMap[course.id] || "";
    if (!noteText.trim()) {
    alert("Not boş olamaz.");
    return;
  }

  const { error } = await supabase.from("user_course_notes").insert({
    kullanici_id: Number(userId),
    course_id: course.id,
    note_text: noteText.trim(),
    note_type: type,
  });

  if (error) {
    alert("Not kaydedilemedi: " + error.message);
    return;
  }

  setNoteTextMap((prev) => ({
  ...prev,
  [course.id]: "",
}));
  showToast("Not kaydedildi ✓");
  await fetchData();
}

async function trackVideoProgress(course, currentTime, duration) {
  const userId = await resolveUserId();
  if (!userId || !course?.id || !duration) return;

  const res = await fetch("/api/kullanici/track-learning", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
  kullanici_id: userId,
  full_name: localStorage.getItem("userName") || "",
  email: localStorage.getItem("userEmail") || "",
  course_id: course.id,
    content_type: "video",
    watched_seconds: Math.floor(currentTime),
    total_seconds: Math.floor(duration),
    last_position_seconds: Math.floor(currentTime),
  }),
});

const json = await res.json();

if (json.canComplete) {
  setCanCompleteMap((prev) => ({
    ...prev,
    [course.id]: true,
  }));
}
}

async function openRoadmapTraining(step, roadmap) {
  if (step.step_type === "certificate") {
    const userId = await resolveUserId();

    const res = await fetch("/api/kullanici/roadmap-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kullanici_id: userId,
        roadmap_id: roadmap.roadmap_id,
        roadmap_title: roadmap.title,
      }),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Sertifika oluşturulamadı.");
      return;
    }

    showToast("Roadmap sertifikası oluşturuldu ✓");
    setShowRoadmapPanel(false);
    return;
  }
  const course = mergedCourses.find(
    (c) => String(c.id) === String(step.target_id)
  );

  if (!course) {
    alert("Bu aşamaya bağlı eğitim bulunamadı.");
    return;
  }

  setShowRoadmapPanel(false);

  setTimeout(() => {
    coursesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 150);

  if (isPdf(course)) {
  setSelectedPdf(course);
  setPdfCanComplete(false);
  setPdfTimer(120);
} else {
  await completeMissionByKey("start_course");
  await fetchCourseLessons(course.id);

  setVideoProgressMap((prev) => ({
    ...prev,
    [course.id]: 0,
  }));

  setCanCompleteMap((prev) => ({
    ...prev,
    [course.id]: false,
  }));

  setSelectedVideo(course);

  setTimeout(() => {
    const youtubeId = getYoutubeId(
      course.video_url ||
      course.file_url ||
      course.dosya_url
    );

    if (youtubeId) {
      startYoutubeTracking(course, youtubeId);
    }

    videoSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 150);
}
}

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="w-5 h-5" />{toast}
        </div>
      )}

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200/80 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-8 lg:p-10">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-blue-500/10 via-violet-500/5 to-transparent blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-2">SporthINK · Learning Center</p>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Eğitim Kataloğum</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Başarıya giden yol: öğrenmeye devam et</p>
          </div>
          <div className="flex items-center gap-3">
  <button
  onClick={() => setShowRoadmapPanel(true)}
  className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-[1.02] transition-all"
>
  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white">
    <Brain className="w-6 h-6" />
  </div>

  <div className="text-left">
    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
      AI Roadmap
    </p>
    <p className="text-sm font-black">
      Gelişim Yolculuğum
    </p>
    <p className="text-[10px] font-semibold opacity-60">
      {roadmaps.length} aktif yol haritası
    </p>
  </div>
</button>

  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shrink-0">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
      Öğrenci Profili
    </p>

    <p className="text-sm font-bold text-slate-900 dark:text-white">
      {userName}
    </p>
  </div>
</div>
        </div>
      </section>

      {/* Announcement */}
      {announcements.length > 0 && (
        <section className="rounded-2xl bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5 dark:from-rose-500/10 dark:via-orange-500/10 dark:to-amber-500/10 border border-rose-200/50 dark:border-rose-500/20 p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">Yeni Duyuru</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{announcements[0].content}</p>
            </div>
          </div>
        </section>
      )}

      {showRoadmapPanel && (
  <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex justify-end">
    <div className="relative w-full max-w-4xl h-full overflow-y-auto bg-white dark:bg-[#070707] p-6 shadow-2xl border-l border-slate-200 dark:border-white/10">

      <section className="relative overflow-hidden rounded-[2rem] shadow-2xl p-6 border bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-black border-slate-200 dark:border-white/10">
  <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/20 blur-3xl rounded-full" />

  <div className="relative z-10">

    <div className="sticky top-0 z-50 flex items-center justify-between mb-5 rounded-2xl bg-white/90 dark:bg-[#070707]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-3">
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">
      Learning Journey Center
    </p>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Kişisel gelişim yolları ve ilerleme merkezi
    </p>
  </div>

  <button
    onClick={() => setShowRoadmapPanel(false)}
    className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-black hover:bg-rose-500 hover:text-white transition"
  >
    ✕
  </button>
</div>

    <div className="flex items-center justify-between gap-4 mb-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500">
          AI Roadmap
        </p>

        <h2 className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
          Gelişim Yolculuğum
        </h2>

        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
          Sana atanan kariyer ve öğrenme yollarını adım adım takip et.
        </p>
      </div>

      <span className="px-4 py-2 rounded-full bg-rose-500/10 dark:bg-white/10 text-rose-500 dark:text-white text-xs font-black">
        {roadmaps.length} Aktif Yol
      </span>
    </div>

    <div className="space-y-5">
      {roadmaps.map((roadmap) => (
        <div
          key={roadmap.assignment_id}
          className="rounded-[1.5rem] border p-5 bg-white dark:bg-white/[0.06] border-slate-200 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {roadmap.title}
              </h3>

              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                {roadmap.department} · {roadmap.level} · {roadmap.status}
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black text-rose-500">
                %{roadmap.progress}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Tamamlandı
              </p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
              style={{ width: `${roadmap.progress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {roadmap.steps.map((step, index) => (
              <button
  type="button"
  key={index}
  disabled={!step.active}
  onClick={() => step.active && openRoadmapTraining(step, roadmap)}
                className={`rounded-2xl border p-4 ${
                  step.done
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : step.active
                    ? "bg-rose-500/10 border-rose-500/40 shadow-lg shadow-rose-500/10"
                    : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black mb-3 ${
                    step.done
                      ? "bg-emerald-500 text-white"
                      : step.active
                      ? "bg-rose-500 text-white"
                      : "bg-slate-200 dark:bg-white/10 text-slate-500"
                  }`}
                >
                  {index + 1}
                </div>

                <p className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {step.title}
                </p>

                <p
                  className={`text-[10px] mt-2 font-bold ${
                    step.done
                      ? "text-emerald-500"
                      : step.active
                      ? "text-rose-500"
                      : "text-slate-500"
                  }`}
                >
                  {step.done ? "Tamamlandı" : step.active ? "Eğitime Git" : "Kilitli"}
                </p>
              </button>
            ))}
          </div>

          {roadmap.ai_note && (
            <div className="mt-5 rounded-2xl border p-4 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-1">
                AI Önerisi
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {roadmap.ai_note}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</section>

    </div>
  </div>
)}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
  { label: 'Toplam Eğitim', val: mergedCourses.length, Icon: BookOpen, bg: 'bg-blue-500/10 dark:bg-blue-500/20', color: 'text-blue-500', filter: 'all' },
  { label: 'Tamamlanan', val: completedCount, Icon: CheckCircle2, bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', color: 'text-emerald-500', filter: 'completed' },
  { label: 'Devam Eden', val: inProgressCount, Icon: Zap, bg: 'bg-amber-500/10 dark:bg-amber-500/20', color: 'text-amber-500', filter: 'in_progress' },
  { label: 'Genel İlerleme', val: `%${totalProgress}`, Icon: BarChart3, bg: 'bg-rose-500/10 dark:bg-rose-500/20', color: 'text-rose-500', filter: 'all' },
].map((k, i) => (
          <button
  key={i}
  onClick={() => openTrainingFilter(k.filter)}
  className="group text-left p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
>
            <div className={`w-12 h-12 rounded-xl ${k.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <k.Icon className={`w-6 h-6 ${k.color}`} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{k.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{k.val}</p>
          </button>
        ))}
      </div>

      {/* PDF Learning Section */}
{pdfCourses.length > 0 && (
  <section ref={coursesSectionRef} className="rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 p-6">
    <button
      onClick={() => setShowPdfList(!showPdfList)}
      className="w-full flex items-center justify-between rounded-3xl border border-rose-200/60 dark:border-rose-500/20 bg-gradient-to-r from-white via-rose-50 to-orange-50 dark:from-slate-900 dark:via-rose-950/20 dark:to-orange-950/10 p-6 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
          <FileText className="w-7 h-7 text-rose-500" />
        </div>

        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
            PDF Öğrenme Merkezi
          </p>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            PDF Eğitimleri Aç
          </h2>
        </div>
      </div>

      <span className="text-sm font-black text-rose-500">
        {showPdfList ? "Kapat" : "Aç"}
      </span>
    </button>

    {showPdfList && (
  <div className="space-y-4 mt-5">
    {pdfCourses.map((course) => (
        <div
            key={course.id}
            className="group flex items-center gap-5 rounded-3xl border border-rose-200/60 dark:border-rose-500/20 bg-gradient-to-r from-white via-rose-50 to-orange-50 dark:from-slate-900 dark:via-rose-950/20 dark:to-orange-950/10 p-5 shadow-lg hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md">
              <div className="relative w-14 h-16 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                <div className="h-4 bg-rose-500 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">PDF</span>
                </div>

                <div className="p-2 space-y-1">
                  <div className="h-1 bg-slate-800 rounded w-full" />
                  <div className="h-1 bg-slate-300 rounded w-4/5" />
                  <div className="h-1 bg-slate-200 rounded w-full" />
                  <div className="h-1 bg-slate-200 rounded w-3/5" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-flex mb-2 px-2 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                PDF
              </span>

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 truncate">
                {course.training_title || course.title}
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                PDF eğitim içeriğini inceleyerek öğrenmeye devam et.
              </p>
            </div>

            <button
              onClick={async () => {
                await saveProgress(course, 50, "in_progress");
                setSelectedPdf(course);
                setPdfCanComplete(false);
                setPdfTimer(120);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex-shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-black shadow-lg shadow-rose-500/25 hover:scale-105 transition-all"
            >
              PDF Aç
            </button>
          </div>
        ))}
      </div>
    )}
  </section>
)}

      {/* AI Suggestion */}
      <section className="flex items-start gap-5 p-6 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border border-violet-200/80 dark:border-violet-700/50 shadow-xl shadow-violet-200/30 dark:shadow-black/20">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">AI Öğrenme Önerisi</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
            {aiSuggestion}
          </p>
        </div>
      </section>

      {selectedPdf && (
  <section className="rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden">
    <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-rose-500" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
            PDF Öğrenme Alanı
          </p>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {selectedPdf.training_title || selectedPdf.title}
          </h2>
        </div>
      </div>

      <button
        onClick={() => setSelectedPdf(null)}
        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-xs font-black"
      >
        Kapat
      </button>
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-4 gap-0">
      <div className="xl:col-span-3 h-[680px] bg-slate-100 dark:bg-slate-900">
        <iframe
  src={`https://docs.google.com/gview?url=${encodeURIComponent(
    selectedPdf.file_url ||
    selectedPdf.dosya_url ||
    selectedPdf.pdf_url ||
    selectedPdf.video_url
  )}&embedded=true`}
  className="w-full h-full bg-white"
  title={selectedPdf.training_title || selectedPdf.title}
/>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-700/50">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Doküman Bilgisi
        </p>

        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
          {selectedPdf.training_title || selectedPdf.title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Bu PDF eğitim içeriğini okuyabilir, inceleyebilir ve tamamladığında ilerlemeni kaydedebilirsin.
        </p>

        <button
          disabled={!pdfCanComplete}
          onClick={async () => {
  const completed = await handleCompleteCourse(selectedPdf);

  if (completed && onCompleteTraining) {
    await onCompleteTraining(selectedPdf);
    setSelectedPdf(null);
  }
}}
          className={`w-full py-4 rounded-2xl text-white text-sm font-black shadow-lg ${
  pdfCanComplete
    ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/25"
    : "bg-slate-400 cursor-not-allowed"
}`}
        >
          {pdfCanComplete
  ? "PDF Eğitimi Tamamla"
  : `Okuma süresi: ${Math.floor(pdfTimer / 60)}:${String(pdfTimer % 60).padStart(2, "0")}`}
        </button>

        <button
          onClick={() =>
  window.open(
    selectedPdf.file_url ||
      selectedPdf.dosya_url ||
      selectedPdf.pdf_url ||
      selectedPdf.video_url,
    "_blank"
  )
}
          className="w-full mt-3 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-black"
        >
          Yeni Sekmede Aç
        </button>
      </div>
    </div>
  </section>
)}

<section className="rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-5 shadow-lg">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Eğitim ara..."
      className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
    />

    <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
    >
      <option value="all">Tüm Türler</option>
      <option value="video">Video</option>
      <option value="pdf">PDF</option>
    </select>

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
    >
      <option value="all">Tüm Durumlar</option>
      <option value="completed">Tamamlanan</option>
      <option value="in_progress">Devam Eden</option>
      <option value="not_started">Başlanmadı</option>
    </select>
  </div>
</section>

{selectedVideo && (
    <section
  ref={videoSectionRef}
  className="rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-2xl overflow-hidden"
>
    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700/50">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
          Video Öğrenme Alanı
        </p>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {selectedVideo.training_title || selectedVideo.title}
        </h2>
      </div>

      <button
        onClick={() => setSelectedVideo(null)}
        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-black"
      >
        Kapat
      </button>
    </div>

    {courseLessons.length > 0 && (
  <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3">
      Ders İçeriği
    </p>

    <div className="flex gap-3 overflow-x-auto">
      {courseLessons.map((lesson, index) => (
        <button
          key={lesson.id}
          type="button"
          onClick={() => setActiveLesson(lesson)}
          className={`px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap border ${
            activeLesson?.id === lesson.id
              ? "bg-rose-500 text-white border-rose-500"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}
        >
          Ders {index + 1}: {lesson.title}
        </button>
      ))}
    </div>
  </div>
)}

    {getYoutubeId(activeLesson?.content_url || selectedVideo?.video_url) ? (
  <div id="youtube-player-box" className="w-full h-[650px] bg-black" />
) : (
  <video
    controls
    className="w-full max-h-[650px] bg-black"
    src={
      activeLesson?.content_url || selectedVideo?.video_url ||
      selectedVideo?.file_url ||
      selectedVideo?.dosya_url ||
      ""
    }
    onLoadedMetadata={(e) => {
      const last = getProgress(selectedVideo.id)?.last_position_seconds || 0;
      if (last > 0) e.currentTarget.currentTime = last;
    }}
    onTimeUpdate={(e) => {
      const video = e.currentTarget;
      const current = video.currentTime;
      const duration = video.duration || 1;
      const percent = Math.floor((current / duration) * 100);

      setVideoProgressMap((prev) => ({
  ...prev,
  [selectedVideo.id]: percent,
}));

if (percent >= 90) {
  setCanCompleteMap((prev) => ({
    ...prev,
    [selectedVideo.id]: true,
  }));
}

      const second = Math.floor(current);

      if (
        second > 0 &&
        second % 10 === 0 &&
        video.dataset.lastTrack !== String(second)
      ) {
        video.dataset.lastTrack = String(second);
        trackVideoProgress(selectedVideo, current, duration);
      }
    }}
    
    onEnded={(e) => {
  const video = e.currentTarget;
  const duration = video.duration || 0;

  updateVideoWatchState(selectedVideo, duration, duration);

  if (duration > 0) {
    trackVideoProgress(selectedVideo, duration, duration);
  }
}}

  />
)}
  </section>
)}

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-700" />
              <div className="p-6 space-y-3">
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 w-1/3" />
                <div className="h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-5 rounded-full bg-slate-200 dark:bg-slate-700 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : mergedCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Henüz eğitim yok</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Eğitmen yeni eğitim eklediğinde burada görünecek.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVideoCourses.map((course) => {
            const prog      = getProgress(course.id);
            const percent   = prog?.progress_percent || 0;
            const completed = prog?.status === 'completed' || percent === 100;
            const currentVideoProgress = videoProgressMap[course.id] || percent;

const canFinish =
  completed ||
  Boolean(prog?.can_complete) ||
  canCompleteMap[course.id] === true;

            const pdf       = isPdf(course);
            // Only get image if NOT a PDF — prevents video thumbnail showing on PDF cards
            const image     = pdf ? null : getCourseImage(course);

            const courseQuiz =
  quizMap[String(course.id)] ||
  quizMap[normalizeText(course.training_title || course.title)];

            return (
              <div key={course.id} className="group relative flex flex-col rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">

                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {pdf ? (
                    /* PDF — Coursera-style document */
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                      {/* Shadow page */}
                      <div className="absolute w-[56%] h-[74%] bg-white dark:bg-slate-600 rounded-lg shadow-md border border-slate-200 dark:border-slate-500"
                        style={{ transform: 'rotate(5deg) translate(16px, 10px)' }} />
                      {/* Main doc */}
                      <div className="relative w-[60%] h-[78%] rounded-lg shadow-2xl border border-slate-200 flex flex-col overflow-hidden" style={{ zIndex: 2, background: '#fff' }}>
                        <div className="h-7 bg-rose-500 flex items-center gap-2 px-3 shrink-0">
                          <FileText className="w-3 h-3 text-white" />
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">PDF</span>
                        </div>
                        <div className="flex-1 p-3 flex flex-col gap-1.5" style={{ background: '#fff' }}>
                          <div className="h-2 rounded" style={{ background: '#1e293b', width: '82%' }} />
                          <div className="h-2 rounded mb-1" style={{ background: '#1e293b', width: '60%' }} />
                          {[100, 82, 95, 68, 88, 74].map((w, i) => (
                            <div key={i} className="h-1.5 rounded"
                              style={{ width: `${w}%`, background: i % 3 === 0 ? '#cbd5e1' : '#e2e8f0' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : image ? (
                    <img src={image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-lg">
                        <Play className="w-7 h-7 text-slate-400" />
                      </div>
                    </div>
                  )}

                  {completed && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />Tamamlandı
                    </div>
                  )}

                  {!pdf && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
                        {course.isOrg ? 'Departman' : course.category || 'Genel'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-6 gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        pdf
                          ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {pdf ? 'PDF Döküman' : course.type || course.content_type || 'Video'}
                      </span>
                      {course.isOrg && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Zorunlu</span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors duration-300">
                      {course.training_title || course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{course.description}</p>
                    )}
                  </div>

                  {courseQuiz && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate">Quiz: {courseQuiz.title}</span>
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">İlerleme</span>
                      <span className={`text-[10px] font-black ${percent === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>%{percent}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${percent === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-orange-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 p-3">
  <textarea
    value={noteTextMap[course.id] || ""}
onChange={(e) =>
  setNoteTextMap((prev) => ({
    ...prev,
    [course.id]: e.target.value,
  }))
}
    placeholder="Bu eğitim için kısa not yaz..."
    className="w-full min-h-[70px] bg-transparent text-xs outline-none resize-none text-slate-700 dark:text-slate-200"
  />
  <div className="flex gap-2 mt-2">
    <button
      onClick={() => saveCourseNote(course, "note")}
      className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black"
    >
      Not Kaydet
    </button>

    <button
      onClick={() => saveCourseNote(course, "bookmark")}
      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-[10px] font-black"
    >
      Bookmark
    </button>
  </div>
</div>

{notesMap[course.id]?.length > 0 && (
  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3 space-y-2">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
      Notlarım
    </p>

    {notesMap[course.id].slice(0, 3).map((note) => (
      <div
        key={note.id}
        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300"
      >
        <span className="font-black text-rose-500 uppercase mr-2">
          {note.note_type}
        </span>
        {note.note_text}
      </div>
    ))}
  </div>
)}

                  <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <button
                      onClick={async () => {
                        if (pdf) {
  await saveProgress(course, 50, "in_progress");
  setSelectedPdf(course);
  setPdfCanComplete(false);
  setPdfTimer(120);
  return;
}
                        await completeMissionByKey('start_course');
await fetchCourseLessons(course.id);

setVideoProgressMap((prev) => ({
  ...prev,
  [course.id]: 0,
}));

setCanCompleteMap((prev) => ({
  ...prev,
  [course.id]: false,
}));

setSelectedVideo(course);

setTimeout(() => {
  const youtubeId = getYoutubeId(
    activeLesson?.content_url ||
    course.video_url ||
    course.file_url ||
    course.dosya_url
  );

  if (youtubeId) {
    startYoutubeTracking(course, youtubeId);
  }

  videoSectionRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "start",
});
}, 100);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {pdf ? <FileText className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {pdf ? 'PDF Aç' : percent > 0 ? 'Devam Et' : 'Başla'}
                    </button>

                    <button
  onClick={() => toggleSaveCourse(course)}
  className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
    isSaved(course.id)
      ? "bg-amber-500 text-white border-amber-500"
      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
  }`}
>
  {isSaved(course.id) ? "Kaydedildi" : "Kaydet"}
</button>

                    {!completed && !course.isOrg && (
                      <button
  disabled={!canFinish}
  onClick={async () => {
    const completed = await handleCompleteCourse(course);

    if (completed && onCompleteTraining) {
      await onCompleteTraining(course);
    }
  }}
  className={`px-6 py-3 rounded-2xl text-white font-black transition-all ${
    canFinish ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-400 cursor-not-allowed"
  }`}
>
  {canFinish
  ? "Eğitimi Tamamla"
  : `%90 izleme gerekli (${currentVideoProgress}%)`}

</button>
                    )}

                    {courseQuiz && (
                      <button
                        onClick={() => (window.location.href = `/quiz/${courseQuiz.id}`)}
                        className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-600/50 transition-all duration-300 flex items-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}