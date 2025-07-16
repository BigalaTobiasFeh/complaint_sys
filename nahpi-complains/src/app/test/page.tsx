export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          NAHPI Complaints System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Test page - If you can see this, the deployment is working!
        </p>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Build Time: {new Date().toISOString()}
          </div>
          <div className="space-x-4">
            <a 
              href="/login" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Student Login
            </a>
            <a 
              href="/admin/login" 
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Admin Login
            </a>
            <a 
              href="/department/login" 
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Department Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
