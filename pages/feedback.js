import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FeedbackPage() {
  const [text, setText] = useState("");

  async function send() {
    const email = localStorage.getItem("userEmail") || "anon";

    if (!text) return;

    await supabase.from("feedbacks").insert([
      {
        user_email: email,
        message: text,
      },
    ]);

    setText("");
    alert("Gönderildi ✅");
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Geri Bildirim</h2>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Yorumunu yaz..."
        style={{ width: "100%", height: 120 }}
      />

      <button onClick={send}>Gönder</button>
    </div>
  );
}