import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data: users, error: usersError } = await supabaseAdmin
        .from("kullanicilar")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      const { data: permissions, error: permissionsError } = await supabaseAdmin
        .from("permissions")
        .select("*")
        .order("id", { ascending: true });

      if (permissionsError) throw permissionsError;

      const { data: rolePermissions, error: rolePermissionsError } = await supabaseAdmin
        .from("role_permissions")
        .select("role_id, permission_id");

      if (rolePermissionsError) throw rolePermissionsError;

      const formattedPermissions = (permissions || []).map((permission) => {
        const roles = (rolePermissions || [])
          .filter((rp) => rp.permission_id === permission.id)
          .map((rp) => rp.role_id);

        return {
          id: permission.id,
          key: permission.permission_key,
          label: permission.label,
          description: permission.description,
          roles,
        };
      });

      return res.status(200).json({
        ok: true,
        users: users || [],
        permissions: formattedPermissions,
      });
    }

    if (req.method === "POST") {
      const { permission_id, role_id, action } = req.body;

      if (!permission_id || !role_id || !action) {
        return res.status(400).json({
          ok: false,
          message: "permission_id, role_id ve action zorunlu",
        });
      }

      if (action === "add") {
        const { error } = await supabaseAdmin
          .from("role_permissions")
          .insert({
            permission_id,
            role_id,
          });

        if (error && error.code !== "23505") throw error;

        return res.status(200).json({
          ok: true,
          message: "Yetki eklendi",
        });
      }

      if (action === "remove") {
        const { error } = await supabaseAdmin
          .from("role_permissions")
          .delete()
          .eq("permission_id", permission_id)
          .eq("role_id", role_id);

        if (error) throw error;

        return res.status(200).json({
          ok: true,
          message: "Yetki kaldırıldı",
        });
      }

      return res.status(400).json({
        ok: false,
        message: "Geçersiz action",
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("rol-yetki API error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Sunucu hatası",
    });
  }
}