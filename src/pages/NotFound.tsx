import { Link } from 'react-router-dom'
import { AlertOctagon, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Page Not Found (404)</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The requested page does not exist or has been relocated within the telemetry platform.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  )
}
