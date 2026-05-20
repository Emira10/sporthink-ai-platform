export async function updateInstructorActivity(supabaseAdmin, email = "test@test.com") {
  if (!email) return;

  await supabaseAdmin
    .from("instructor_profiles")
    .update({
      last_login_at: new Date().toISOString(),
      activity_status: "Online",
    })
    .eq("email", email);
}