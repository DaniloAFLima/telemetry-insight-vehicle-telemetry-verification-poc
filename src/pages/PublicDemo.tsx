import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
  ChevronRight,
  Zap,
  TrendingUp,
  Linkedin,
  Bot,
  Sparkles,
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

interface SimPoint {
  time: string
  voltage: number
  upperLimit: number
  lowerLimit: number
  isAnomaly: boolean
  anomalyType?: string | null
  severity?: 'Critical' | 'High' | 'Medium' | 'Low' | null
  channel: string
}

interface PipelineStageState {
  name: string
  label: string
  active: boolean
  processedCount: number
}

const SPEED_OPTIONS = [
  { label: '1x', delay: 1000 },
  { label: '5x', delay: 200 },
  { label: '20x', delay: 50 },
]

export default function PublicDemo() {
  const [isRunning, setIsRunning] = useState(true)
  const [speedIndex, setSpeedIndex] = useState(0) // 0 = 1x, 1 = 5x, 2 = 20x
  const [points, setPoints] = useState<SimPoint[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [anomaliesCount, setAnomaliesCount] = useState(0)
  const [recentAnomalies, setRecentAnomalies] = useState<
    { id: string; time: string; channel: string; type: string; severity: string; value: number }[]
  >([])

  // Pipeline stage active indicators
  const [pipelineStep, setPipelineStep] = useState(0) // 0: Ingest, 1: Clean, 2: Normalize, 3: Classify

  const tickRef = useRef<number>(0)
  const baseVoltage = 12.8

  // Initialize with seed points for instant visual delight
  useEffect(() => {
    const initialPoints: SimPoint[] = []
    for (let i = 0; i < 20; i++) {
      const sec = i * 2
      const timeStr = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
      const isAno = i === 12
      const val = isAno
        ? 16.7
        : +(baseVoltage + Math.sin(i * 0.4) * 0.35 + (i % 2 === 0 ? 0.08 : -0.08)).toFixed(2)

      initialPoints.push({
        time: timeStr,
        voltage: val,
        upperLimit: 14.4,
        lowerLimit: 11.8,
        isAnomaly: isAno,
        anomalyType: isAno ? 'Voltage Spike' : null,
        severity: isAno ? 'Critical' : null,
        channel: 'CAN1_ECU_BattVolt',
      })
    }
    setPoints(initialPoints)
    setTotalPoints(20)
    setAnomaliesCount(1)
    setRecentAnomalies([
      {
        id: 'ano-seed-1',
        time: '00:24',
        channel: 'CAN1_ECU_BattVolt',
        type: 'Voltage Spike',
        severity: 'Critical',
        value: 16.7,
      },
    ])
    tickRef.current = 20
  }, [])

  // Running interval generator
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      tickRef.current += 1
      const t = tickRef.current
      const sec = t * 2
      const minStr = String(Math.floor(sec / 60)).padStart(2, '0')
      const secStr = String(sec % 60).padStart(2, '0')
      const timeStr = `${minStr}:${secStr}`

      // Anomaly trigger (approx every 18-25 ticks or specific modulos)
      let isAno = false
      let anoType: string | null = null
      let anoSev: 'Critical' | 'High' | 'Medium' | 'Low' | null = null
      let ch = 'CAN1_ECU_BattVolt'
      let val = +(baseVoltage + Math.sin(t * 0.35) * 0.45 + (Math.random() * 0.16 - 0.08)).toFixed(
        2,
      )

      if (t % 22 === 0) {
        isAno = true
        anoType = 'Voltage Spike'
        anoSev = 'Critical'
        val = +(16.4 + Math.random() * 1.5).toFixed(2)
        ch = 'CAN1_ECU_BattVolt'
      } else if (t % 41 === 0) {
        isAno = true
        anoType = 'Sync Loss'
        anoSev = 'High'
        val = 9.4
        ch = 'CAN1_WheelSpeed_FL'
      } else if (t % 63 === 0) {
        isAno = true
        anoType = 'Out of Range'
        anoSev = 'Medium'
        val = 14.95
        ch = 'CAN1_MotorTemp_Sens'
      } else if (t % 85 === 0) {
        isAno = true
        anoType = 'High Noise'
        anoSev = 'Low'
        val = 13.9
        ch = 'LIN_SteeringAngle_Sensor'
      }

      const newPoint: SimPoint = {
        time: timeStr,
        voltage: val,
        upperLimit: 14.4,
        lowerLimit: 11.8,
        isAnomaly: isAno,
        anomalyType: anoType,
        severity: anoSev,
        channel: ch,
      }

      setPoints((prev) => {
        const next = [...prev, newPoint]
        if (next.length > 30) {
          return next.slice(next.length - 30)
        }
        return next
      })

      setTotalPoints((prev) => prev + 1)

      if (isAno && anoType && anoSev) {
        setAnomaliesCount((prev) => prev + 1)
        setRecentAnomalies((prev) => [
          {
            id: `ano-${Date.now()}`,
            time: timeStr,
            channel: ch,
            type: anoType,
            severity: anoSev,
            value: val,
          },
          ...prev.slice(0, 5),
        ])
      }

      // Step pipeline animation
      setPipelineStep((prev) => (prev + 1) % 4)
    }, SPEED_OPTIONS[speedIndex].delay)

    return () => clearInterval(interval)
  }, [isRunning, speedIndex])

  const handleReset = () => {
    tickRef.current = 0
    setPoints([])
    setTotalPoints(0)
    setAnomaliesCount(0)
    setRecentAnomalies([])
  }

  const anomalyRate = totalPoints > 0 ? ((anomaliesCount / totalPoints) * 100).toFixed(1) : '0.0'

  const stages: PipelineStageState[] = [
    {
      name: 'ingest',
      label: '1. CAN/LIN Ingest',
      active: pipelineStep === 0,
      processedCount: totalPoints,
    },
    {
      name: 'clean',
      label: '2. IQR Outlier Filter',
      active: pipelineStep === 1,
      processedCount: Math.max(0, totalPoints - anomaliesCount),
    },
    {
      name: 'normalize',
      label: '3. 50Hz Timestamps',
      active: pipelineStep === 2,
      processedCount: totalPoints,
    },
    {
      name: 'classify',
      label: '4. Anomaly Classifier',
      active: pipelineStep === 3,
      processedCount: anomaliesCount,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Background ambient light */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-sky-500/15 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-slate-800/80 bg-[#0F172A]/70 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0EA5E9] to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Telemetry Insight
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  Live Demo
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Vehicle Telemetry Verification POC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-time CAN stream simulation</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0EA5E9] hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Sign in to Platform</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-sky-500/30 text-xs text-slate-300 shadow-lg shadow-sky-500/10">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-white">GlobalLogic Opportunity Showcase</span>
            <span className="text-slate-500">•</span>
            <span className="text-sky-300">AI Developer & Data Scientist Role</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Automated Telemetry Verification for Connected Vehicles
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Interactive web POC tackling the{' '}
            <strong>Ecoride electric-bike telemetry verification challenge</strong>. Demonstrating
            automated diagnostic log ingestion, statistical IQR outlier cleaning, and
            machine-learning anomaly classification inspired by an enterprise
            Python/Pandas/Scikit-learn stack.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-sky-300">
              Python
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-sky-300">
              Pandas
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-sky-300">
              NumPy
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-sky-300">
              Scikit-learn
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-sky-300">
              Docker
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-sky-300">
              Django
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 font-mono text-indigo-300">
              Skip Cloud Native AI Agents
            </span>
          </div>
        </div>

        {/* 3 Key Metrics Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
          <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800/90 backdrop-blur-sm shadow-lg flex items-center gap-3.5 hover:border-sky-500/40 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">~87%</div>
              <div className="text-xs text-slate-400">Classification Accuracy</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800/90 backdrop-blur-sm shadow-lg flex items-center gap-3.5 hover:border-amber-500/40 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">~5%</div>
              <div className="text-xs text-slate-400">Baseline Anomaly Rate</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111827]/80 border border-slate-800/90 backdrop-blur-sm shadow-lg flex items-center gap-3.5 hover:border-emerald-500/40 transition-colors">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">
                2.5x IQR
              </div>
              <div className="text-xs text-slate-400">Statistical Outlier Cleaning</div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE LIVE SIMULATION PANEL */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <div className="bg-[#111827]/95 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow border top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />

          {/* Panel Header + Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  {isRunning ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  )}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Live CAN Telemetry Stream & Anomaly Detector
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Channel: <span className="text-sky-400 font-mono">CAN1_ECU_BattVolt</span>{' '}
                (Sampling: 50 Hz | Nominal: 11.8V – 14.4V)
              </p>
            </div>

            {/* Interactive Simulation Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Play / Pause */}
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isRunning
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Resume Stream</span>
                  </>
                )}
              </button>

              {/* Speed Toggle: 1x / 5x / 20x */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                {SPEED_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.label}
                    onClick={() => setSpeedIndex(idx)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      speedIndex === idx
                        ? 'bg-[#0EA5E9] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                title="Reset simulation stream"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Running Counters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-b border-slate-800/80">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Points Processed
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                {totalPoints.toLocaleString('en-US')}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Anomalies Detected
              </span>
              <span className="text-xl sm:text-2xl font-bold text-rose-400 tabular-nums">
                {anomaliesCount}
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Anomaly Rate
              </span>
              <span className="text-xl sm:text-2xl font-bold text-amber-400 tabular-nums">
                {anomalyRate}%
              </span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Engine Status
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {isRunning ? 'Real-Time Ingestion' : 'Stream Paused'}
              </span>
            </div>
          </div>

          {/* ETL Pipeline Animated Micro-Status */}
          <div className="py-5 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                <span>ETL Verification Pipeline Stages</span>
              </span>
              <span className="text-[11px] text-sky-400 font-mono">Continuous Execution</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {stages.map((st) => (
                <div
                  key={st.name}
                  className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                    st.active
                      ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-500/20 ring-1 ring-sky-500/40'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-white">{st.label}</p>
                    <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {st.processedCount.toLocaleString('en-US')} records
                    </p>
                  </div>
                  {st.active ? (
                    <div className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Chart Visual */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
                  CAN Voltage Signal (V)
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="h-2 w-3 bg-slate-700 rounded-xs" />
                  ISO Nominal Envelope (11.8V - 14.4V)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                  Detected Anomaly
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="liveColorTensao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[8, 18]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as SimPoint
                        return (
                          <div className="bg-[#0F172A] border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-bold text-sky-400">Timestamp: {data.time}</p>
                            <p>Channel: {data.channel}</p>
                            <p>Voltage: {data.voltage}V</p>
                            {data.isAnomaly && (
                              <div className="pt-1 mt-1 border-t border-slate-700 text-rose-400 font-bold">
                                [!] {data.anomalyType} ({data.severity})
                              </div>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="voltage"
                    stroke="#0EA5E9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#liveColorTensao)"
                    isAnimationActive={false}
                    dot={(props: { cx?: number; cy?: number; payload?: SimPoint }) => {
                      const { cx, cy, payload } = props
                      if (
                        payload &&
                        payload.isAnomaly &&
                        typeof cx === 'number' &&
                        typeof cy === 'number'
                      ) {
                        return (
                          <circle
                            key={`live-dot-${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#EF4444"
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        )
                      }
                      return <circle key={`empty-dot-${cx}-${cy}`} cx={0} cy={0} r={0} />
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Anomalies Log Ticker */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Classified Anomalies
              </span>
              <span className="text-[11px] text-slate-500">Live FIFO buffer</span>
            </div>

            {recentAnomalies.length === 0 ? (
              <div className="p-4 bg-slate-900/50 rounded-xl text-center text-xs text-slate-500">
                No anomalies registered in the current streaming window.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {recentAnomalies.map((ano) => (
                  <div
                    key={ano.id}
                    className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sky-400">{ano.time}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {ano.severity}
                      </span>
                    </div>
                    <p className="font-semibold text-white truncate">{ano.type}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {ano.channel} • {ano.value}V
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Business Problem & Tech Stack Deep-dive */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Problem Card */}
          <div className="p-6 sm:p-8 bg-[#111827]/80 border border-slate-800 rounded-3xl backdrop-blur-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Business Problem: Ecoride Telemetry Verification at Scale
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modern connected e-bikes (such as Ecoride smart powertrains) and electric vehicles
              generate thousands of CAN/LIN bus frames per second. In standard engineering
              workflows, manual inspection of diagnostic logs for firmware regressions and HIL/SIL
              acceptance testing consumes days and risks missing transient voltage spikes and timing
              jitter.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              This proof of concept demonstrates how automated statistical IQR filtering and machine
              learning classification isolate transient faults (~5% anomaly rate) with ~87%
              precision, cutting manual triage by up to 40% and generating instant engineering
              verification reports.
            </p>
          </div>

          {/* Architecture & Tech Stack Card */}
          <div className="p-6 sm:p-8 bg-[#111827]/80 border border-slate-800 rounded-3xl backdrop-blur-sm space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Inspiration Stack: Python, Docker & Skip Cloud Agents
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-sky-400 font-bold block">
                  Python Data Science
                </span>
                <span className="text-xs text-slate-300">
                  Pandas, NumPy, Scikit-learn (RandomForest & IsolationForest), Django REST
                </span>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-indigo-400 font-bold block">
                  Deployment & Infra
                </span>
                <span className="text-xs text-slate-300">
                  Docker containerized pipeline, CI/CD automated validation sweeps
                </span>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-emerald-400 font-bold block">
                  Interactive Web POC
                </span>
                <span className="text-xs text-slate-300">
                  React 18, TypeScript, Tailwind CSS, Recharts time-series & dual comparison
                </span>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-amber-400 font-bold block">Native AI Agent</span>
                <span className="text-xs text-slate-300">
                  Skip Cloud Native Agent producing natural-language diagnostic summaries
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to Login / Platform */}
        <div className="mt-10 p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/20 text-center space-y-4 shadow-xl">
          <h3 className="text-2xl font-extrabold text-white">
            Explore the Complete Authenticated Workspace
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Log in with the pre-configured portfolio demo account to upload your own CAN logs, run
            customized IQR analyses, and export printable verification reports.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0EA5E9] hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Access Demo Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 px-4 text-center text-xs text-slate-400 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-semibold text-white">
            Created by <strong className="text-sky-400">Danilo Lima</strong>
          </span>
          <span className="text-slate-600">•</span>
          <a
            href="https://www.linkedin.com/in/danilo-lima"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors hover:underline"
          >
            <Linkedin className="h-3.5 w-3.5" />
            <span>LinkedIn Profile</span>
          </a>
        </div>
        <p className="text-slate-500">
          Portfolio project — Telemetry Insight POC • Inspired by GlobalLogic AI Developer & Data
          Scientist Opportunity (Ecoride Electric-Bike Verification Problem)
        </p>
        <p className="text-[11px] text-slate-600">
          Python (Pandas, NumPy, Scikit-learn, Django), Docker, React + TypeScript & Skip Cloud
          Native AI Agents.
        </p>
      </footer>
    </div>
  )
}
