import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  AlertTriangle,
  Percent,
  Clock,
  UploadCloud,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Radio,
  ExternalLink,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { listAnalises, processLogPipeline } from '@/services/analises'
import type { AnaliseRecord } from '@/types/telemetry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analises, setAnalises] = useState<AnaliseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [runningDemo, setRunningDemo] = useState(false)

  const loadData = async () => {
    try {
      const data = await listAnalises(1, 50)
      setAnalises(data)
    } catch (err) {
      console.error('Failed to load analyses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Real-time synchronization on analises collection
  useRealtime<AnaliseRecord>('analises', (e) => {
    if (e.action === 'create') {
      setAnalises((prev) => [e.record, ...prev.filter((r) => r.id !== e.record.id)])
    } else if (e.action === 'update') {
      setAnalises((prev) => prev.map((r) => (r.id === e.record.id ? e.record : r)))
    } else if (e.action === 'delete') {
      setAnalises((prev) => prev.filter((r) => r.id !== e.record.id))
    }
  })

  // Quick launch demo dataset
  const handleRunDemo = async () => {
    try {
      setRunningDemo(true)
      toast({
        title: 'Starting Demo Pipeline',
        description: 'Processing CAN telemetry frames with IQR filter...',
      })

      const res = await processLogPipeline({
        is_demo: true,
        nome: 'Demo Analysis — Vehicle Telemetry (CAN Bus 1)',
        iqr_multiplier: 2.5,
        gerar_relatorio: true,
      })

      if (res && res.analise_id) {
        toast({
          title: 'Verification Completed',
          description: `${res.anomalias_detectadas} anomalies detected in ${res.tempo_processamento_s}s.`,
        })
        navigate(`/analises/${res.analise_id}`)
      }
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error running demo dataset',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRunningDemo(false)
    }
  }

  // Derive stats
  const stats = useMemo(() => {
    const totalLogs = analises.length
    let totalAnomalies = 0
    let totalTime = 0
    let totalRows = 0

    analises.forEach((item) => {
      const anomCount = item.anomalias?.length || 0
      totalAnomalies += anomCount
      totalTime += item.tempo_processamento_s || 0
      totalRows += item.resumo_limpeza?.linhas_originais || 1000
    })

    const avgRate = totalRows > 0 ? ((totalAnomalies / totalRows) * 100).toFixed(2) : '0.00'
    const avgTime = totalLogs > 0 ? (totalTime / totalLogs).toFixed(1) : '0.0'

    return {
      totalLogs,
      totalAnomalies,
      anomalyRate: `${avgRate}%`,
      processingTime: `${avgTime}s`,
    }
  }, [analises])

  // Chart data: last 7 runs
  const chartData = useMemo(() => {
    const runs = [...analises]
      .reverse()
      .slice(-7)
      .map((item, idx) => ({
        name: `Run #${idx + 1}`,
        anomalias: item.anomalias?.length || 0,
        linhas: item.resumo_limpeza?.linhas_limpas || 1000,
        precisao: Math.round((item.precisao_modelo || 0.85) * 100),
      }))

    if (runs.length === 0) {
      return [
        { name: 'Run #1', anomalias: 3, precisao: 87 },
        { name: 'Run #2', anomalias: 4, precisao: 89 },
        { name: 'Run #3', anomalias: 2, precisao: 88 },
        { name: 'Run #4', anomalias: 5, precisao: 91 },
      ]
    }
    return runs
  }, [analises])

  const firstName = user?.name ? user.name.split(' ')[0] : 'Engineer'

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Welcome, {firstName}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Here is your vehicle telemetry software verification summary.
          </p>
        </div>

        {/* Quick actions top banner */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload New Log</span>
          </button>
          <button
            onClick={handleRunDemo}
            disabled={runningDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Play className={`h-4 w-4 text-[#0EA5E9] ${runningDemo ? 'animate-spin' : ''}`} />
            <span>{runningDemo ? 'Processing Demo...' : 'Run Demo Pipeline'}</span>
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-all"
            title="Open Live Simulation Stream"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Live Simulation</span>
            <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Logs Analyzed
            </span>
            <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center text-[#0EA5E9]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {loading ? '...' : stats.totalLogs}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Active ETL Pipeline</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Anomalies Detected
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#F59E0B]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {loading ? '...' : stats.totalAnomalies}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-medium">
            <Cpu className="h-3.5 w-3.5" />
            <span>Heuristic Classifier</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Anomaly Rate
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-[#EF4444]">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {loading ? '...' : stats.anomalyRate}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
            <span>2.5x IQR Filter</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Processing Time
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#22C55E]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {loading ? '...' : stats.processingTime}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <span>Fast Software Validation</span>
          </div>
        </div>
      </div>

      {/* Area Chart: Historical anomalies in runs */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Anomalies Trend in Recent Runs</h2>
            <p className="text-xs text-[#64748B]">
              Trend of signal spikes and envelope deviations identified across analyzed CAN/LIN
              buses
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
              <span>Anomalies</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAnomalias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                labelStyle={{ fontWeight: 'bold', color: '#38BDF8' }}
              />
              <Area
                type="monotone"
                dataKey="anomalias"
                stroke="#0EA5E9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAnomalias)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Recent Analyses</h2>
            <p className="text-xs text-[#64748B]">
              Latest software verification runs on the platform
            </p>
          </div>
          <button
            onClick={() => navigate('/analises')}
            className="flex items-center gap-1 text-xs font-semibold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-5">File / Run Name</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Anomalies</th>
                <th className="py-3 px-5">Time (s)</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {analises.slice(0, 5).map((run) => {
                const anomCount = run.anomalias?.length || 0
                const hasAnomalies = anomCount > 0
                const formattedDate = new Date(run.criado).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <tr
                    key={run.id}
                    onClick={() => navigate(`/analises/${run.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0">
                          <Radio className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-[#0EA5E9] transition-colors truncate max-w-xs">
                          {run.nome}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 tabular-nums">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-5 tabular-nums">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          hasAnomalies
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        }`}
                      >
                        {anomCount} anomal{anomCount === 1 ? 'y' : 'ies'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 tabular-nums">
                      {run.tempo_processamento_s}s
                    </td>
                    <td className="py-3.5 px-5">
                      {run.status === 'concluida' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Processed
                        </span>
                      ) : run.status === 'processando' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3 animate-spin text-sky-600" />
                          Processing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <AlertCircle className="h-3 w-3 text-rose-600" />
                          Error
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="text-xs font-semibold text-[#0EA5E9] group-hover:translate-x-1 inline-flex items-center transition-transform">
                        Details &rarr;
                      </span>
                    </td>
                  </tr>
                )
              })}

              {analises.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No analyses found yet. Click &quot;Run Demo Pipeline&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
