import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Sadece GET isteği desteklenir",
    });
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const [
      usersRes,
      progressRes,
      departmentsRes,
      trainingsRes,
      coursesRes,
      assignmentsRes,
      certificatesRes,
      quizRes,
      quizzesRes,
      delayedAssignmentsRes,
      latestAssignmentsRes,
    ] = await Promise.all([
      supabaseAdmin.from("kullanicilar").select("*"),
      supabaseAdmin.from("training_progress").select("*"),
      supabaseAdmin.from("departments").select("*"),
      supabaseAdmin
  .from("trainings")
  .select("id, title, training_title, type, created_at")
  .order("created_at", { ascending: false }),

  supabaseAdmin
  .from("courses_data")
  .select("id, title, category, content_type, created_at")
  .order("created_at", { ascending: false }),

      supabaseAdmin.from("training_assignments").select("*", { count: "exact", head: true }),
      supabaseAdmin
  .from("user_certificates")
  .select("*")
  .order("issued_at", { ascending: false }),

      supabaseAdmin
  .from("quiz_results")
  .select("*")
  .order("created_at", { ascending: false }),

  supabaseAdmin
  .from("quizzes")
  .select("id, title, source"),

      supabaseAdmin
  .from("training_assignments")
  .select("*")
  .lt("due_date", today)
  .neq("status", "completed")
  .order("due_date", { ascending: true }),

      supabaseAdmin
  .from("training_assignments")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(12),
  ]);

    const users = usersRes.data || [];
    const progress = progressRes.data || [];
    const departments = departmentsRes.data || [];
    const quizData = quizRes.data || [];
    const quizzesData = quizzesRes.data || [];

const quizLookup = {};

quizzesData.forEach((q) => {
  quizLookup[String(q.id)] = {
    title: q.title || "Quiz",
    source: q.source || "normal",
  };
});

    const trainingsData = trainingsRes.data || [];

    const coursesData = coursesRes.data || [];
    const certificatesData = certificatesRes.data || [];

const allTrainingsData = [
  ...trainingsData.map((t) => ({
    id: `training-${t.id}`,
    title: t.training_title || t.title || "Eğitim",
    type: t.type || "Training",
    created_at: t.created_at || null,
  })),
  ...coursesData.map((c) => ({
    id: `course-${c.id}`,
    title: c.title || "Eğitim",
    type: c.content_type || c.category || "Course",
    created_at: c.created_at || null,
  })),
];

const trainingLookup = {};

allTrainingsData.forEach((t) => {
  const cleanId = String(t.id).replace("training-", "").replace("course-", "");
  trainingLookup[cleanId] = t.title;
});

const userLookup = {};

users.forEach((u) => {
  const id = String(u.id || u.kullanici_id);

  userLookup[id] =
    u.full_name ||
    `${u.ad || ""} ${u.soyad || ""}`.trim() ||
    u.email ||
    u.e_posta ||
    "Kullanıcı";
});

const quizResultsList = quizData.slice(0, 12).map((q) => {
  const userId = String(q.kullanici_id || q.user_id || "");

  const relatedQuiz = quizzesData.find(
    (quiz) =>
      String(quiz.id) === String(q.training_id) ||
      String(quiz.id) === String(q.ai_course_id)
  );

  return {
    id: q.id,
    user_name: userLookup?.[userId] || q.full_name || `Kullanıcı ${userId}`,
    score: Number(q.score || 0),
    
    quiz_title:
  q.quiz_title ||
  relatedQuiz?.title ||
  q.title ||
  "Quiz Sonucu",

    quiz_type:
  q.quiz_type ||
  (q.source === "ai"
    ? "AI QUIZ"
    : q.source === "normal"
    ? "NORMAL SINAV"
    : q.source === "general"
    ? "GENEL QUIZ"
    : relatedQuiz?.source === "ai"
    ? "AI QUIZ"
    : relatedQuiz?.source === "normal"
    ? "NORMAL SINAV"
    : "GENEL QUIZ"),

    status: Number(q.score || 0) >= 60 ? "BAŞARILI" : "DÜŞÜK",
    created_at: q.created_at || null,
  };
});

const certificatesList = certificatesData.map((c) => {
  const userId = String(c.user_id || "");

  return {
    id: c.id,
    user_name: userLookup[userId] || `Kullanıcı ${userId}`,
    training_name: c.training_name || "Eğitim",
    level: c.level || "Seviye yok",
    score: c.score || "",
    status: c.status || "unlocked",
    issued_at: c.issued_at || null,
  };
});

    const { data: activeUsersDataRaw, error: activeUsersError } =
  await supabaseAdmin
    .from("kullanicilar")
    .select("*")
    .gte(
      "son_giris_tarihi",
      new Date(Date.now() - 60 * 60 * 1000).toISOString()
    )
    .order("son_giris_tarihi", { ascending: false });

if (activeUsersError) {
  throw activeUsersError;
}

const activeUsersData = activeUsersDataRaw || [];

const activeUserIds = activeUsersData.map((u) => u.id || u.kullanici_id);

const activeUsers = activeUsersData.length;

const activeIdSet = new Set(
  activeUsersData.map((u) => String(u.id || u.kullanici_id))
);

const inactiveUsersData = users
  .filter((u) => !activeIdSet.has(String(u.id || u.kullanici_id)))
  .slice(0, 12);


    const totalUsers = users.length;
    const inactiveUsers = Math.max(totalUsers - activeUsers, 0);

    const completedCourses = progress.filter(
      (p) => p.status === "completed"
    ).length;

    const totalLearningMinutes = progress.reduce(
      (sum, p) => sum + Number(p.learning_minutes || 0),
      0
    );

    const avgQuiz =
      quizData.length > 0
        ? Math.round(
            quizData.reduce((sum, item) => sum + Number(item.score || 0), 0) /
              quizData.length
          )
        : 0;

    const topLearnersMap = {};

    progress.forEach((p) => {
      const uid = p.user_id || p.kullanici_id;
      if (!uid) return;

      const user = users.find(
        (u) =>
          String(u.id) === String(uid) ||
          String(u.kullanici_id) === String(uid)
      );

      const fullName =
        p.full_name ||
        user?.full_name ||
        `${user?.ad || ""} ${user?.soyad || ""}`.trim() ||
        user?.email ||
        user?.e_posta ||
        `Kullanıcı ${uid}`;

      if (!topLearnersMap[uid]) {
        topLearnersMap[uid] = {
          user_id: uid,
          full_name: fullName,
          points: 0,
        };
      }

      topLearnersMap[uid].points += Number(p.progress_percent || 0);
    });

    const topLearners = Object.values(topLearnersMap)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    const studentLearningMap = {};

// 1) أولاً: نضيف كل المستخدمين الحقيقيين حتى ما يطلع Kullanıcı / Bilinmiyor
users.forEach((u) => {
  const uid = u.kullanici_id || u.id;
  if (!uid) return;

  const fullName =
    u.full_name ||
    `${u.ad || ""} ${u.soyad || ""}`.trim() ||
    u.email ||
    u.e_posta ||
    "Bilinmeyen Kullanıcı";

  studentLearningMap[uid] = {
    user_id: uid,
    full_name: fullName,
    email: u.email || u.e_posta || "",
    role: u.role || u.rol || "Kullanıcı",
    total_minutes: 0,
    completed: 0,
    courses: 0,
  };
});

// 2) ثانياً: نضيف بيانات التعلم الحقيقية فوق أسماء المستخدمين
progress.forEach((p) => {
  const uid = p.user_id || p.kullanici_id;
  if (!uid) return;

  if (!studentLearningMap[uid]) {
    studentLearningMap[uid] = {
      user_id: uid,
      full_name: p.full_name || "Bilinmeyen Kullanıcı",
      email: "",
      role: p.role || "Kullanıcı",
      total_minutes: 0,
      completed: 0,
      courses: 0,
    };
  }

  studentLearningMap[uid].total_minutes += Number(p.learning_minutes || 0);
  studentLearningMap[uid].courses += 1;

  if (p.status === "completed") {
    studentLearningMap[uid].completed += 1;
  }
});

const studentLearningStats = Object.values(studentLearningMap)
  .sort((a, b) => Number(b.total_minutes || 0) - Number(a.total_minutes || 0))
  .slice(0, 12);

    const departmentMap = {};

users.forEach((u) => {
  const dept =
  u.department ||
  u.departman ||
  "Genel";

  if (!departmentMap[dept]) {
    departmentMap[dept] = {
      department: dept,
      total: 0,
      active: 0,
    };
  }

  departmentMap[dept].total += 1;

  const relatedProgress = progress.filter(
    (p) => Number(p.kullanici_id) === Number(u.kullanici_id)
  );

  if (relatedProgress.length > 0) {
    departmentMap[dept].active += 1;
  }
});

const departmentPerformance = Object.values(departmentMap).map((d) => ({
  department: d.department,
  percent:
    d.total > 0
      ? Math.round((d.active / d.total) * 100)
      : 0,
  users: d.total,
}));

    return res.status(200).json({
      ok: true,

      users: users.map((u) => ({
  id: u.id || u.kullanici_id,
  name:
    u.full_name ||
    `${u.ad || ""} ${u.soyad || ""}`.trim() ||
    u.email ||
    u.e_posta ||
    "Bilinmeyen Kullanıcı",
  email: u.email || u.e_posta || "",
  role: u.role || u.rol || "Kullanıcı",
})),

trainings: allTrainingsData,

quizResults: quizResultsList,

certificates: certificatesList,

      stats: {
        users: totalUsers,
        activeUsers,
        inactiveUsers,
        trainings: allTrainingsData.length,
        assignments: assignmentsRes.count || 0,
        delayed: (delayedAssignmentsRes.data || []).length,
        certificates: certificatesList.length,
        avgQuiz,
      },

      departments,
      departmentPerformance,
      activities: (latestAssignmentsRes.data || []).map((a) => {
  const userId = String(a.kullanici_id || a.user_id || "");
  const trainingId = String(a.training_id || "");

  return {
    ...a,
    user_name: userLookup[userId] || `Kullanıcı ${userId}`,
    training_title: trainingLookup[trainingId] || "Eğitim",
  };
}),

delayedAssignments: (delayedAssignmentsRes.data || []).map((a) => {
  const userId = String(a.kullanici_id || a.user_id || "");
  const trainingId = String(a.training_id || "");

  return {
    ...a,
    user_name: userLookup[userId] || `Kullanıcı ${userId}`,
    training_title: trainingLookup[trainingId] || "Eğitim",
  };
}),

delayedAssignments: (delayedAssignmentsRes.data || []).map((a) => {
  const userId = String(a.kullanici_id || a.user_id || "");
  const trainingId = String(a.training_id || "");

  return {
    ...a,
    user_name: userLookup[userId] || `Kullanıcı ${userId}`,
    training_title: trainingLookup[trainingId] || "Eğitim",
  };
}),

      analytics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        completedCourses,
        totalLearningMinutes,
        departmentCount: departments.length,
        topLearners,
        activeUsersData,
        inactiveUsersData,
        studentLearningStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}