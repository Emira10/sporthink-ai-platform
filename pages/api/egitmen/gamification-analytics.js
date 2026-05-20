import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    // TOP XP USERS
    const { data: topUsers } = await supabaseAdmin
      .from("profiles")
      .select("full_name,total_xp,level")
      .order("total_xp", { ascending: false })
      .limit(5);

    // ACTIVE GROUPS
    const { data: groups } = await supabaseAdmin
      .from("social_groups")
      .select(`
        id,
        title,
        social_group_members(id)
      `);

    const activeGroups = (groups || []).map((g) => ({
      title: g.title,
      members: g.social_group_members?.length || 0,
    }));

    // MOST USED BADGE
    const { data: badgeStats } = await supabaseAdmin
      .from("user_badges")
      .select(`
        badge_id,
        badges(title)
      `);

    const badgeCounter = {};

    for (const b of badgeStats || []) {
      const title = b.badges?.title || "Rozet";

      badgeCounter[title] = (badgeCounter[title] || 0) + 1;
    }

    let topBadge = "Yok";
    let topBadgeCount = 0;

    Object.entries(badgeCounter).forEach(([title, count]) => {
      if (count > topBadgeCount) {
        topBadge = title;
        topBadgeCount = count;
      }
    });

    // TOTAL XP
    const { data: xpRows } = await supabaseAdmin
      .from("user_points")
      .select("points");

    const totalXP = (xpRows || []).reduce(
      (sum, x) => sum + Number(x.points || 0),
      0
    );

    return res.status(200).json({
      ok: true,
      analytics: {
        topUsers: topUsers || [],
        activeGroups,
        topBadge,
        topBadgeCount,
        totalXP,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}