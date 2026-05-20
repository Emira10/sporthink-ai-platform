import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { data, error } = await supabaseAdmin
      .from("leaderboard_view")
      .select("*")
      .order("points", { ascending: false });

    if (error) throw error;

    const demoUsers = [
  { student_name: "Ayşe Demir", points: 980, level: 11, is_demo: true },
  { student_name: "Mehmet Kaya", points: 920, level: 10, is_demo: true },
  { student_name: "Zeynep Arslan", points: 870, level: 10, is_demo: true },
  { student_name: "Elif Karaca", points: 810, level: 9, is_demo: true },
  { student_name: "Can Özdemir", points: 760, level: 8, is_demo: true },
  { student_name: "Burak Yıldız", points: 720, level: 8, is_demo: true },
  { student_name: "Mina Aydın", points: 690, level: 7, is_demo: true },
  { student_name: "Seda Kurt", points: 640, level: 7, is_demo: true },
  { student_name: "Emre Çelik", points: 590, level: 6, is_demo: true },
  { student_name: "Derya Aksoy", points: 530, level: 6, is_demo: true },
];

const leaderboard = [...(data || []), ...demoUsers].sort(
  (a, b) => Number(b.points || 0) - Number(a.points || 0)
);

return res.status(200).json({
  success: true,
  leaderboard,
});
  } catch (err) {
    console.error("leaderboard api error:", err);
    return res.status(500).json({ error: err.message });
  }
}