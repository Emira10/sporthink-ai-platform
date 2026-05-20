import { useEffect, useMemo, useState } from "react";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";
import {
  Route,
  Brain,
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trophy,
  Plus,
  Search,
  Filter,
  Sparkles,
  Layers,
  Lock,
  PlayCircle,
} from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

const demoRoadmaps = [
  {
    id: 1,
    title: "AI Destekli Eğitim Uzmanlığı",
    department: "IT",
    level: "İleri Seviye",
    progress: 72,
    users: 34,
    risk: "Düşük",
    status: "Aktif",
    aiNote: "Katılımcılar veri analizi aşamasında güçlü performans gösteriyor.",
    steps: [
      { title: "Temel AI Eğitimi", done: true },
      { title: "Veri Analizi Quiz", done: true },
      { title: "Gerçek Senaryo Görevi", done: false, active: true },
      { title: "Final Değerlendirme", done: false, locked: true },
    ],
  },
  {
    id: 2,
    title: "Satış ve Müşteri İletişimi",
    department: "Satış",
    level: "Orta Seviye",
    progress: 41,
    users: 21,
    risk: "Yüksek",
    status: "Takipte",
    aiNote: "İletişim modülünde gecikme var. Ek pratik öneriliyor.",
    steps: [
      { title: "İletişim Temelleri", done: true },
      { title: "Müşteri Senaryosu", done: false, active: true },
      { title: "Performans Quiz", done: false },
      { title: "Sertifika", done: false, locked: true },
    ],
  },
  {
    id: 3,
    title: "Liderlik Gelişim Programı",
    department: "Yönetim",
    level: "Profesyonel",
    progress: 88,
    users: 12,
    risk: "Düşük",
    status: "Aktif",
    aiNote: "Tamamlanma oranı yüksek. Sertifika aşamasına yakın.",
    steps: [
      { title: "Liderlik Modülü", done: true },
      { title: "Takım Yönetimi", done: true },
      { title: "Kriz Senaryosu", done: true },
      { title: "Sertifika", done: false, active: true },
    ],
  },
];

export default function YoneticiYolHaritalari() {
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [department, setDepartment] = useState("all");
    const [selected, setSelected] = useState(null);
    const [activeKpi, setActiveKpi] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);
    const [learningItems, setLearningItems] = useState([]);

    const [showCreate, setShowCreate] = useState(false);
const [creating, setCreating] = useState(false);

const [newRoadmap, setNewRoadmap] = useState({
  title: "",
  department: "IT",
  level: "Başlangıç",
  status: "Aktif",
  risk: "Düşük",
  ai_note: "",
  selectedItems: [],
});

    useEffect(() => {
  fetchRoadmaps();
  fetchInsights();
  fetchLearningItems();
}, []);

async function fetchRoadmaps() {
  try {
    setLoading(true);

    const res = await fetch("/api/roadmaps");
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      setRoadmaps(json.data);
      setSelected(json.data[0] || null);
    } else {
      setRoadmaps(demoRoadmaps);
      setSelected(demoRoadmaps[0]);
    }
  } catch (err) {
    console.error("Roadmaps fetch error:", err);
    setRoadmaps(demoRoadmaps);
    setSelected(demoRoadmaps[0]);
  } finally {
    setLoading(false);
  }
}

async function fetchInsights() {
  try {
    const res = await fetch("/api/roadmaps/ai-insights");
    const json = await res.json();

    if (json.success) {
      setAiInsights(json.data || []);
    }
  } catch (err) {
    console.error(err);
  }
}

async function fetchLearningItems() {
  try {
    const res = await fetch("/api/roadmaps/learning-items");
    const json = await res.json();

    if (json.success) {
      setLearningItems(json.items || []);
    }
  } catch (err) {
    console.error("Learning items fetch error:", err);
  }
}

async function createRoadmap() {
  if (!newRoadmap.title.trim()) {
    alert("Yol haritası başlığı gerekli.");
    return;
  }

  const steps = newRoadmap.selectedItems.map((item) => ({
  title: item.title,
  step_type: "training",
  target_id: item.id,
  target_table: item.source,
}));

if (steps.length === 0) {
  alert("En az bir gerçek eğitim seçmelisin.");
  return;
}

  try {
    setCreating(true);


    const res = await fetch("/api/roadmaps/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newRoadmap.title,
        department: newRoadmap.department,
        level: newRoadmap.level,
        status: newRoadmap.status,
        risk: newRoadmap.risk,
        ai_note: newRoadmap.ai_note,
        steps,
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Yol haritası oluşturulamadı.");
    }

    setShowCreate(false);
    setNewRoadmap({
      title: "",
      department: "IT",
      level: "Başlangıç",
      status: "Aktif",
      risk: "Düşük",
      ai_note: "",
      selectedItems: [],
    });

    await fetchRoadmaps();
    alert("Yol haritası başarıyla oluşturuldu.");
  } catch (err) {
    alert(err.message);
  } finally {
    setCreating(false);
  }
}

async function assignDemoUsers(roadmapId) {
  if (!roadmapId) return;

  try {
    const res = await fetch("/api/roadmaps/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadmap_id: roadmapId,
        users: [
          {
            user_id: "1",
            user_name: "Emira Sabbagh",
            department: "IT",
          },
          {
            user_id: "2",
            user_name: "Ahmet Kaya",
            department: "IT",
          },
        ],
      }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "Atama yapılamadı.");
    }

    await fetchRoadmaps();
    alert("Roadmap kullanıcılara atandı.");
  } catch (err) {
    alert(err.message);
  }
}

  const filtered = useMemo(() => {
    return roadmaps.filter((r) => {
      const matchText = `${r.title} ${r.department} ${r.level}`.toLowerCase();
      const matchDepartment = department === "all" || r.department === department;
      return matchDepartment && matchText.includes(query.toLowerCase());
    });
  }, [query, department]);

  const avgProgress = Math.round(
    roadmaps.reduce((s, r) => s + r.progress, 0) / roadmaps.length
  );

  return (
    <YoneticiLayout
      pageTitle="YOL HARİTALARI"
      pageSubtitle="Kurumsal öğrenme, yetkinlik gelişimi ve AI destekli kariyer planlama merkezi."
    >
      {({ isDark }) => (
        <div className="space-y-6">
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <Kpi
  isDark={isDark}
  icon={Route}
  label="Toplam Yol"
  value={roadmaps.length}
  onClick={() => setActiveKpi("roadmaps")}
/>

<Kpi
  isDark={isDark}
  icon={Users}
  label="Katılımcı"
  value={roadmaps.reduce((sum, r) => sum + Number(r.users || 0), 0)}
  onClick={() => setActiveKpi("users")}
/>

<Kpi
  isDark={isDark}
  icon={TrendingUp}
  label="Ortalama İlerleme"
  value={`%${avgProgress}`}
  onClick={() => setActiveKpi("progress")}
/>

<Kpi
  isDark={isDark}
  icon={AlertTriangle}
  label="Riskli Yol"
  value={roadmaps.filter((r) => r.risk === "Yüksek").length}
  onClick={() => setActiveKpi("risk")}
/>
          </section>

          {activeKpi && (
  <section
    className={cx(
      "rounded-2xl border p-5",
      isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
    )}
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className={cx("text-sm font-black", isDark ? "text-white" : "text-zinc-900")}>
        KPI Detayları
      </h2>

      <button
        onClick={() => setActiveKpi(null)}
        className="text-xs font-bold text-[#E61A21]"
      >
        Kapat
      </button>
    </div>

    {activeKpi === "roadmaps" && (
      <div className="space-y-3">
        {roadmaps.map((r) => (
          <div
            key={r.id}
            className={cx(
              "rounded-xl border p-3",
              isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-zinc-200 bg-zinc-50"
            )}
          >
            <p className="text-sm font-black">{r.title}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {r.department} · {r.steps?.length || 0} aşama
            </p>
          </div>
        ))}
      </div>
    )}

    {activeKpi === "users" && (
      <div className="space-y-2">
        {roadmaps.flatMap((r) =>
          (r.assignments || []).map((u, i) => (
            <div
              key={i}
              className={cx(
                "flex items-center justify-between rounded-xl border px-3 py-2",
                isDark ? "border-white/[0.08]" : "border-zinc-200"
              )}
            >
              <div>
                <p className="text-xs font-bold">{u.user_name}</p>
                <p className="text-[10px] text-zinc-500">{u.department}</p>
              </div>

              <span className="text-xs font-black text-[#E61A21]">
                %{u.progress}
              </span>
            </div>
          ))
        )}
      </div>
    )}

    {activeKpi === "progress" && (
      <div className="space-y-3">
        {roadmaps.map((r) => (
          <div key={r.id}>
            <div className="flex justify-between text-xs mb-1">
              <span>{r.title}</span>
              <span className="font-bold">%{r.progress}</span>
            </div>

            <div className="h-2 rounded-full bg-zinc-200 dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full bg-[#E61A21]"
                style={{ width: `${r.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )}

    {activeKpi === "risk" && (
      <div className="space-y-3">
        {roadmaps
          .filter((r) => r.risk === "Yüksek")
          .map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
            >
              <p className="text-sm font-black text-red-500">
                {r.title}
              </p>

              <p className="text-xs text-zinc-500 mt-1">
                Risk Seviyesi: {r.risk}
              </p>
            </div>
          ))}
      </div>
    )}
  </section>
)}

          <section
            className={cx(
              "rounded-2xl border p-5",
              isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#E61A21]/10 flex items-center justify-center">
                <Brain size={18} className="text-[#E61A21]" />
              </div>
              <div>
                <h2 className={cx("text-sm font-black", isDark ? "text-white" : "text-zinc-900")}>
                  AI Destekli Gelişim Analizi
                </h2>
                <p className={cx("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>
                  Sistem, departman performansına göre gelişim yolları önerir.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {aiInsights.length === 0 ? (
  <Insight isDark={isDark} text="Henüz AI analizi bulunmuyor." />
) : (
  aiInsights.map((item, index) => (
    <Insight
      key={index}
      isDark={isDark}
      text={item.text}
    />
  ))
)}
            </div>
          </section>

          <section className="grid xl:grid-cols-[1.4fr_1fr] gap-5">
            <div
              className={cx(
                "rounded-2xl border p-5",
                isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
                <div>
                  <h2 className={cx("text-sm font-black", isDark ? "text-white" : "text-zinc-900")}>
                    Roadmap Yönetim Merkezi
                  </h2>
                  <p className={cx("text-xs mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                    Departman, seviye ve risk durumuna göre gelişim yollarını takip et.
                  </p>
                </div>

                <button
  onClick={() => setShowCreate((prev) => !prev)}
  className="flex items-center gap-2 rounded-xl bg-[#E61A21] px-4 py-2 text-xs font-bold text-white"
>
                  <Plus size={14} />
                  Yeni Yol Haritası
                </button>
              </div>

              {showCreate && (
  <div
    className={cx(
      "mb-5 rounded-2xl border p-4",
      isDark ? "border-white/[0.08] bg-white/[0.03]" : "border-zinc-200 bg-zinc-50"
    )}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <input
        value={newRoadmap.title}
        onChange={(e) => setNewRoadmap({ ...newRoadmap, title: e.target.value })}
        placeholder="Yol haritası başlığı..."
        className={cx(
          "rounded-xl border px-3 py-2 text-sm outline-none md:col-span-2",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}
      />

      <select
        value={newRoadmap.department}
        onChange={(e) => setNewRoadmap({ ...newRoadmap, department: e.target.value })}
        className={cx(
          "rounded-xl border px-3 py-2 text-sm outline-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        <option value="IT">IT</option>
        <option value="Satış">Satış</option>
        <option value="Yönetim">Yönetim</option>
        <option value="HR">HR</option>
      </select>

      <select
        value={newRoadmap.level}
        onChange={(e) => setNewRoadmap({ ...newRoadmap, level: e.target.value })}
        className={cx(
          "rounded-xl border px-3 py-2 text-sm outline-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        <option value="Başlangıç">Başlangıç</option>
        <option value="Orta Seviye">Orta Seviye</option>
        <option value="İleri Seviye">İleri Seviye</option>
        <option value="Profesyonel">Profesyonel</option>
      </select>

      <select
        value={newRoadmap.risk}
        onChange={(e) => setNewRoadmap({ ...newRoadmap, risk: e.target.value })}
        className={cx(
          "rounded-xl border px-3 py-2 text-sm outline-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        <option value="Düşük">Düşük Risk</option>
        <option value="Orta">Orta Risk</option>
        <option value="Yüksek">Yüksek Risk</option>
      </select>

      <select
        value={newRoadmap.status}
        onChange={(e) => setNewRoadmap({ ...newRoadmap, status: e.target.value })}
        className={cx(
          "rounded-xl border px-3 py-2 text-sm outline-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        <option value="Aktif">Aktif</option>
        <option value="Takipte">Takipte</option>
        <option value="Pasif">Pasif</option>
      </select>

      <textarea
        value={newRoadmap.ai_note}
        onChange={(e) => setNewRoadmap({ ...newRoadmap, ai_note: e.target.value })}
        placeholder="AI önerisi / analiz notu..."
        rows={2}
        className={cx(
          "rounded-xl border px-3 py-2 text-sm outline-none md:col-span-2 resize-none",
          isDark ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-white border-zinc-200 text-zinc-900"
        )}
      />

      <div
  className={cx(
    "md:col-span-2 rounded-2xl border p-4",
    isDark
      ? "border-white/[0.08] bg-white/[0.03]"
      : "border-zinc-200 bg-white"
  )}
>
  <p
    className={cx(
      "text-xs font-black mb-3",
      isDark ? "text-white" : "text-zinc-900"
    )}
  >
    Gerçek Eğitimleri Seç
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
    {learningItems.map((item) => {
      const checked = newRoadmap.selectedItems.some(
        (x) => x.id === item.id && x.source === item.source
      );

      return (
        <button
          key={`${item.source}-${item.id}`}
          type="button"
          onClick={() => {
            const exists = newRoadmap.selectedItems.some(
              (x) => x.id === item.id && x.source === item.source
            );

            setNewRoadmap({
              ...newRoadmap,
              selectedItems: exists
                ? newRoadmap.selectedItems.filter(
                    (x) =>
                      !(x.id === item.id && x.source === item.source)
                  )
                : [...newRoadmap.selectedItems, item],
            });
          }}
          className={cx(
            "text-left rounded-xl border p-3 transition",
            checked
              ? "border-[#E61A21] bg-[#E61A21]/10"
              : isDark
              ? "border-white/[0.08] hover:bg-white/[0.04]"
              : "border-zinc-200 hover:bg-zinc-50"
          )}
        >
          <p
            className={cx(
              "text-xs font-black",
              isDark ? "text-white" : "text-zinc-900"
            )}
          >
            {item.title}
          </p>

          <p className="text-[10px] text-zinc-500 mt-1">
            {item.source} · {item.category}
          </p>
        </button>
      );
    })}
  </div>
</div>
    </div>

    <div className="flex justify-end gap-2 mt-4">
      <button
        onClick={() => setShowCreate(false)}
        className={cx(
          "rounded-xl px-4 py-2 text-xs font-bold border",
          isDark ? "border-white/[0.08] text-zinc-400" : "border-zinc-200 text-zinc-500"
        )}
      >
        İptal
      </button>

      <button
        onClick={createRoadmap}
        disabled={creating}
        className="rounded-xl bg-[#E61A21] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {creating ? "Oluşturuluyor..." : "Kaydet"}
      </button>
    </div>
  </div>
)}

              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Yol haritası ara..."
                    className={cx(
                      "w-full rounded-xl border pl-9 pr-3 py-2 text-sm outline-none",
                      isDark
                        ? "bg-white/[0.04] border-white/[0.08] text-white"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900"
                    )}
                  />
                </div>

                <div className="relative md:w-48">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={cx(
                      "w-full rounded-xl border pl-9 pr-3 py-2 text-sm outline-none",
                      isDark
                        ? "bg-white/[0.04] border-white/[0.08] text-white"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900"
                    )}
                  >
                    <option value="all">Tüm Departmanlar</option>
                    <option value="IT">IT</option>
                    <option value="Satış">Satış</option>
                    <option value="Yönetim">Yönetim</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {loading ? (
  <p className={cx("text-sm", isDark ? "text-zinc-500" : "text-zinc-400")}>
    Yol haritaları yükleniyor...
  </p>
) : filtered.length === 0 ? (
  <p className={cx("text-sm", isDark ? "text-zinc-500" : "text-zinc-400")}>
    Yol haritası bulunamadı.
  </p>
) : (
  filtered.map((roadmap) => (
                  <button
                    key={roadmap.id}
                    onClick={() => setSelected(roadmap)}
                    className={cx(
                      "w-full text-left rounded-2xl border p-4 transition",
                      selected?.id === roadmap.id
                        ? "border-[#E61A21] bg-[#E61A21]/10"
                        : isDark
                        ? "border-white/[0.08] hover:bg-white/[0.04]"
                        : "border-zinc-200 hover:bg-zinc-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={cx("text-sm font-black", isDark ? "text-white" : "text-zinc-900")}>
                          {roadmap.title}
                        </h3>
                        <p className={cx("text-xs mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
                          {roadmap.department} · {roadmap.level} · {roadmap.users} katılımcı
                        </p>
                      </div>

                      <span
                        className={cx(
                          "text-[10px] font-black px-2 py-1 rounded-lg",
                          roadmap.risk === "Yüksek"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {roadmap.risk}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>İlerleme</span>
                        <span className="font-bold text-[#E61A21]">%{roadmap.progress}</span>
                      </div>
                      <div className={cx("h-2 rounded-full overflow-hidden", isDark ? "bg-white/[0.07]" : "bg-zinc-100")}>
                        <div
                          className="h-full rounded-full bg-[#E61A21]"
                          style={{ width: `${roadmap.progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                  ))
                )}
              </div>
            </div>

            <div
              className={cx(
                "rounded-2xl border p-5",
                isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target size={16} className="text-[#E61A21]" />
                <h2 className={cx("text-sm font-black", isDark ? "text-white" : "text-zinc-900")}>
                  Yol Haritası Detayı
                </h2>
              </div>

              {selected && (
                <>
                  <h3 className={cx("text-base font-black", isDark ? "text-white" : "text-zinc-900")}>
                    {selected.title}
                  </h3>

                  <p className={cx("text-xs mt-2 leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>
                    {selected.aiNote}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Mini isDark={isDark} label="İlerleme" value={`%${selected.progress}`} />
                    <Mini isDark={isDark} label="Katılımcı" value={selected.users} />
                    <Mini isDark={isDark} label="Durum" value={selected.status} />
                  </div>

                  <button
  onClick={() => assignDemoUsers(selected.id)}
  className="mt-4 w-full rounded-xl bg-[#E61A21] px-4 py-2 text-xs font-bold text-white"
>
  Roadmap’i Kullanıcılara Ata
</button>

                  <div className="mt-5 space-y-3">
                    {selected.steps.map((step, index) => (
                      <div
                        key={index}
                        className={cx(
                          "flex items-center gap-3 rounded-xl border px-3 py-3",
                          isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-zinc-200 bg-zinc-50"
                        )}
                      >
                        <div
                          className={cx(
                            "h-8 w-8 rounded-lg flex items-center justify-center",
                            step.done
                              ? "bg-emerald-500/10 text-emerald-500"
                              : step.active
                              ? "bg-[#E61A21]/10 text-[#E61A21]"
                              : "bg-zinc-500/10 text-zinc-400"
                          )}
                        >
                          {step.done ? (
                            <CheckCircle2 size={15} />
                          ) : step.locked ? (
                            <Lock size={15} />
                          ) : (
                            <PlayCircle size={15} />
                          )}
                        </div>

                        <div>
                          <p className={cx("text-xs font-bold", isDark ? "text-white" : "text-zinc-900")}>
                            {step.title}
                          </p>
                          <p className={cx("text-[10px]", isDark ? "text-zinc-500" : "text-zinc-400")}>
                            {step.done ? "Tamamlandı" : step.active ? "Aktif aşama" : "Beklemede"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl bg-[#E61A21]/10 border border-[#E61A21]/20 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-[#E61A21]" />
                      <p className="text-xs font-black text-[#E61A21]">AI Önerisi</p>
                    </div>
                    <p className={cx("text-xs leading-relaxed", isDark ? "text-zinc-300" : "text-zinc-700")}>
                      Bu yol haritasında geciken kullanıcılar için ek görev ve kısa quiz önerilir.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </YoneticiLayout>
  );
}

function Kpi({ label, value, icon: Icon, isDark, onClick }) {
  return (
    <button
  onClick={onClick}
  type="button"
  className={cx(
    "rounded-2xl border p-4 text-left transition hover:scale-[1.01]",
        isDark ? "bg-[#111] border-white/[0.07]" : "bg-white border-zinc-200 shadow-sm"
      )}
    >
      <Icon size={18} className="text-[#E61A21] mb-3" />
      <p className={cx("text-xs", isDark ? "text-zinc-500" : "text-zinc-400")}>{label}</p>
      <p className={cx("text-2xl font-black mt-1", isDark ? "text-white" : "text-zinc-900")}>{value}</p>
    </button>
  );
}

function Insight({ text, isDark }) {
  return (
    <div className={cx("rounded-xl border p-3", isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-zinc-200 bg-zinc-50")}>
      <p className={cx("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-zinc-600")}>{text}</p>
    </div>
  );
}

function Mini({ label, value, isDark }) {
  return (
    <div className={cx("rounded-xl border p-3", isDark ? "border-white/[0.08]" : "border-zinc-200")}>
      <p className={cx("text-[10px]", isDark ? "text-zinc-500" : "text-zinc-400")}>{label}</p>
      <p className={cx("text-sm font-black mt-1", isDark ? "text-white" : "text-zinc-900")}>{value}</p>
    </div>
  );
}