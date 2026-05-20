import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis 
} from 'recharts';

export default function Analysis() {
  // بيانات وهمية احترافية تعبر عن تقدم الطالب
  const weeklyData = [
    { name: 'Pzt', saat: 2 },
    { name: 'Sal', saat: 5 },
    { name: 'Çar', saat: 3 },
    { name: 'Per', saat: 8 },
    { name: 'Cum', saat: 4 },
    { name: 'Cmt', saat: 10 },
    { name: 'Paz', saat: 7 },
  ];

  const skillData = [
    { subject: 'SQL', A: 120, full: 150 },
    { subject: 'Python', A: 98, full: 150 },
    { subject: 'Power BI', A: 150, full: 150 },
    { subject: 'Data Analysis', A: 140, full: 150 },
    { subject: 'UI/UX', A: 85, full: 150 },
  ];

  const COLORS = ['#E61A21', '#22c55e', '#3b82f6', '#eab308'];

  return (
    <div className="animate-fadeIn pb-20 text-left">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
          Performans <span className="text-[#E61A21]">Analizi</span>
        </h1>
        <p className="text-zinc-500 font-bold text-[10px] tracking-[0.3em] uppercase">Verilerle gelişimini takip et</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Study Hours Chart (Area Chart) */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl">
          <h3 className="text-white font-black uppercase italic mb-6 text-sm tracking-widest">Haftalık Çalışma Süresi (Saat)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorSaat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E61A21" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E61A21" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', borderRadius: '15px', color: '#fff' }} />
                <Area type="monotone" dataKey="saat" stroke="#E61A21" strokeWidth={4} fillOpacity={1} fill="url(#colorSaat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Skill Radar (Radar Chart) - هاد بيبهر الدكاترة جداً */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-2xl">
          <h3 className="text-white font-black uppercase italic mb-6 text-sm tracking-widest">Yetenek Haritası</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 12 }} />
                <Radar name="Gelişim" dataKey="A" stroke="#E61A21" fill="#E61A21" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Stats Cards (Power BI Style) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox title="Toplam Kredi" value="145" icon="💎" />
          <StatBox title="Bitirme Oranı" value="%82" icon="📈" />
          <StatBox title="Global Sıralama" value="#412" icon="🌍" />
        </div>
      </div>
    </div>
  );
}

function StatBox({ title, value, icon }) {
  return (
    <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-[#E61A21]/50 transition-all">
      <div>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black italic">{value}</p>
      </div>
      <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">{icon}</div>
    </div>
  );
}