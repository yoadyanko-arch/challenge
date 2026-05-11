export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <span className="font-bold text-indigo-600">Admin Panel</span>
        <a href="/admin/queue" className="text-sm text-gray-500 hover:text-indigo-600">תור</a>
        <a href="/admin/generate" className="text-sm text-gray-500 hover:text-indigo-600">ייצור</a>
        <a href="/feed" className="text-sm text-gray-400 mr-auto">← חזור לפיד</a>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
    </div>
  )
}
