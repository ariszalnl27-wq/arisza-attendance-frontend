export default function EmptyState({ message = 'Tidak ada data.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-400">
      <div className="w-10 h-10 border-2 border-stone-200 rounded-full flex items-center justify-center mb-3">
        <span className="text-stone-300 text-lg">∅</span>
      </div>
      <p className="text-sm">{message}</p>
    </div>
  )
}
