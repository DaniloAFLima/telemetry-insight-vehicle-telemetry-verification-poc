import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  GitCompare,
  Clock,
  Layers,
  AlertTriangle,
  Award,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Bot,
  Info,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { getAnaliseById } from '@/services/analises'
import type { AnaliseRecord } from '@/types/telemetry'
import { toast } from '@/hooks/use-toast'

export default function AnaliseCompare() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const idA = searchParams.get('a')
  const idB = searchParams.get('b')

  const [analiseA, setAnaliseA] = useState<AnaliseRecord | null>(null)
  const [analiseB, setAnaliseB] = useState<AnaliseRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBoth() {
      if (!idA || !idB) {
        setLoading(false)
        return
      }
      try {
        const [resA, resB] = await Promise.all([getAnaliseById(idA), getAnaliseById(idB)])
        setAnaliseA(resA)
        setAnaliseB(resB)
      } catch (err) {
        console.error('Failed to load comparison analyses:', err)
        toast({
          title: 'Comparison failed',
          description: 'Unable to load one or both analysis runs for comparison.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadBoth()
  }, [idA, idB])

  // Dual time-series overlay dataset aligned by index/step
  const overlayTimeSeries = useMemo(() => {
    if (!analiseA?.dados_serie_temporal || !analiseB?.dados_serie_temporal) return []
    const ptsA = analiseA.dados_serie_temporal
    const ptsB = analiseB.dados_serie_temporal
    const maxLen = Math.max(ptsA.length, ptsB.length)

    const merged = []
    for (let i = 0; i < maxLen; i++) {
      const pA = ptsA[i]
      const pB = ptsB[i]
      merged.push({
        tempo: pA?.tempo || pB?.tempo || `+${(i * 0.1).toFixed(1)}s`,
        tensaoA: pA ? pA.tensao : null,
        anomaliaA: pA ? pA.anomalia : false,
        tipoA: pA?.tipo_anomalia,
        tensaoB: pB ? pB.tensao : null,
        anomaliaB: pB ? pB.anomalia : false,
        tipoB: pB?.tipo_anomalia,
      })
    }
    return merged
  }, [analiseA, analiseB])

  // Grouped anomaly distribution data
  const anomalyDistribution = useMemo(() => {
    if (!analiseA || !analiseB) return []
    const countA: Record<string, number> = {}
    const countB: Record<string, number> = {}

    ;(analiseA.anomalias || []).forEach((a) => {
      countA[a.tipo] = (countA[a.tipo] || 0) + 1
    })
    ;(analiseB.anomalias || []).forEach((b) => {
      countB[b.tipo] = (countB[b.tipo] || 0) + 1
    })

    const allTypes = Array.from(new Set([...Object.keys(countA), ...Object.keys(countB)]))
    if (allTypes.length === 0) {
      return [{ type: 'None Detected', RunA: 0, RunB: 0 }]
    }

    return allTypes.map((type) => ({
      type,
      RunA: countA[type] || 0,
      RunB: countB[type] || 0,
    }))
  }, [analiseA, analiseB])

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <GitCompare className="h-8 w-8 animate-spin text-[#0EA5E9]" />
        <p className="text-sm font-medium">Aligning telemetry traces for comparison...</p>
      </div>
    )
  }

  if (!analiseA || !analiseB) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Select Two Analyses to Compare</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose two verification runs from the Analyses list using the comparison checkboxes.
          </p>
        </div>
        <button
          onClick={() => navigate('/analises')}
          className="px-4 py-2 rounded-xl bg-[#0EA5E9] text-white text-xs font-bold"
        >
          Go to Analyses
        </button>
      </div>
    )
  }

  const anomsA = analiseA.anomalias?.length || 0
  const anomsB = analiseB.anomalias?.length || 0
  const framesA = analiseA.resumo_limpeza?.linhas_limpas || 1200
  const framesB = analiseB.resumo_limpeza?.linhas_limpas || 1200
  const rateA = ((anomsA / Math.max(framesA, 1)) * 100).toFixed(2)
  const rateB = ((anomsB / Math.max(framesB, 1)) * 100).toFixed(2)

  return (
    <div className="space-y-8">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/analises')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Analyses</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Side-by-Side Comparison Mode
        </span>
      </div>

      {/* Header with Run A vs Run B Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Run A Header */}
        <div className="bg-white p-5 rounded-2xl border-2 border-sky-400/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Run A (Primary Baseline)
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date(analiseA.criado).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{analiseA.nome}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {analiseA.resumo_limpeza?.protocolo_detectado || 'CAN 2.0B'} • ID:{' '}
            {analiseA.id.slice(0, 8)}...
          </p>
          <div className="mt-3">
            <Link
              to={`/analises/${analiseA.id}`}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Open Full Detail View →
            </Link>
          </div>
        </div>

        {/* Run B Header */}
        <div className="bg-white p-5 rounded-2xl border-2 border-indigo-400/60 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Run B (Comparison Candidate)
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date(analiseB.criado).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{analiseB.nome}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {analiseB.resumo_limpeza?.protocolo_detectado || 'CAN 2.0B'} • ID:{' '}
            {analiseB.id.slice(0, 8)}...
          </p>
          <div className="mt-3">
            <Link
              to={`/analises/${analiseB.id}`}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Open Full Detail View →
            </Link>
          </div>
        </div>
      </div>

      {/* Side-by-Side Key Metrics Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <GitCompare className="h-5 w-5 text-sky-600" />
          <h3 className="font-bold text-base text-slate-900">Key Metrics Comparative Matrix</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Anomaly Count */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Detected Anomalies
              </span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Run A</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">{anomsA}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Run B</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">{anomsB}</span>
              </div>
            </div>
          </div>

          {/* Anomaly Rate */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Anomaly Rate
              </span>
              <Layers className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Run A</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">{rateA}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Run B</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">{rateB}%</span>
              </div>
            </div>
          </div>

          {/* Processing Time */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                ETL Processing
              </span>
              <Clock className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Run A</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                  {analiseA.tempo_processamento_s}s
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Run B</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                  {analiseB.tempo_processamento_s}s
                </span>
              </div>
            </div>
          </div>

          {/* Analyzed Points */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Frames Analyzed
              </span>
              <Filter className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Run A</span>
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  {framesA.toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Run B</span>
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  {framesB.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>

          {/* IQR Tolerance & Outliers */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                IQR Tolerance
              </span>
              <Award className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Run A</span>
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  {analiseA.resumo_limpeza?.multiplicador_iqr || 2.5}x
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">Run B</span>
                <span className="text-base font-extrabold text-slate-900 tabular-nums">
                  {analiseB.resumo_limpeza?.multiplicador_iqr || 2.5}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Time-Series Signal Overlay */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Dual CAN Signal Trace Overlay</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side time series of ECU Battery Voltage (V) with anomalies highlighted on both
              runs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-sky-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
              Run A: {analiseA.nome.slice(0, 18)}...
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6366F1]" />
              Run B: {analiseB.nome.slice(0, 18)}...
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Anomaly Detected
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={overlayTimeSeries}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="tempo"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[8, 18]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5">
                        <p className="font-bold text-slate-300">Timestamp: {d.tempo}</p>
                        <div className="text-sky-300">
                          Run A Voltage: <span className="font-bold">{d.tensaoA ?? 'N/A'}V</span>
                          {d.anomaliaA && (
                            <span className="ml-1 text-rose-400 font-bold">[!] ({d.tipoA})</span>
                          )}
                        </div>
                        <div className="text-indigo-300">
                          Run B Voltage: <span className="font-bold">{d.tensaoB ?? 'N/A'}V</span>
                          {d.anomaliaB && (
                            <span className="ml-1 text-rose-400 font-bold">[!] ({d.tipoB})</span>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="tensaoA"
                name="Run A (V)"
                stroke="#0EA5E9"
                strokeWidth={2.2}
                dot={(props: { cx?: number; cy?: number; payload?: { anomaliaA?: boolean } }) => {
                  const { cx, cy, payload } = props
                  if (
                    payload &&
                    payload.anomaliaA &&
                    typeof cx === 'number' &&
                    typeof cy === 'number'
                  ) {
                    return (
                      <circle
                        key={`dotA-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={5.5}
                        fill="#EF4444"
                        stroke="#0EA5E9"
                        strokeWidth={2}
                      />
                    )
                  }
                  return <circle key={`dotA-${cx}-${cy}`} cx={0} cy={0} r={0} />
                }}
              />
              <Line
                type="monotone"
                dataKey="tensaoB"
                name="Run B (V)"
                stroke="#6366F1"
                strokeWidth={2.2}
                strokeDasharray="4 2"
                dot={(props: { cx?: number; cy?: number; payload?: { anomaliaB?: boolean } }) => {
                  const { cx, cy, payload } = props
                  if (
                    payload &&
                    payload.anomaliaB &&
                    typeof cx === 'number' &&
                    typeof cy === 'number'
                  ) {
                    return (
                      <circle
                        key={`dotB-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={5.5}
                        fill="#EF4444"
                        stroke="#6366F1"
                        strokeWidth={2}
                      />
                    )
                  }
                  return <circle key={`dotB-${cx}-${cy}`} cx={0} cy={0} r={0} />
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped Anomaly Distribution by Type (Dual Bar Chart) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Grouped Anomaly Distribution by Category
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side count of transient voltage, sync loss, out-of-range, and noise events
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={anomalyDistribution}
              margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="type"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
              />
              <Bar
                dataKey="RunA"
                name={`Run A (${analiseA.nome.slice(0, 15)})`}
                fill="#0EA5E9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="RunB"
                name={`Run B (${analiseB.nome.slice(0, 15)})`}
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-side AI Summaries if available */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bot className="h-4 w-4 text-sky-400" />
            <h4 className="font-bold text-sm text-sky-300">Run A AI Diagnostic Summary</h4>
          </div>
          {analiseA.ai_resumo ? (
            <div className="prose prose-invert prose-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pr-1">
              {analiseA.ai_resumo}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No AI summary generated for Run A yet. Open Run A details to run the agent.
            </p>
          )}
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bot className="h-4 w-4 text-indigo-400" />
            <h4 className="font-bold text-sm text-indigo-300">Run B AI Diagnostic Summary</h4>
          </div>
          {analiseB.ai_resumo ? (
            <div className="prose prose-invert prose-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto pr-1">
              {analiseB.ai_resumo}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No AI summary generated for Run B yet. Open Run B details to run the agent.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
