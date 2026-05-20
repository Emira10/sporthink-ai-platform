import KullaniciLayout from '../components/KullaniciLayout';

export default function AdminPage() {
  return (
    <KullaniciLayout pageTitle="Admin Panel">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* كروت الإحصائيات التي كانت في ملف الأدمن */}
        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/5">
          <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">Toplam Öğrenci</p>
          <p className="text-3xl font-black italic">1,240</p>
        </div>
        {/* ... أضيفي باقي الكروت هنا */}
      </div>

      <section className="rounded-[2.5rem] border border-white/5 p-8 bg-white/[0.02]">
        <h2 className="text-xl font-black uppercase italic mb-8">Kurs Yönetimi</h2>
        {/* الجداول الخاصة بالأدمن */}
        <table className="w-full text-left text-xs font-bold">
           <thead className="text-zinc-500 border-b border-white/5">
             <tr><th>Kurs Adı</th><th>Kategori</th><th>Durum</th></tr>
           </thead>
           <tbody>
             <tr className="border-b border-white/5"><td className="py-4">Power BI Dashboard</td><td className="text-[#E61A21]">Data</td><td>Yayında</td></tr>
           </tbody>
        </table>
      </section>
    </KullaniciLayout>
  );
}