export default function MessagesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="lg:col-span-1 bg-gray-300 rounded animate-pulse"></div>
        <div className="lg:col-span-2 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  )
}
