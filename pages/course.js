import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userPoints, setUserPoints] = useState(1250);
  const [activeView, setActiveView] = useState('courses');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [progress, setProgress] = useState(65);

  const [currentProfileId, setCurrentProfileId] = useState(null);
  const [courseProgressMap, setCourseProgressMap] = useState({});
  const [savingProgress, setSavingProgress] = useState(false);
  const [quizMap, setQuizMap] = useState({});
  const [courseLessons, setCourseLessons] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    await resolveCurrentProfile();
    await fetchCourses();
    await fetchQuizzes();
    setLoading(false);
  }

  async function resolveCurrentProfile() {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');

      let query = supabase.from('profiles').select('id, full_name, email');

      if (userEmail) {
        query = query.eq('email', userEmail).maybeSingle();
      } else if (userName) {
        query = query.eq('full_name', userName).maybeSingle();
      } else {
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Profil alınamadı:', error.message);
        return;
      }

      if (data?.id) {
        setCurrentProfileId(data.id);
        await fetchUserProgress(data.id);
      }
    } catch (err) {
      console.error('Profil çözümleme hatası:', err);
    }
  }

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setAllCourses(data || []);
    } else {
      console.error('Kurslar alınamadı:', error.message);
    }
  }

  async function fetchQuizzes() {
    const { data, error } = await supabase
      .from('quizzes')
      .select('id, title, course_id');

    if (error) {
      console.error('Quizler alınamadı:', error.message);
      return;
    }

    const map = {};
    (data || []).forEach((quiz) => {
      map[quiz.course_id] = quiz;
    });

    setQuizMap(map);
  }

  async function fetchCourseLessons(courseId) {
  try {
    const res = await fetch(
      `/api/kullanici/course-lessons?course_id=${courseId}`
    );

    const json = await res.json();

    if (!json.ok) {
      console.error(json.message);
      return;
    }

    setCourseLessons(json.lessons || []);
  } catch (err) {
    console.error(err);
  }
}

  async function fetchUserProgress(profileId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('course_id, progress_percent, is_completed')
      .eq('user_id', profileId);

    if (error) {
      console.error('İlerleme verisi alınamadı:', error.message);
      return;
    }

    const progressMap = {};
    (data || []).forEach((row) => {
      progressMap[row.course_id] = {
        progress_percent: row.progress_percent || 0,
        is_completed: !!row.is_completed,
      };
    });

    setCourseProgressMap(progressMap);
  }

  const handleAI = () => {
    setAiAnalysis(
      'AI: Veri Analizi modülünde %85 başarı oranına ulaştınız. Bir sonraki adım Python!'
    );
  };

  const filteredCourses = allCourses.filter((course) => {
    const matchesFilter = filter === 'All' || course.category === filter;
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function getCourseProgress(courseId) {
    return courseProgressMap[courseId]?.progress_percent || 0;
  }

  function isCourseCompleted(courseId) {
    return courseProgressMap[courseId]?.is_completed || false;
  }

  async function saveOrUpdateProgress(course, progressValue, completedValue = false) {
    if (!currentProfileId) {
      alert('İlerleme kaydı için önce profiles tablosunda kullanıcı kaydı gerekli.');
      return false;
    }

    setSavingProgress(true);

    try {
      const existing = courseProgressMap[course.id];

      if (existing) {
        const nextProgress = Math.max(existing.progress_percent || 0, progressValue);
        const nextCompleted = completedValue || existing.is_completed || nextProgress >= 100;

        const { error } = await supabase
          .from('user_progress')
          .update({
            progress_percent: nextProgress,
            is_completed: nextCompleted,
            last_watched: new Date().toISOString(),
          })
          .eq('user_id', currentProfileId)
          .eq('course_id', course.id);

        if (error) throw error;

        setCourseProgressMap((prev) => ({
          ...prev,
          [course.id]: {
            progress_percent: nextProgress,
            is_completed: nextCompleted,
          },
        }));
      } else {
        const { error } = await supabase.from('user_progress').insert([
          {
            user_id: currentProfileId,
            course_id: course.id,
            progress_percent: progressValue,
            is_completed: completedValue || progressValue >= 100,
            last_watched: new Date().toISOString(),
          },
        ]);

        if (error) throw error;

        setCourseProgressMap((prev) => ({
          ...prev,
          [course.id]: {
            progress_percent: progressValue,
            is_completed: completedValue || progressValue >= 100,
          },
        }));
      }

      return true;
    } catch (error) {
      console.error('İlerleme kaydedilemedi:', error.message);
      alert('İlerleme kaydedilirken bir hata oluştu.');
      return false;
    } finally {
      setSavingProgress(false);
    }
  }

  async function openCourse(course) {
  setSelectedCourse(course);

  await fetchCourseLessons(course.id);

  await saveOrUpdateProgress(course, 15, false);
}

  async function markAsCompleted() {
    if (!selectedCourse) return;
    const ok = await saveOrUpdateProgress(selectedCourse, 100, true);
    if (ok) {
      alert('Eğitim tamamlandı olarak işaretlendi!');
    }
  }

  async function handleStartQuiz(course) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('id')
        .eq('course_id', course.id)
        .maybeSingle();

      if (error) {
        console.error('Quiz alınamadı:', error.message);
        alert('Quiz yüklenirken bir hata oluştu.');
        return;
      }

      if (!data?.id) {
        alert('Bu eğitim için henüz quiz eklenmedi.');
        return;
      }

      window.location.href = `/quiz/${data.id}`;
    } catch (err) {
      console.error('Quiz açma hatası:', err);
      alert('Quiz açılırken bir hata oluştu.');
    }
  }

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-[#E61A21] font-bold animate-pulse tracking-widest uppercase text-xs">
          Sistem Hazırlanıyor...
        </div>
      </div>
    );

  return (
    <div className="animate-fadeIn w-full transition-all duration-500 p-6">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6 border-b border-white/5 pb-8">
        <div className="text-left">
          <h2 className="text-sm font-black tracking-[0.3em] uppercase italic text-white/40">
            SporThink <span className="text-[#E61A21]/60">Academy</span>
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="bg-[#E61A21]/10 px-3 py-1 rounded-full border border-[#E61A21]/20">
              <span className="text-[9px] font-black text-[#E61A21]">🏆 {userPoints} XP</span>
            </div>
            <div className="h-[1px] w-8 bg-white/10"></div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              Level 12: Expert
            </span>
          </div>
        </div>

        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveView('courses')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
              activeView === 'courses' ? 'bg-[#E61A21] text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            📚 Katalog
          </button>
          <button
            onClick={() => setActiveView('social')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
              activeView === 'social' ? 'bg-[#E61A21] text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            👥 Gruplar
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
              activeView === 'analytics' ? 'bg-[#E61A21] text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            📊 Rapor
          </button>
        </div>
      </div>

      {activeView === 'courses' ? (
        <div className="animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-end mb-10">
            <input
              type="text"
              placeholder="Eğitim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-[11px] font-bold focus:border-[#E61A21]/50 outline-none transition-all w-64 text-white"
            />
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['All', 'Data Analysis', 'Database', 'Programming', 'Human Resources'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    filter === cat
                      ? 'bg-white/10 text-white border border-[#E61A21]'
                      : 'text-zinc-500 hover:text-white border border-transparent'
                  }`}
                >
                  {cat === 'All' ? 'Hepsi' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => {
              const currentProgress = getCourseProgress(course.id);
              const completed = isCourseCompleted(course.id);

              return (
                <div
                  key={course.id}
                  className="group bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-[#E61A21]/30 transition-all duration-500 cursor-pointer flex flex-col"
                  onClick={() => openCourse(course)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500 text-sm font-bold">
                      {course.type || 'Video'}
                    </div>

                    <div className="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded text-[8px] font-bold text-white backdrop-blur-md">
                      Ölçme: %{currentProgress}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[#E61A21] text-[8px] font-black uppercase tracking-widest mb-2">
                      {course.category}
                    </span>

                    <h3 className="text-sm font-bold text-white/90 leading-snug line-clamp-2">
                      {course.title}
                    </h3>

                    {quizMap[course.id] && (
                      <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-blue-400">
                        Quiz: {quizMap[course.id].title}
                      </p>
                    )}

                    <div className="mt-4 w-full bg-white/5 h-[4px] rounded-full overflow-hidden">
                      <div
                        className="bg-[#E61A21] h-full transition-all duration-500"
                        style={{ width: `${currentProgress}%` }}
                      ></div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        %{currentProgress}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${
                          completed ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {completed ? 'Tamamlandı' : 'Devam Ediyor'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeView === 'social' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {['AI Engineers', 'Data Masters', 'SQL Squad'].map((group) => (
            <div
              key={group}
              className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all"
            >
              <h3 className="text-xl font-black uppercase italic mb-2">{group}</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-6">24 Active Members</p>
              <button className="w-full py-3 bg-[#E61A21]/10 text-[#E61A21] rounded-xl text-[9px] font-black uppercase tracking-widest border border-[#E61A21]/20">
                Gruba Katıl
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
            <h3 className="text-2xl font-black uppercase italic mb-8">AI Analytics & Progress</h3>
            <div className="grid grid-cols-2 gap-10 mb-10">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-4 tracking-widest">
                  Tamamlama Oranı
                </p>
                <div className="text-5xl font-black italic text-[#E61A21] tracking-tighter">
                  %{progress}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-4 tracking-widest">
                  Gelecek Hedef
                </p>
                <div className="text-xl font-black uppercase italic text-white">
                  Advanced SQL
                </div>
              </div>
            </div>
            <button
              onClick={handleAI}
              className="w-full py-5 bg-[#E61A21] rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-red-600/20"
            >
              AI Profil Analizi Yap
            </button>
            {aiAnalysis && (
              <div className="mt-6 p-6 bg-black/40 border border-white/10 rounded-2xl text-[11px] text-zinc-300 italic animate-fadeIn">
                ✨ {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCourse && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/90 backdrop-blur-md"
      onClick={() => setSelectedCourse(null)}
    />

    <div className="relative w-full max-w-5xl bg-[#0d0d0d] rounded-[3rem] overflow-hidden shadow-2xl animate-fadeIn border border-white/10">
      <div className="grid md:grid-cols-[320px_1fr] min-h-[600px]">
        <div className="border-r border-white/10 bg-black/30 p-5 overflow-y-auto">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-5">
            Ders İçeriği
          </h3>

          <div className="space-y-3">
            {courseLessons.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs font-bold text-zinc-500">
                Bu kurs için henüz ders eklenmedi.
              </div>
            ) : (
              courseLessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() =>
                    setSelectedCourse((prev) => ({
                      ...prev,
                      activeLesson: lesson,
                    }))
                  }
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition-all"
                >
                  <p className="text-[10px] text-[#E61A21] font-black uppercase tracking-widest mb-2">
                    Ders {index + 1}
                  </p>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {lesson.title}
                  </h4>

                  <div className="mt-3 flex items-center justify-between text-[9px] uppercase font-black tracking-widest text-zinc-500">
                    <span>{lesson.content_type}</span>
                    <span>{lesson.duration || 0} dk</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {selectedCourse.activeLesson?.content_url ? (
            selectedCourse.activeLesson.content_type === "pdf" ? (
              <iframe
                src={selectedCourse.activeLesson.content_url}
                className="w-full h-[500px]"
              />
            ) : (
              <iframe
                className="w-full aspect-video"
                src={selectedCourse.activeLesson.content_url}
                frameBorder="0"
                allowFullScreen
                title={selectedCourse.activeLesson.title}
              />
            )
          ) : selectedCourse.video_url ? (
            <iframe
              className="w-full aspect-video"
              src={selectedCourse.video_url}
              frameBorder="0"
              allowFullScreen
              title={selectedCourse.title}
            />
          ) : (
            <div className="aspect-video w-full bg-zinc-900 flex items-center justify-center text-zinc-500 text-lg font-bold">
              Ders seçiniz
            </div>
          )}

          <div className="p-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <h2 className="text-xl font-black uppercase italic text-white mb-2">
                {selectedCourse.title}
              </h2>

              <div className="flex gap-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                <span>{selectedCourse.category}</span>
                <span>•</span>
                <span>{selectedCourse.type}</span>
                <span>•</span>
                <span>%{getCourseProgress(selectedCourse.id)}</span>
              </div>

              {quizMap[selectedCourse.id] && (
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-400">
                  Quiz: {quizMap[selectedCourse.id].title}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {quizMap[selectedCourse.id] && (
                <button
                  type="button"
                  onClick={() => handleStartQuiz(selectedCourse)}
                  className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Quiz'e Başla
                </button>
              )}

              <button
                type="button"
                onClick={markAsCompleted}
                disabled={savingProgress}
                className="px-6 py-4 bg-[#E61A21] hover:bg-red-700 text-white rounded-full font-black uppercase text-[10px] tracking-widest transition-all"
              >
                {savingProgress ? "Kaydediliyor..." : "Tamamlandı Olarak İşaretle"}
              </button>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-black uppercase text-[10px] tracking-widest transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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