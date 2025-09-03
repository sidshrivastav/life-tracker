'use client'

export default function Dashboard() {

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your nutrition and calorie tracking</p>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          href="/dashboard/calorie"
          className="bg-white hover:bg-gray-50 rounded-lg shadow p-6 transition-colors duration-200 border border-gray-200 hover:border-orange-300"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-md flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="ml-4 text-lg font-medium text-gray-900">Calorie Tracker</h3>
          </div>
          <p className="text-gray-600">Track your daily calorie intake by meal with Food DB integration</p>
        </a>
      </div>
    </div>
  )
}