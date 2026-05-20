import { useEffect, useState } from "react";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";
import { supabase } from "../../lib/supabaseClient";

export default function EgitimAtamalari() {
  const [trainings, setTrainings] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [trainingId, setTrainingId] = useState("");
  const [userId, setUserId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [assignmentType, setAssignmentType] = useState("mandatory");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: trainingData, error: tError } = await supabase
  .from("trainings")
  .select("id, title, category, course_id")
  .not("title", "is", null) // مهم
  .order("created_at", { ascending: false });

    console.log("TRAININGS:", trainingData);
    console.log("TRAININGS ERROR:", tError);

    const { data: userData } = await supabase
      .from("kullanicilar")
      .select("*")
      .order("ad", { ascending: true });

    const { data: depData } = await supabase
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: assignmentData } = await supabase
      .from("training_assignments")
      .select(`*, trainings(title), departments(name)`)
      .order("created_at", { ascending: false });

    setTrainings(trainingData || []);
    setUsers(userData || []);
    setDepartments(depData || []);
    setAssignments(assignmentData || []);
  }

  async function handleAssign(e) {
    e.preventDefault();

    if (!trainingId) {
      alert("Lütfen eğitim seçin.");
      return;
    }

    if (!userId && !departmentId) {
      alert("Lütfen kullanıcı veya departman seçin.");
      return;
    }

    const { error } = await supabase.from("training_assignments").insert([
      {
        training_id: trainingId,
        user_id: userId ? Number(userId) : null,
        department_id: departmentId || null,
        assignment_type: assignmentType,
        due_date: dueDate || null,
        status: "assigned",
      },
    ]);

    if (error) {
      console.error(error.message);
      alert("Atama sırasında hata oluştu.");
      return;
    }

    setTrainingId("");
    setUserId("");
    setDepartmentId("");
    setAssignmentType("mandatory");
    setDueDate("");
    fetchAll();
    alert("Eğitim başarıyla atandı.");
  }

  return (
    <YoneticiLayout
      pageTitle="Eğitim Atamaları"
      pageSubtitle="Doğru eğitimi doğru kişiye veya departmana ata"
    >
      {({ isDark }) => (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <form
            onSubmit={handleAssign}
            className={`xl:col-span-1 rounded-[3rem] p-7 border space-y-5 ${
              isDark
                ? "bg-white/[0.04] border-white/10"
                : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            <h2 className="text-2xl font-black italic">Yeni Eğitim Ataması</h2>

            <SelectBox label="Eğitim Seç" value={trainingId} onChange={setTrainingId}>
              <option value="">Eğitim seçin</option>
              {trainings.map((item, index) => (
                <option key={`${item.id}-${index}`} value={item.id}>
                  {item.title || "İsimsiz Eğitim"}
                </option>
              ))}
            </SelectBox>

            <SelectBox label="Kullanıcı Seç" value={userId} onChange={setUserId}>
              <option value="">Kullanıcı seçmeden devam et</option>
              {users.map((u, index) => (
                <option key={`${u.id}-${index}`} value={u.id}>
                  {u.ad} {u.soy_ad}
                </option>
              ))}
            </SelectBox>

            <SelectBox label="Departman Seç" value={departmentId} onChange={setDepartmentId}>
              <option value="">Departman seçmeden devam et</option>
              {departments.map((d, index) => (
                <option key={`${d.id}-${index}`} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectBox>

            <SelectBox label="Atama Türü" value={assignmentType} onChange={setAssignmentType}>
              <option value="mandatory">Zorunlu</option>
              <option value="optional">Opsiyonel</option>
            </SelectBox>

            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Son Tamamlama Tarihi
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`mt-2 w-full p-4 rounded-2xl border outline-none text-sm transition-all ${
                  isDark
                    ? "bg-black/20 border-white/10 text-white"
                    : "bg-white border-zinc-200 text-zinc-900"
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E61A21] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all"
            >
              Atama Yap
            </button>
          </form>

          <div
            className={`xl:col-span-2 rounded-[3rem] p-7 border ${
              isDark
                ? "bg-white/[0.04] border-white/10"
                : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            <h2 className="text-2xl font-black italic mb-6">Yapılan Atamalar</h2>

            <div className="space-y-3">
              {assignments.length === 0 ? (
                <p className="text-sm text-zinc-500 font-bold">
                  Henüz atama yapılmadı.
                </p>
              ) : (
                assignments.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                      isDark ? "bg-white/5" : "bg-zinc-50"
                    }`}
                  >
                    <div>
                      <p className="font-black">
                        {item.trainings?.title || "Eğitim"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Departman: {item.departments?.name || "Kişisel atama"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Son Tarih: {item.due_date || "Belirtilmedi"}
                      </p>
                    </div>

                    <div className="flex gap-3 text-[10px] font-black uppercase">
                      <span className="px-3 py-2 rounded-full bg-[#E61A21]/10 text-[#E61A21]">
                        {item.assignment_type}
                      </span>
                      <span className="px-3 py-2 rounded-full bg-zinc-500/10 text-zinc-500">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </YoneticiLayout>
  );
}

function SelectBox({ label, value, onChange, children }) {
  return (
    <div>
      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full p-4 rounded-2xl bg-white text-zinc-900 border border-zinc-300 outline-none text-sm"
      >
        {children}
      </select>
    </div>
  );
}