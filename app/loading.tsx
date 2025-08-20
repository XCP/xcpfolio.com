export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-48 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Search skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-xl">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}