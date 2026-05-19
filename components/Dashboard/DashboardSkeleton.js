export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-8 w-48 animate-pulse bg-gray-200 rounded mb-4"></div>
          <div className="h-5 w-72 animate-pulse bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="h-32 animate-pulse bg-gray-200 rounded-xl"></div>
          <div className="h-32 animate-pulse bg-gray-200 rounded-xl"></div>
          <div className="h-32 animate-pulse bg-gray-200 rounded-xl"></div>
          <div className="h-32 animate-pulse bg-gray-200 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 animate-pulse bg-gray-200 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-8 w-40 animate-pulse bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-24 animate-pulse bg-gray-200 rounded-2xl"></div>
                <div className="h-24 animate-pulse bg-gray-200 rounded-2xl"></div>
                <div className="h-24 animate-pulse bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="h-44 animate-pulse bg-gray-200 rounded-3xl"></div>
            <div className="h-44 animate-pulse bg-gray-200 rounded-3xl"></div>
          </aside>
        </div>
      </div>
    </div>
  )
}
