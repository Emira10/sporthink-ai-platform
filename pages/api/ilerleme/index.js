import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { data: quizResults = [], error: quizError } = await supabaseAdmin
      .from("quiz_results")
      .select("*")
      .order("created_at", { ascending: false });

    if (quizError) throw quizError;

    const { data: profiles = [], error: profilesError } = await supabaseAdmin
      .from("user_learning_profile")
      .select("*");

    if (profilesError) throw profilesError;

    const { data: points = [], error: pointsError } = await supabaseAdmin
  .from("user_points")
  .select("*");

if (pointsError) throw pointsError;

const { data: certificateRows = [], error: certificateError } = await supabaseAdmin
  .from("user_certificates")
  .select("*")
  .order("issued_at", { ascending: false });

if (certificateError) throw certificateError;

    const courseMap = {};

quizResults.forEach((q) => {
  const title = q.quiz_title || q.course_title || "Genel Eğitim";
  const score = Number(q.score || q.total_score || 0);

  if (!courseMap[title]) {
    courseMap[title] = {
      title,
      totalScore: 0,
      count: 0,
      maxScore: score,
      minScore: score,
    };
  }

  courseMap[title].totalScore += score;
  courseMap[title].count += 1;
  courseMap[title].maxScore = Math.max(courseMap[title].maxScore, score);
  courseMap[title].minScore = Math.min(courseMap[title].minScore, score);
});

const courses = Object.values(courseMap).map((c) => ({
  course_title: c.title,
  joined_count: c.count,
  success_rate: c.count > 0 ? Math.round(c.totalScore / c.count) : 0,
  avg_duration: `${c.count} sonuç · En yüksek: ${c.maxScore}/100 · En düşük: ${c.minScore}/100`,
}));

    const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const weeklyMap = {};

days.forEach((d) => {
  weeklyMap[d] = {
    day: d,
    activeUsers: 0,
    completedLessons: 0,
    avgScore: 0,
    xp: 0,
    totalScore: 0,
    scoreCount: 0,
    lessons: [],
  };
});

const getTurkishDay = (dateValue) => {
  const date = dateValue ? new Date(dateValue) : new Date();

  const dayIndex = date.getDay();

  const map = {
    1: "Pzt",
    2: "Sal",
    3: "Çar",
    4: "Per",
    5: "Cum",
    6: "Cmt",
    0: "Paz",
  };

  return map[dayIndex] || "Pzt";
};

quizResults.forEach((q) => {
  const score = Number(q.score || q.total_score || 0);
  const day = getTurkishDay(q.created_at);

  weeklyMap[day].activeUsers += 1;
  weeklyMap[day].completedLessons += score >= 60 ? 1 : 0;
  weeklyMap[day].totalScore += score;
  weeklyMap[day].scoreCount += 1;
  weeklyMap[day].lessons.push({
  title: q.quiz_title || q.course_title || "Genel Eğitim",
  student: q.full_name || "Kullanıcı",
  score,
});
});

points.forEach((p) => {
  const day = getTurkishDay(p.created_at);

  weeklyMap[day].xp += Number(p.points || p.xp || 0);
});

const weeklyTrends = Object.values(weeklyMap).map((d) => ({
  day: d.day,
  activeUsers: d.activeUsers,
  completedLessons: d.completedLessons,
  avgScore:
    d.scoreCount > 0
      ? Math.round(d.totalScore / d.scoreCount)
      : 0,
  xp: d.xp,
  lessons: d.lessons,
}));

    const groupedUsers = {};

    quizResults.forEach((q) => {
      const userId = q.kullanici_id || q.user_id || q.email || q.full_name;
      if (!userId) return;

      const profile = profiles.find(
        (p) =>
          String(p.kullanici_id) === String(userId) ||
          String(p.user_id) === String(userId)
      );

      const score = Number(q.score || q.total_score || 0);
      const xp = Number(profile?.xp || profile?.total_xp || 0);

      if (!groupedUsers[userId]) {
        groupedUsers[userId] = {
          id: userId,
          full_name: q.full_name || profile?.full_name || "Kullanıcı",
          role: "Katılımcı",
          course_title: q.quiz_title || q.course_title || "Quiz",
          progress: score >= 60 ? 100 : Math.max(25, score),
          score,
          xp,
          status: score >= 60 ? "Tamamlandı" : "Riskli",
          last_activity: q.created_at,
        };
      } else {
        groupedUsers[userId].score = Math.max(groupedUsers[userId].score, score);
        groupedUsers[userId].xp = Math.max(groupedUsers[userId].xp, xp);
      }
    });

    const users = Object.values(groupedUsers);

    const riskUsers = users
      .filter((u) => {
        const progress = Number(u.progress || 0);
        const score = Number(u.score || 0);
        const lastActivity = u.last_activity ? new Date(u.last_activity) : null;

        const inactiveDays = lastActivity
          ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        return progress < 40 || score < 60 || inactiveDays >= 7;
      })
      .map((u) => {
        const score = Number(u.score || 0);
        const progress = Number(u.progress || 0);
        const lastActivity = u.last_activity ? new Date(u.last_activity) : null;

        const inactiveDays = lastActivity
          ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        let reason = "Takip edilmesi gerekiyor";
        let level = "Takip Gerekli";

        if (inactiveDays >= 14) {
          reason = `${inactiveDays} gündür eğitime giriş yapmadı`;
          level = "Yüksek Risk";
        } else if (score < 50) {
          reason = "Sınav başarısı %50 altında";
          level = "Yüksek Risk";
        } else if (score < 60) {
          reason = "Sınav başarısı %60 altında";
          level = "Orta Risk";
        } else if (progress < 40) {
          reason = "Eğitim ilerlemesi kritik seviyede";
          level = "Orta Risk";
        } else if (inactiveDays >= 7) {
          reason = `${inactiveDays} gündür aktivite yok`;
          level = "Takip Gerekli";
        }

        return {
  name: u.full_name,
  course: u.course_title,
  reason,
  level,
};
      });

    const totalUsers = users.length;

    const completed = users.filter((u) => Number(u.score || 0) >= 60).length;

    const activeTraining = users.filter(
      (u) => Number(u.score || 0) > 0 && Number(u.score || 0) < 60
    ).length;

    const riskCount = riskUsers.length;

    const avgScore =
      users.length > 0
        ? Math.round(
            users.reduce((sum, u) => sum + Number(u.score || 0), 0) / users.length
          )
        : 0;

    return res.status(200).json({
      ok: true,

      kpis: [
  {
    title: "Aktif Katılımcı",
    value: totalUsers,
    change: "Canlı",
    students: users.map((u) => ({
      name: u.full_name,
      course: u.course_title,
      score: u.score,
      xp: u.xp,
      status: u.status,
    })),
  },
  {
    title: "Tamamlanan Eğitim",
    value: completed,
    change: "+",
    students: users
      .filter((u) => Number(u.score || 0) >= 60)
      .map((u) => ({
        name: u.full_name,
        course: u.course_title,
        score: u.score,
        xp: u.xp,
        status: u.status,
      })),
  },
  {
    title: "Ortalama Başarı",
    value: `%${avgScore}`,
    change: "+",
    students: users.map((u) => ({
      name: u.full_name,
      course: u.course_title,
      score: u.score,
      xp: u.xp,
      status: u.status,
    })),
  },
  {
    title: "Devam Eden Eğitim",
    value: activeTraining,
    change: "Canlı",
    students: users
      .filter((u) => Number(u.score || 0) > 0 && Number(u.score || 0) < 60)
      .map((u) => ({
        name: u.full_name,
        course: u.course_title,
        score: u.score,
        xp: u.xp,
        status: u.status,
      })),
  },
  {
    title: "Tamamlamayanlar",
    value: riskCount,
    change: "Risk",
    students: users
      .filter((u) => Number(u.score || 0) < 60)
      .map((u) => ({
        name: u.full_name,
        course: u.course_title,
        score: u.score,
        xp: u.xp,
        status: "Riskli",
      })),
  },
],

      users: users.map((u) => ({
        name: u.full_name,
        role: u.role || "Katılımcı",
        course: u.course_title || "Eğitim atanmadı",
        progress: Number(u.progress || 0),
        score: Number(u.score || 0),
        xp: Number(u.xp || 0),
        status: u.status || "Devam Ediyor",
        badge:
          Number(u.progress || 0) >= 100
            ? "🥇"
            : Number(u.score || 0) < 60
            ? "⚠️"
            : "🔥",
      })),

      riskUsers,

      courses: courses.map((c) => ({
        title: c.course_title || c.title || "Eğitim",
        join: Number(c.joined_count || c.join || 0),
        success: Number(c.success_rate || c.success || 0),
        duration: c.avg_duration || c.duration || "0 dk",
      })),

      weeklyTrends: weeklyTrends.map((t) => ({
  day: t.day,
  activeUsers: Number(t.activeUsers || 0),
  completedLessons: Number(t.completedLessons || 0),
  avgScore: Number(t.avgScore || 0),
  xp: Number(t.xp || 0),
  lessons: t.lessons || [],
})),

      certificates: [
  {
    title: "Approved",
    value: certificateRows.filter((c) => c.status === "approved").length,
    items: certificateRows.filter((c) => c.status === "approved"),
  },
  {
    title: "Pending",
    value: certificateRows.filter((c) => c.status === "pending").length,
    items: certificateRows.filter((c) => c.status === "pending"),
  },
  {
    title: "Rejected",
    value: certificateRows.filter((c) => c.status === "rejected").length,
    items: certificateRows.filter((c) => c.status === "rejected"),
  },
],

    });
  } catch (error) {
    console.error("İlerleme API error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "İlerleme API hatası",
    });
  }
}