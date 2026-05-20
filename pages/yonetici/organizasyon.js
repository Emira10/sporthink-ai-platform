import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Users,
  UserPlus,
  Search,
  Network,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Filter,
  Layers3,
  Crown,
  UserCog,
  BriefcaseBusiness,
  ArrowRight,
} from "lucide-react";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

const departments = [
  {
    id: 1,
    name: "İnsan Kaynakları",
    code: "HR",
    manager: "Elif Yılmaz",
    members: 18,
    completion: 72,
    trainings: 6,
    risk: "Orta",
    color: "from-red-600 to-rose-500",
  },
  {
    id: 2,
    name: "Bilgi Teknolojileri",
    code: "IT",
    manager: "Mert Kaya",
    members: 24,
    completion: 91,
    trainings: 9,
    risk: "Düşük",
    color: "from-red-700 to-red-500",
  },
  {
    id: 3,
    name: "Satış & Pazarlama",
    code: "SM",
    manager: "Derya Aksoy",
    members: 31,
    completion: 64,
    trainings: 7,
    risk: "Yüksek",
    color: "from-zinc-700 to-red-600",
  },
  {
    id: 4,
    name: "Operasyon",
    code: "OP",
    manager: "Can Demir",
    members: 15,
    completion: 83,
    trainings: 5,
    risk: "Düşük",
    color: "from-neutral-800 to-red-500",
  },
];

const members = [
  { name: "Ayşe Korkmaz", role: "Takım Lideri", department: "İnsan Kaynakları", status: "Aktif", progress: 78 },
  { name: "Mehmet Arslan", role: "Uzman", department: "Bilgi Teknolojileri", status: "Aktif", progress: 94 },
  { name: "Zeynep Çelik", role: "Çalışan", department: "Satış & Pazarlama", status: "Eğitimde", progress: 59 },
  { name: "Burak Şahin", role: "Departman Yöneticisi", department: "Operasyon", status: "Aktif", progress: 86 },
  { name: "Nazlı Aydın", role: "Çalışan", department: "İnsan Kaynakları", status: "Riskli", progress: 42 },
];

const trainings = [
  { title: "Siber Güvenlik Farkındalığı", department: "Bilgi Teknolojileri", assigned: 24, completed: 22, type: "Zorunlu" },
  { title: "Etkili İletişim", department: "İnsan Kaynakları", assigned: 18, completed: 13, type: "Gelişim" },
  { title: "Satışta İkna Teknikleri", department: "Satış & Pazarlama", assigned: 31, completed: 19, type: "Performans" },
  { title: "Operasyonel Mükemmellik", department: "Operasyon", assigned: 15, completed: 12, type: "Zorunlu" },
];

const roadmapSeed = [
  { phase: "01", title: "Departman Analizi", desc: "Ekip yapısı ve eğitim ihtiyaçları haritalanır.", done: true },
  { phase: "02", title: "Eğitim Eşleştirme", desc: "Departmanlara özel eğitim planları atanır.", done: true },
  { phase: "03", title: "Performans Takibi", desc: "İlerleme ve tamamlama oranları gerçek zamanlı izlenir.", done: false },
  { phase: "04", title: "AI Optimizasyon", desc: "Yapay zeka eksik alanlar için öneriler üretir.", done: false },
];

export default function OrganizasyonUltra() {
  const [departments, setDepartments] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

const [newDepartment, setNewDepartment] = useState({
  name: "",
  code: "",
  manager_name: "",
  description: "",
});

const [showMemberModal, setShowMemberModal] = useState(false);

const [newMember, setNewMember] = useState({
  department_id: "",
  user_name: "",
  user_email: "",
  role: "Çalışan",
});

const [showTrainingModal, setShowTrainingModal] = useState(false);

const [newTraining, setNewTraining] = useState({
  department_id: "",
  training_title: "",
  assigned_count: 0,
  completed_count: 0,
  type: "Zorunlu",
});

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
  fetchOrganizationData();
}, []);

async function fetchOrganizationData() {
  try {
    setLoading(true);

    const res = await fetch("/api/organizasyon/overview");
    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Veriler alınamadı");
      return;
    }

    setDepartments(json.departments || []);
    setMembers(json.members || []);
    setTrainings(json.trainings || []);

    if (json.departments?.length > 0) {
      setSelectedDepartment(json.departments[0]);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
}

  async function createDepartment() {
  if (!newDepartment.name.trim()) {
    alert("Departman adı zorunludur.");
    return;
  }

  try {
    const res = await fetch("/api/organizasyon/departments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newDepartment),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Departman eklenemedi.");
      return;
    }

    await fetchOrganizationData();

    setNewDepartment({
      name: "",
      code: "",
      manager_name: "",
      description: "",
    });

    setShowDepartmentModal(false);
    alert("Departman başarıyla eklendi.");
  } catch (error) {
    console.error(error);
    alert("Departman eklenirken hata oluştu.");
  }
}

async function createMember() {
  if (!newMember.department_id || !newMember.user_name.trim()) {
    alert("Departman ve isim zorunlu.");
    return;
  }

  try {
    const res = await fetch("/api/organizasyon/members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMember),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Çalışan eklenemedi.");
      return;
    }

    await fetchOrganizationData();

    setNewMember({
      department_id: "",
      user_name: "",
      user_email: "",
      role: "Çalışan",
    });

    setShowMemberModal(false);
    alert("Çalışan eklendi.");
  } catch (err) {
    console.error(err);
    alert("Hata oluştu.");
  }
}

async function createTraining() {
  if (!newTraining.department_id || !newTraining.training_title.trim()) {
    alert("Departman ve eğitim adı zorunlu.");
    return;
  }

  try {
    const res = await fetch("/api/organizasyon/trainings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTraining),
    });

    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Eğitim eklenemedi.");
      return;
    }

    await fetchOrganizationData();

    setNewTraining({
      department_id: "",
      training_title: "",
      assigned_count: 0,
      completed_count: 0,
      type: "Zorunlu",
    });

    setShowTrainingModal(false);
    alert("Eğitim eklendi.");
  } catch (err) {
    console.error(err);
    alert("Hata oluştu.");
  }
}

  const totalMembers = members.length;
const totalDepartments = departments.length;
const totalTrainings = trainings.length;

const averageCompletion =
  trainings.length > 0
    ? Math.round(
        trainings.reduce((sum, item) => {
          const assigned = Number(item.assigned_count || 0);
          const completed = Number(item.completed_count || 0);
          return sum + (assigned > 0 ? (completed / assigned) * 100 : 0);
        }, 0) / trainings.length
      )
    : 0;

const highRiskDepartments = 0;

  const filteredEmployees = useMemo(() => {
    return members.filter((employee) => {
      const q = query.toLowerCase();
      return (
        employee.name.toLowerCase().includes(q) ||
        employee.department.toLowerCase().includes(q) ||
        employee.role.toLowerCase().includes(q)
      );
    });
  }, [query]);


  const tabs = [
    { key: "overview", label: "Genel Bakış", icon: BarChart3 },
    { key: "departments", label: "Departmanlar", icon: Building2 },
    { key: "employees", label: "Çalışan Dağılımı", icon: Users },
    { key: "training", label: "Eğitim Dağılımı", icon: GraduationCap },
    { key: "performance", label: "Performans", icon: TrendingUp },
    { key: "ai", label: "AI Analiz", icon: BrainCircuit },
  ];

  return (
  <YoneticiLayout>
    <main className="min-h-screen overflow-hidden bg-[#f7f7f8] text-zinc-950 dark:bg-[#050505] dark:text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(230,26,33,0.24),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(230,26,33,0.12),transparent_35%)]" />
      <div className="fixed inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] bg-[size:54px_54px]" />

      <section className="relative z-10 mx-auto max-w-[1500px] px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-7 flex flex-col gap-5 rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 shadow-[0_0_25px_rgba(0,0,0,0.08)] dark:shadow-[0_0_55px_rgba(230,26,33,0.12)] backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-red-200">
              <Sparkles size={15} className="text-red-500" />
              Organizasyon Kontrol Merkezi
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Şirket Yapısı, <span className="text-red-500">Eğitim Akışı</span> ve AI Performans Haritası
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-zinc-400 sm:text-base">
              Departmanları, çalışan dağılımını, eğitim atamalarını ve performans risklerini tek panelden yönetin.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
  type="button"
  onClick={() => setShowDepartmentModal(true)}
  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_0_35px_rgba(230,26,33,0.34)] transition hover:scale-[1.02]"
>
  <Plus size={18} /> Yeni Departman
</button>
          </div>
        </header>

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <KpiCard icon={Users} title="Toplam Çalışan" value={totalMembers} sub="Aktif organizasyon üyesi" />

  <KpiCard icon={Building2} title="Departman" value={totalDepartments} sub="Tanımlı iş birimi" />

  <KpiCard icon={GraduationCap} title="Aktif Eğitim" value={totalTrainings} sub="Departman bazlı atama" />

  <KpiCard
    icon={TrendingUp}
    title="Ortalama İlerleme"
    value={`%${averageCompletion}`}
    sub={`${highRiskDepartments} yüksek riskli birim`}
    danger={highRiskDepartments > 0}
  />
</div>

        <nav className="mb-7 flex gap-3 overflow-x-auto rounded-[1.7rem] border border-white/10 bg-black/35 p-2 backdrop-blur-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                  active
                    ? "bg-gradient-to-r from-red-700 to-red-500 text-white shadow-[0_0_28px_rgba(230,26,33,0.32)]"
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={17} /> {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <OrganizationTree selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} />
            {selectedDepartment && <DepartmentFocus department={selectedDepartment} />}
            <Roadmap />
            <AIInsight />
          </div>
        )}

        {activeTab === "departments" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {departments.map((department) => (
              <DepartmentCard key={department.id} department={department} onSelect={() => setSelectedDepartment(department)} />
            ))}
          </div>
        )}

        {activeTab === "employees" && (
          <EmployeesPanel
  query={query}
  setQuery={setQuery}
  employees={filteredEmployees}
  setShowMemberModal={setShowMemberModal}
/>
        )}

        {activeTab === "training" && (
  <TrainingPanel
    trainings={trainings}
    setShowTrainingModal={setShowTrainingModal}
  />
)}

        {activeTab === "performance" && (
  <PerformancePanel departments={departments} trainings={trainings} />
)}

        {activeTab === "ai" && (
  <AIAnalysisPanel
    departments={departments}
    members={members}
    trainings={trainings}
  />
)}
      </section>
      {showDepartmentModal && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
    <div className="w-full max-w-lg rounded-[2rem] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl dark:border-white/10 dark:bg-[#09090b] dark:text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Yeni Departman</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            Organizasyon yapısına gerçek bir departman ekle.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDepartmentModal(false)}
          className="rounded-xl bg-zinc-100 px-3 py-2 font-black text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <input
          value={newDepartment.name}
          onChange={(e) =>
            setNewDepartment({ ...newDepartment, name: e.target.value })
          }
          placeholder="Departman Adı"
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-bold outline-none focus:border-red-500 dark:border-white/10 dark:bg-black/40"
        />

        <input
          value={newDepartment.code}
          onChange={(e) =>
            setNewDepartment({ ...newDepartment, code: e.target.value })
          }
          placeholder="Kod: HR / IT / OP"
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-bold outline-none focus:border-red-500 dark:border-white/10 dark:bg-black/40"
        />

        <input
          value={newDepartment.manager_name}
          onChange={(e) =>
            setNewDepartment({
              ...newDepartment,
              manager_name: e.target.value,
            })
          }
          placeholder="Departman Yöneticisi"
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-bold outline-none focus:border-red-500 dark:border-white/10 dark:bg-black/40"
        />

        <textarea
          value={newDepartment.description}
          onChange={(e) =>
            setNewDepartment({
              ...newDepartment,
              description: e.target.value,
            })
          }
          placeholder="Açıklama"
          rows={4}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-bold outline-none focus:border-red-500 dark:border-white/10 dark:bg-black/40"
        />

        <button
          type="button"
          onClick={createDepartment}
          className="w-full rounded-2xl bg-gradient-to-r from-red-700 to-red-500 py-4 text-sm font-black text-white shadow-[0_0_35px_rgba(230,26,33,0.35)]"
        >
          Departmanı Kaydet
        </button>
      </div>
    </div>
  </div>
)}

{showMemberModal && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
    <div className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl dark:border-white/10 dark:bg-[#09090b] dark:text-white">
      
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black">Çalışan Ekle</h2>
        <button onClick={() => setShowMemberModal(false)}>✕</button>
      </div>

      <select
        value={newMember.department_id}
        onChange={(e) =>
          setNewMember({ ...newMember, department_id: e.target.value })
        }
        className="w-full mb-3 p-3 rounded-xl border"
      >
        <option value="">Departman seç</option>
        {departments.map((dep) => (
          <option key={dep.id} value={dep.id}>
            {dep.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Ad Soyad"
        value={newMember.user_name}
        onChange={(e) =>
          setNewMember({ ...newMember, user_name: e.target.value })
        }
        className="w-full mb-3 p-3 rounded-xl border"
      />

      <input
        placeholder="Email"
        value={newMember.user_email}
        onChange={(e) =>
          setNewMember({ ...newMember, user_email: e.target.value })
        }
        className="w-full mb-3 p-3 rounded-xl border"
      />

      <button
        onClick={createMember}
        className="w-full bg-red-600 text-white py-3 rounded-xl font-black"
      >
        Kaydet
      </button>
    </div>
  </div>
)}

{showTrainingModal && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
    <div className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-2xl dark:border-white/10 dark:bg-[#09090b] dark:text-white">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black">Eğitim Ata</h2>
        <button onClick={() => setShowTrainingModal(false)}>✕</button>
      </div>

      <select
        value={newTraining.department_id}
        onChange={(e) => setNewTraining({ ...newTraining, department_id: e.target.value })}
        className="w-full mb-3 p-3 rounded-xl border dark:bg-black/40"
      >
        <option value="">Departman seç</option>
        {departments.map((dep) => (
          <option key={dep.id} value={dep.id}>{dep.name}</option>
        ))}
      </select>

      <input
        placeholder="Eğitim Adı"
        value={newTraining.training_title}
        onChange={(e) => setNewTraining({ ...newTraining, training_title: e.target.value })}
        className="w-full mb-3 p-3 rounded-xl border dark:bg-black/40"
      />

      <input
        type="number"
        placeholder="Atanan kişi sayısı"
        value={newTraining.assigned_count}
        onChange={(e) => setNewTraining({ ...newTraining, assigned_count: e.target.value })}
        className="w-full mb-3 p-3 rounded-xl border dark:bg-black/40"
      />

      <button
        onClick={createTraining}
        className="w-full bg-red-600 text-white py-3 rounded-xl font-black"
      >
        Kaydet
      </button>
    </div>
  </div>
)}
    </main>
    </YoneticiLayout>
  );
}

function KpiCard({ icon: Icon, title, value, sub, danger }) {
  return (
    <div className="group rounded-[1.7rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-5 shadow-[0_0_25px_rgba(0,0,0,0.08)] dark:shadow-[0_0_35px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-500/40 hover:bg-red-500/5 dark:hover:bg-red-500/10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-500 shadow-[0_0_25px_rgba(230,26,33,0.18)]">
          <Icon size={22} />
        </div>
        <MoreHorizontal className="text-zinc-600 group-hover:text-red-400" size={20} />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.23em] text-zinc-500">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
      <p className={`mt-2 text-sm font-semibold ${danger ? "text-red-400" : "text-zinc-500"}`}>{sub}</p>
    </div>
  );
}

function OrganizationTree({ selectedDepartment, setSelectedDepartment }) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 backdrop-blur-2xl xl:row-span-2">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-black">
            <Network className="text-red-500" /> Organizational Structure
          </h2>
          <p className="mt-2 text-sm font-semibold text-zinc-500">Şirket hiyerarşisini ve departman bağlantılarını görsel olarak izleyin.</p>
        </div>
      </div>

      <div className="relative rounded-[1.7rem] border border-white/10 bg-black/30 p-5">
        <div className="mx-auto mb-8 w-full max-w-md rounded-3xl border border-red-500/40 bg-gradient-to-br from-red-700/35 to-black p-5 text-center shadow-[0_0_35px_rgba(230,26,33,0.18)]">
          <Crown className="mx-auto mb-3 text-red-400" size={30} />
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-200">SporThink</p>
          <h3 className="mt-1 text-xl font-black">Ana Organizasyon</h3>
          <p className="mt-1 text-xs font-semibold text-zinc-500">Yönetim merkezi</p>
        </div>

        <div className="mx-auto mb-8 h-10 w-px bg-gradient-to-b from-red-500 to-transparent" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {departments.map((department) => {
            const active = selectedDepartment?.id === department.id;
            return (
              <button
                key={department.id}
                type="button"
                onClick={() => setSelectedDepartment(department)}
                className={`rounded-3xl border p-5 text-left transition-all ${
                  active
                    ? "border-red-500 bg-red-500/15 shadow-[0_0_30px_rgba(230,26,33,0.22)]"
                    : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.035] hover:border-red-500/30 hover:bg-red-500/10"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${department.color} font-black text-white`}>
                    {department.code}
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {department.members} kişi
                  </span>
                </div>
                <h4 className="text-lg font-black">{department.name}</h4>
                <p className="mt-1 text-xs font-semibold text-zinc-500">Yönetici: {department.manager}</p>
                <ProgressBar value={department.completion} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DepartmentFocus({ department }) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-red-400">Seçili Departman</p>
          <h2 className="mt-2 text-3xl font-black">{department.name}</h2>
          <p className="mt-2 text-sm font-semibold text-zinc-500">Departman yöneticisi: {department.manager}</p>
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${department.color} text-xl font-black shadow-[0_0_30px_rgba(230,26,33,0.24)]`}>
          {department.code}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniMetric title="Üye" value={department.members} icon={Users} />
        <MiniMetric title="Eğitim" value={department.trainings} icon={GraduationCap} />
        <MiniMetric title="Risk" value={department.risk} icon={AlertTriangle} danger={department.risk === "Yüksek"} />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
        <div className="mb-3 flex items-center justify-between text-sm font-black">
          <span>Departman Eğitim Tamamlama</span>
          <span className="text-red-400">%{department.completion}</span>
        </div>
        <ProgressBar value={department.completion} big />
      </div>
    </div>
  );
}

function MiniMetric({ icon: Icon, title, value, danger }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
      <Icon className={danger ? "text-red-500" : "text-red-400"} size={20} />
      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">{title}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function DepartmentCard({ department, onSelect }) {
  return (
    <button onClick={onSelect} className="rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 text-left backdrop-blur-2xl transition hover:-translate-y-1 hover:border-red-500/40 hover:bg-red-500/5 dark:hover:bg-red-500/10 shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_35px_rgba(230,26,33,0.14)]">
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${department.color} text-lg font-black`}>{department.code}</div>
        <ArrowRight className="text-zinc-600" />
      </div>
      <h3 className="text-xl font-black">{department.name}</h3>
      <p className="mt-2 text-sm font-semibold text-zinc-500">{department.manager}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMetric title="Çalışan" value={department.members} icon={Users} />
        <MiniMetric title="İlerleme" value={`%${department.completion}`} icon={TrendingUp} />
      </div>
    </button>
  );
}

function EmployeesPanel({ query, setQuery, employees, setShowMemberModal }) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between">
            <div> <h2 className="text-2xl font-black">Çalışan Dağılımı</h2>
            <p className="mt-2 text-sm font-semibold text-zinc-500">Kullanıcıların departman, rol ve eğitim durumlarını yönetin.</p>
        </div>
    </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
            <Search size={18} className="text-zinc-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Çalışan ara..." className="bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-600" />
          </div>
          <button
  onClick={() => setShowMemberModal(true)}
  className="rounded-2xl bg-red-600 px-4 py-3 font-black"
>
  <UserPlus size={18} />
</button>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-black/45 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="p-4">Çalışan</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Departman</th>
              <th className="p-4">Durum</th>
              <th className="p-4">İlerleme</th>
            </tr>
          </thead>
          <tbody>
            {members.map((employee) => (
              <tr key={employee.name} className="border-t border-white/10 bg-white/[0.02] transition hover:bg-red-500/5">
                <td className="p-4 font-black">{employee.user_name}</td>
                <td className="p-4 text-zinc-400">{employee.role}</td>
                <td className="p-4 text-zinc-400">{employee.department_id}</td>
                <td className="p-4"><StatusBadge status={employee.status} /></td>
                <td className="p-4"><ProgressBar value={employee.progress} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrainingPanel({ trainings = [], setShowTrainingModal }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-black">Eğitim Dağılımı</h2>

        <button
          type="button"
          onClick={() => setShowTrainingModal(true)}
          className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white"
        >
          <Plus size={18} />
        </button>
      </div>

      {trainings.length === 0 ? (
        <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 text-sm font-bold text-zinc-500 dark:border-white/10 dark:bg-white/[0.035]">
          Henüz eğitim atanmadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {trainings.map((training) => {
            const assigned = Number(training.assigned_count || 0);
            const completed = Number(training.completed_count || 0);
            const ratio = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

            return (
              <div
                key={training.id}
                className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_0_30px_rgba(0,0,0,0.25)]"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
                      {training.type || "Zorunlu"}
                    </span>

                    <h3 className="mt-4 text-2xl font-black">
                      {training.training_title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-zinc-500">
                      Departman ID: {training.department_id}
                    </p>
                  </div>

                  <GraduationCap className="text-red-500" size={34} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <MiniMetric title="Atanan" value={assigned} icon={Users} />
                  <MiniMetric title="Tamamlanan" value={completed} icon={CheckCircle2} />
                  <MiniMetric title="Başarı" value={`%${ratio}`} icon={Trophy} />
                </div>

                <div className="mt-5">
                  <ProgressBar value={ratio} big />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PerformancePanel({ departments = [], trainings = [] }) {
  function getDepartmentRate(departmentId) {
    const depTrainings = trainings.filter((t) => t.department_id === departmentId);

    const assigned = depTrainings.reduce(
      (sum, t) => sum + Number(t.assigned_count || 0),
      0
    );

    const completed = depTrainings.reduce(
      (sum, t) => sum + Number(t.completed_count || 0),
      0
    );

    return assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
        <h2 className="text-2xl font-black">Department Performance</h2>
        <p className="mt-2 text-sm font-semibold text-zinc-500">
          Eğitim tamamlama oranları gerçek verilerden hesaplanır.
        </p>

        <div className="mt-6 space-y-4">
          {departments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-400/30 p-5 text-sm font-bold text-zinc-500">
              Henüz departman yok.
            </p>
          ) : (
            departments.map((department) => {
              const rate = getDepartmentRate(department.id);

              return (
                <div key={department.id} className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-black">{department.name}</span>
                    <span className="font-black text-red-400">%{rate}</span>
                  </div>
                  <ProgressBar value={rate} />
                </div>
              );
            })
          )}
        </div>
      </div>

      <AIInsight large departments={departments} trainings={trainings} />
    </div>
  );
}

function AIAnalysisPanel({ departments = [], members = [], trainings = [] }) {
  const totalMembers = members.length;
  const totalTrainings = trainings.length;

  const riskyDepartments = departments.filter((dep) => {
    const depTrainings = trainings.filter((t) => t.department_id === dep.id);

    const assigned = depTrainings.reduce(
      (sum, t) => sum + Number(t.assigned_count || 0),
      0
    );

    const completed = depTrainings.reduce(
      (sum, t) => sum + Number(t.completed_count || 0),
      0
    );

    const rate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

    return assigned > 0 && rate < 60;
  });

  const insights = [
    {
      title: "Toplam Organizasyon Görünümü",
      desc: `${departments.length} departman, ${totalMembers} çalışan ve ${totalTrainings} eğitim kaydı sistemde aktif olarak izleniyor.`,
      icon: BrainCircuit,
    },
    {
      title: "Riskli Departman Analizi",
      desc:
        riskyDepartments.length > 0
          ? `${riskyDepartments.length} departmanda eğitim tamamlama oranı düşük. Bu birimler için ek eğitim planı öneriliyor.`
          : "Şu anda kritik seviyede düşük performanslı departman görünmüyor.",
      icon: AlertTriangle,
    },
    {
      title: "AI Önerisi",
      desc: "Tamamlama oranı düşük departmanlara mikro eğitim, kısa quiz ve eğitmen takibi eklenmesi önerilir.",
      icon: Trophy,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {insights.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-500/10 to-white/[0.03] p-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(230,26,33,0.12)]"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-black/40 text-red-500">
              <Icon size={27} />
            </div>

            <h3 className="text-xl font-black">{item.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-7 text-zinc-400">
              {item.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Roadmap() {
  return (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.035] p-6 shadow-[0_0_20px_rgba(0,0,0,0.06)] dark:shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <h2 className="flex items-center gap-3 text-2xl font-black"><Layers3 className="text-red-500" /> Organizasyon Yol Haritası</h2>
      <div className="mt-6 space-y-4">
        {roadmapSeed.map((step) => (
          <div key={step.phase} className="flex gap-4 rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black ${step.done ? "bg-red-600 text-white" : "bg-white/5 text-zinc-500"}`}>{step.phase}</div>
            <div>
              <h3 className="font-black">{step.title}</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsight({ large, departments = [], trainings = [] }) {
  return (
    <div className={`rounded-[2rem] border border-red-500/20 bg-gradient-to-br from-red-500/10 via-white/[0.035] to-black p-6 backdrop-blur-2xl ${large ? "min-h-[520px]" : ""}`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 shadow-[0_0_25px_rgba(230,26,33,0.2)]">
          <BrainCircuit size={30} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-red-300">AI Insight</p>
          <h2 className="text-2xl font-black">Akıllı Organizasyon Önerisi</h2>
        </div>
      </div>
      <p className="text-sm font-semibold leading-7 text-zinc-400">
        Satış & Pazarlama departmanında eğitim tamamlama oranı diğer birimlere göre düşük. AI, bu departmana haftalık mikro eğitimler, kısa quizler ve performans odaklı görevler atanmasını öneriyor.
      </p>
      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">Önerilen Aksiyon</p>
        <div className="space-y-3">
          {[
            "Satış ekibine 3 yeni görev ata",
            "Eğitmen bildirimleri oluştur",
            "Riskli kullanıcıları takip listesine ekle",
          ].map((text) => (
            <div key={text} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
              <CheckCircle2 className="text-red-500" size={18} /> {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = status === "Aktif" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : status === "Riskli" ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  return <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${cls}`}>{status}</span>;
}

function ProgressBar({ value, big }) {
  return (
    <div className={`mt-3 overflow-hidden rounded-full bg-white/10 ${big ? "h-3" : "h-2"}`}>
      <div className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400 shadow-[0_0_18px_rgba(230,26,33,0.45)]" style={{ width: `${value}%` }} />
    </div>
  );
}
