export default function MaintenanceLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-300 rounded animate-pulse"></div>
        ))}
      </div>

      <div className="h-20 bg-gray-300 rounded animate-pulse"></div>

      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-300 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}
