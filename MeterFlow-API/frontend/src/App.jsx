import { Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { useAuthStore } from './store/authStore'

function App() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-slate-900 dark:text-white">
              <span>MeterFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <span className="text-slate-500">Hi, {user.name}</span>
                </>
              ) : (
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              MeterFlow
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Usage-based API billing platform for developers. Track usage, apply rate limiting, generate invoices, and much more.
            </p>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] shadow-lg">
              Get Started
            </Link>
          </div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

