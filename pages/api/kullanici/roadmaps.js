import { supabaseAdmin } from "../../../lib/supabaseAdmin";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  try {
    const kullanici_id = req.query.kullanici_id;
    if (!kullanici_id) {
      return res.status(400).json({ ok: false, message: "kullanici_id gerekli" });
    }

    const { data = [], error } = await supabaseAdmin
      .from("roadmap_assignments")
      .select(`
        id,user_id,user_name,department,progress,status,risk,
        roadmaps (
          id,title,department,level,status,risk,ai_note,
          roadmap_steps (
            id,title,step_order,step_type,target_id,target_table,target_url
          )
        )
      `)
      .eq("user_id", String(kullanici_id))
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: progressRows = [] } = await supabaseAdmin
      .from("user_progress")
      .select("course_id,status,progress_percent")
      .eq("kullanici_id", Number(kullanici_id));

    const completedIds = new Set(
      progressRows
        .filter((p) => p.status === "completed" || Number(p.progress_percent || 0) >= 100)
        .map((p) => String(p.course_id))
    );

    const { data: courses = [] } = await supabaseAdmin
      .from("courses_data")
      .select("id,title,video_url,file_url");

    const { data: trainings = [] } = await supabaseAdmin
      .from("trainings")
      .select("id,title,video_url,file_url");

    const allLearningItems = [
      ...courses.map((c) => ({ ...c, source: "courses_data" })),
      ...trainings.map((t) => ({ ...t, source: "trainings" })),
    ];

    const roadmaps = data.map((row) => {
      const r = row.roadmaps || {};
      const steps = (r.roadmap_steps || []).sort(
        (a, b) => Number(a.step_order || 0) - Number(b.step_order || 0)
      );

      const analyzedSteps = steps.map((s) => {
        let targetId = s.target_id ? String(s.target_id) : null;
        let targetTable = s.target_table || null;
        let targetUrl = s.target_url || null;

        if (!targetId) {
          const matched = allLearningItems.find(
            (item) => normalize(item.title) === normalize(s.title)
          );

          if (matched) {
            targetId = String(matched.id);
            targetTable = matched.source;
            targetUrl = matched.video_url || matched.file_url || null;
          }
        }

        const isCertificateStep =
  normalize(s.title).includes("sertifika") ||
  String(s.step_type || "").toLowerCase() === "certificate";

const done = isCertificateStep
  ? false
  : targetId
  ? completedIds.has(String(targetId))
  : false;

return {
  id: s.id,
  title: s.title,
  step_type: isCertificateStep ? "certificate" : s.step_type || "training",
  target_id: targetId,
  target_table: targetTable,
  target_url: targetUrl,
  done,
  is_certificate: isCertificateStep,
  active: false,
  locked: true,
};

      });

    const hasCertificateStep = analyzedSteps.some((s) => s.is_certificate);

const stepsWithCertificate = hasCertificateStep
  ? analyzedSteps
  : [
      ...analyzedSteps,
      {
        id: `certificate-${r.id}`,
        title: "Sertifika",
        step_type: "certificate",
        target_id: null,
        target_table: null,
        target_url: null,
        done: false,
        is_certificate: true,
        active: false,
        locked: true,
      },
    ];

      const nonCertificateSteps = stepsWithCertificate.filter((s) => !s.is_certificate);
const allLearningDone =
  nonCertificateSteps.length > 0 &&
  nonCertificateSteps.every((s) => s.done);

let firstNotDoneIndex = stepsWithCertificate.findIndex(
  (s) => !s.done && !s.is_certificate
);

if (allLearningDone) {
  firstNotDoneIndex = analyzedSteps.findIndex((s) => s.is_certificate);
}

if (firstNotDoneIndex === -1) firstNotDoneIndex = analyzedSteps.length;

const finalSteps = stepsWithCertificate.map((s, index) => {
  const isActive = index === firstNotDoneIndex;

  return {
    ...s,
    active: isActive,
    locked: index > firstNotDoneIndex,
  };
});

      const completedCount = finalSteps.filter((s) => s.done).length;
      const realProgress = finalSteps.length
        ? Math.round((completedCount / finalSteps.length) * 100)
        : 0;

      return {
        assignment_id: row.id,
        roadmap_id: r.id,
        title: r.title,
        department: r.department,
        level: r.level,
        ai_note: r.ai_note,
        progress: realProgress,
        status: realProgress >= 100 ? "Tamamlandı" : "Devam Ediyor",
        risk: row.risk,
        steps: finalSteps,
      };
    });

    return res.status(200).json({ ok: true, roadmaps });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}