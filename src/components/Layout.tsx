import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  UploadCloud,
  Activity,
  FileText,
  LogOut,
  Menu,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/upload', label: 'Upload Logs', icon: UploadCloud },
  { path: '/analises', label: 'Analyses', icon: Activity },
  { path: '/relatorios', label: 'Reports', icon: FileText },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get user initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A] flex flex-col lg:flex-row font-sans">
      {/* Desktop Sidebar (≥ 1025px) */}
      <aside className="hidden lg:flex w-64 bg-[#0F172A] text-slate-200 flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30 shadow-xl border-r border-slate-800">
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0EA5E9] to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  Telemetry Insight
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-sky-400">
                  Vehicle Telemetry Verification POC
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border-l-4 border-sky-400 font-semibold pl-3'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-sky-400' : 'text-slate-400',
                    )}
                  />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}

            {/* Public Live Demo shortcut */}
            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <NavLink
                to="/demo"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Public Live Simulation</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5" />
              </NavLink>
            </div>
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-sky-400/30 shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Vehicle Engineer'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Topbar for Tablet & Mobile (< 1025px) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-sky-400 animate-pulse" />
            <span className="font-bold text-sm tracking-tight">Telemetry Insight</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/demo"
            className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-md"
          >
            Live Demo
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Slide-in Drawer for Tablet / Mobile Navigation */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-72 bg-[#0F172A] text-white p-5 flex flex-col justify-between shadow-2xl z-10 border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">Telemetry Insight</h2>
                    <p className="text-[10px] text-sky-400 uppercase">Verification POC</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-5 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path)
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-sky-500/20 text-sky-400 font-semibold border-l-4 border-sky-400'
                          : 'text-slate-300 hover:bg-slate-800',
                      )}
                    >
                      <Icon className="h-4 w-4 text-sky-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}

                <div className="pt-2">
                  <NavLink
                    to="/demo"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 mt-2"
                  >
                    <span>Public Live Demo</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </NavLink>
                </div>
              </nav>
            </div>

            {/* Profile Drawer footer */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Vehicle Engineer'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-lg hover:bg-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-w-0 flex flex-col pb-16 lg:pb-8">
        <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (< 641px) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F172A] border-t border-slate-800 flex items-center justify-around h-14 px-2 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 relative text-[11px] font-medium transition-colors',
                isActive ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {isActive && (
                <span className="absolute top-0.5 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              )}
              <Icon className="h-4 w-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
