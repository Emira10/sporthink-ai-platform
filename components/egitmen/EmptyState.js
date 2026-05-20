export default function EmptyState({ message = "Henüz veri yok" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">📭</div>
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
        {message}
      </p>
    </div>
  );
}