import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false });
  }

  const { role, module } = req.query;

  let query = supabaseAdmin
    .from("duyurular")
    .select("*")
    .order("created_at", { ascending: false });

  if (role) {
  query = query.or(`target_role.eq.all,target_role.eq.${role}`);
}

  if (module && module !== "all") {
    query = query.or(`module.eq.general,module.eq.${module}`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  return res.status(200).json({ success: true, data });
}