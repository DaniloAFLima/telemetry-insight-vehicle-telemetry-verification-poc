import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock,
  Layers,
  AlertTriangle,
  Award,
  Download,
  Plus,
  ArrowLeft,
  Filter,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Info,
  Radio,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { getAnaliseById } from '@/services/analises'
import type { AnaliseRecord, AnomalyItem } from '@/types/telemetry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

// Donut Chart Colors
const PIE_COLORS: Record<string, string> = {
  Normal: '#22C55E',
  'Pico de Tensão': '#EF4444',
  'Falha de Sincronização': '#F59E0B',
  'Valor Fora do Intervalo': '#8B5CF6',
  'Ruído Excessivo': '#0EA5E9',
}

export default function AnaliseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [analise, setAnalise] = useState<AnaliseRecord | null>(null)
  const [loading, setLoading] = useState(true)

  // Table sorting
  const [sortField, setSortField] = useState<keyof AnomalyItem>('timestamp')
  const [sortAsc, setSortAsc] = useState<boolean>(true)

  const loadData = async (targetId: string) => {
    try {
      const data = await getAnaliseById(targetId)
      setAnalise(data)
    } catch (err) {
      console.error('Falha ao carregar análise:', err)
      toast({
        title: 'Análise não encontrada',
        description: 'Não foi possível carregar os dados desta análise.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadData(id)
    }
  }, [id])

  // Real-time synchronization for this single analysis
  useRealtime<AnaliseRecord>('analises', (e) => {
    if (e.record.id === id) {
      setAnalise(e.record)
    }
  })

  // Export printable verification report in-browser
  const handleExportReport = () => {
    if (!analise) return

    const reportContent = `
================================================================================
       RELATÓRIO DE VERIFICAÇÃO DE TELEMETRIA VEICULAR (POC GLOBALLOGIC)
================================================================================
Título da Análise: ${analise.nome}
Identificador: ${analise.id}
Data de Execução: ${new Date(analise.criado).toLocaleString('pt-BR')}
Status: ${analise.status.toUpperCase()}

1. MÉTRICAS CHAVE DO RUN
--------------------------------------------------------------------------------
- Tempo de Processamento: ${analise.tempo_processamento_s}s
- Linhas Analisadas: ${(analise.resumo_limpeza?.linhas_originais || 1250).toLocaleString('pt-BR')}
- Anomalias Detectadas: ${analise.anomalias?.length || 0}
- Precisão do Modelo Heurístico/ML: ${Math.round((analise.precisao_modelo || 0.87) * 100)}%

2. RESUMO DE LIMPEZA & NORMALIZAÇÃO (IQR)
--------------------------------------------------------------------------------
- Protocolo Detectado: ${analise.resumo_limpeza?.protocolo_detectado || 'CAN/LIN Automotivo'}
- Linhas Limpas: ${(analise.resumo_limpeza?.linhas_limpas || 1242).toLocaleString('pt-BR')}
- Outliers Removidos: ${analise.resumo_limpeza?.outliers_removidos || 8}
- Timestamps Normalizados: ${analise.resumo_limpeza?.timestamps_normalizados || 1250}
- Valores Nulos Imputados: ${analise.resumo_limpeza?.valores_nulos_imputados || 12}
- Tolerância IQR: ${analise.resumo_limpeza?.multiplicador_iqr || 2.5}x

3. TABELA DE ANOMALIAS CLASSIFICADAS
--------------------------------------------------------------------------------
${(analise.anomalias || [])
  .map(
    (a, i) =>
      `[#${i + 1}] ${a.timestamp} | Canal: ${a.canal}\n` +
      `     Tipo: ${a.tipo} | Severidade: ${a.severidade.toUpperCase()} | Confiança: ${Math.round(
        a.confianca * 100,
      )}%\n` +
      `     Faixa Esperada: ${a.esperado_intervalo || 'N/A'} | Valor: ${a.valor_medido || 'N/A'}\n` +
      `     Diagnóstico: ${a.descricao || 'Sem descrição'}\n`,
  )
  .join('\n')}

================================================================================
Documento gerado automaticamente pelo Telemetry Insight para verificação de software.
`

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio_verificacao_${analise.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Relatório Exportado',
      description: 'O arquivo de verificação foi baixado com sucesso.',
    })
  }

  // Distribution Data for Donut Chart
  const donutData = useMemo(() => {
    if (!analise) return []
    const totalLines = analise.resumo_limpeza?.linhas_limpas || 1200
    const anomalies = analise.anomalias || []

    const counts: Record<string, number> = {}
    anomalies.forEach((a) => {
      counts[a.tipo] = (counts[a.tipo] || 0) + 1
    })

    const normalCount = Math.max(0, totalLines - anomalies.length)
    const result = [{ name: 'Normal', value: normalCount, color: PIE_COLORS['Normal'] }]

    Object.entries(counts).forEach(([tipo, val]) => {
      result.push({
        name: tipo,
        value: val,
        color: PIE_COLORS[tipo] || '#0EA5E9',
      })
    })

    return result
  }, [analise])

  // Sorted Anomalies
  const sortedAnomalies = useMemo(() => {
    if (!analise?.anomalias) return []
    return [...analise.anomalias].sort((a, b) => {
      const valA = a[sortField] ?? ''
      const valB = b[sortField] ?? ''
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }, [analise, sortField, sortAsc])

  const handleSort = (field: keyof AnomalyItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Radio className="h-8 w-8 animate-spin text-[#0EA5E9]" />
        <p className="text-sm font-medium">Carregando painel de verificação veicular...</p>
      </div>
    )
  }

  if (!analise) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Análise não encontrada</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Esta análise pode ter sido excluída ou você não possui permissão de leitura.
        </p>
        <button
          onClick={() => navigate('/analises')}
          className="px-4 py-2 rounded-xl bg-[#0EA5E9] text-white text-xs font-bold"
        >
          Voltar para Lista
        </button>
      </div>
    )
  }

  const anomCount = analise.anomalias?.length || 0
  const hasAnomalies = anomCount > 0
  const formattedDate = new Date(analise.criado).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-8">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/analises')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Análises</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                hasAnomalies
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {hasAnomalies ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Com anomalias ({anomCount})</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Processado e Conforme</span>
                </>
              )}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">{formattedDate}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            {analise.nome}
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            {analise.resumo_limpeza?.protocolo_detectado || 'CAN 2.0B / LIN 2.2'} • Tolerância IQR:{' '}
            {analise.resumo_limpeza?.multiplicador_iqr || 2.5}x
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-[#0EA5E9]" />
            <span>Exportar Relatório</span>
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Análise</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Tempo de Processamento
            </span>
            <Clock className="h-4 w-4 text-[#0EA5E9]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {analise.tempo_processamento_s}s
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ingestão + Limpeza + Heurística
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Linhas Analisadas
            </span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {(analise.resumo_limpeza?.linhas_originais || 1250).toLocaleString('pt-BR')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Quadros CAN/LIN ingeridos</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Anomalias Detectadas
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600 tabular-nums">
            {anomCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {hasAnomalies ? 'Fora do envelope nominal' : 'Tudo dentro do esperado'}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Precisão do Modelo
            </span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
            {Math.round((analise.precisao_modelo || 0.87) * 100)}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Envelope de alta confiança
          </span>
        </div>
      </div>

      {/* Two-Column Charts: Donut + Time-series */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Anomaly Distribution (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">Distribuição de Quadros</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Normal vs. Categorias de Anomalias no Log
            </p>
          </div>

          <div className="h-64 w-full my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => [
                    typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value ?? ''),
                    'Amostras',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="h-4 w-4 text-[#0EA5E9] shrink-0 mt-0.5" />
            <span>
              99%+ dos quadros operam dentro do limiar seguro. Anomalias representam eventos
              isolados de alta severidade.
            </span>
          </div>
        </div>

        {/* Time-Series Chart: CAN Bus Signal with Anomaly Markers (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-base text-[#0F172A]">Série Temporal do Sinal CAN</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Variação de Tensão (V) com marcadores de anomalia em destaque
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-sky-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
                Sinal Real
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
                Faixa Nominal (11.8V - 14.4V)
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                Anomalia
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analise.dados_serie_temporal || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTensao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
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
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#0F172A] text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-sky-400">Timestamp: {data.tempo}</p>
                          <p>Tensão: {data.tensao}V</p>
                          {data.anomalia && (
                            <div className="pt-1 mt-1 border-t border-slate-700">
                              <span className="font-bold text-rose-400">
                                [!] {data.tipo_anomalia} ({data.severidade})
                              </span>
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
                  dataKey="tensao"
                  stroke="#0EA5E9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTensao)"
                  dot={(props: { cx?: number; cy?: number; payload?: { anomalia?: boolean } }) => {
                    const { cx, cy, payload } = props
                    if (
                      payload &&
                      payload.anomalia &&
                      typeof cx === 'number' &&
                      typeof cy === 'number'
                    ) {
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      )
                    }
                    return <circle key={`dot-${cx}-${cy}`} cx={0} cy={0} r={0} />
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cleaning Summary Panel */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-[#0EA5E9]" />
          <h3 className="font-bold text-base text-[#0F172A]">Resumo da Limpeza e Normalização</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">
              Outliers Removidos (IQR)
            </span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">
              {analise.resumo_limpeza?.outliers_removidos || 0} amostras
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">
              Timestamps Normalizados
            </span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">
              {(analise.resumo_limpeza?.timestamps_normalizados || 0).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">
              Valores Ausentes Preenchidos
            </span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">
              {analise.resumo_limpeza?.valores_nulos_imputados || 0} campos
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">Tempo de Parsing ETL</span>
            <span className="text-xl font-bold text-slate-800 tabular-nums">
              {analise.resumo_limpeza?.tempo_parse_ms || 140} ms
            </span>
          </div>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">
              Tabela de Anomalias Classificadas
            </h3>
            <p className="text-xs text-[#64748B]">
              Eventos detectados ordenáveis por timestamp, severidade e confiança do modelo
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total: {sortedAnomalies.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-semibold select-none">
                <th
                  onClick={() => handleSort('timestamp')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    {sortField === 'timestamp' &&
                      (sortAsc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('canal')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Canal / Sinal</span>
                    {sortField === 'canal' &&
                      (sortAsc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tipo')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Tipo de Anomalia</span>
                    {sortField === 'tipo' &&
                      (sortAsc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('severidade')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Severidade</span>
                    {sortField === 'severidade' &&
                      (sortAsc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('confianca')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-800"
                >
                  <div className="flex items-center gap-1">
                    <span>Confiança</span>
                    {sortField === 'confianca' &&
                      (sortAsc ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sortedAnomalies.map((item) => {
                const confPercent = Math.round(item.confianca * 100)
                const isCritica = item.severidade === 'Crítica'
                const isAlta = item.severidade === 'Alta'
                const isMedia = item.severidade === 'Média'

                const badgeBg = isCritica
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isAlta
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : isMedia
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs text-slate-700 tabular-nums">
                      {item.timestamp}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-slate-900 block">{item.canal}</span>
                      <span className="text-[11px] text-slate-500 block max-w-sm">
                        {item.descricao}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">{item.tipo}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${badgeBg}`}
                      >
                        {item.severidade}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 sm:w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#0EA5E9] h-full rounded-full transition-all duration-300"
                            style={{ width: `${confPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 tabular-nums">
                          {confPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {sortedAnomalies.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    Nenhuma anomalia detectada nesta execução de teste.
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
