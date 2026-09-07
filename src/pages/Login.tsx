import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Radio,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Login() {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('danilolima45@hotmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        navigate('/')
      } else {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.')
          setIsLoading(false)
          return
        }
        await register(name, email, password)
        setSuccessMessage('Account created successfully! Redirecting...')
        setTimeout(() => navigate('/'), 800)
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err)
      if (msg.includes('Failed to authenticate') || msg.includes('400')) {
        setErrorMessage('Invalid email or password. Please verify your credentials.')
      } else if (msg.includes('already exists') || msg.includes('unique')) {
        setErrorMessage('This email is already registered.')
      } else {
        setErrorMessage(msg || 'Authentication failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0B0F19] relative overflow-hidden px-4 py-8 font-sans">
      {/* Background Subtle Grid / Waveform Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Top Live Demo Badge Shortcut */}
        <div className="flex justify-center mb-6">
          <Link
            to="/demo"
            className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-xs font-semibold text-sky-400 transition-all shadow-md shadow-sky-500/10 hover:scale-105"
          >
            <Activity className="h-3.5 w-3.5 animate-pulse text-sky-400" />
            <span>View Live Demo Simulation</span>
            <span className="text-[10px] bg-sky-400/20 px-1.5 py-0.5 rounded text-sky-300 font-bold uppercase">
              No login required
            </span>
          </Link>
        </div>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#0EA5E9] to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-4 ring-4 ring-sky-500/20 animate-pulse">
            <Radio className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Telemetry Insight
          </h1>
          <p className="text-xs sm:text-sm font-medium text-sky-400 mt-1 uppercase tracking-wider">
            Vehicle Telemetry Verification POC
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm">
            CAN/LIN log ingestion, statistical IQR outlier filtering, and heuristic anomaly
            detection for automotive software verification.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#111827]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Tabs switch */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMessage(null)
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#0EA5E9] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMessage(null)
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#0EA5E9] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success Banners */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Danilo Lima"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-500">Minimum 8 characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials */}
            {mode === 'login' && (
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Pre-configured Demo Credentials:</span>
                </div>
                <p>
                  Username: <span className="text-slate-200">danilolima45@hotmail.com</span>
                </p>
                <p>
                  Password: <span className="text-slate-200">Skip@Pass</span>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#0EA5E9] to-sky-600 hover:from-sky-500 hover:to-sky-600 active:scale-[0.99] transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Direct link to public simulation */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <Link
              to="/demo"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Or explore the Live CAN Simulation Demo &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Portfolio note at bottom */}
        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          Portfolio project — POC based on the GlobalLogic opportunity analysis.
        </p>
      </div>
    </div>
  )
}
