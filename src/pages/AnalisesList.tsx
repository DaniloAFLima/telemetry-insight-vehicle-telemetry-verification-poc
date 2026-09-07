import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Plus,
  Play,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react'
import { listAnalises, processLogPipeline } from '@/services/analises'
import type { AnaliseRecord } from '@/types/telemetry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

export default function AnalisesList() {
  const navigate = useNavigate()
  const [analises, setAnalises] = useState<AnaliseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [runningDemo, setRunningDemo] = useState(false)

  const loadData = async () => {
    try {
      const data = await listAnalises(1, 100)
      setAnalises(data)
    } catch (err) {
      console.error('Falha ao carregar análises:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Real-time synchronization
  useRealtime<AnaliseRecord>('analises', (e) => {
    if (e.action === 'create') {
      setAnalises((prev) => [e.record, ...prev.filter((r) => r.id !== e.record.id)])
    } else if (e.action === 'update') {
      setAnalises((prev) => prev.map((r) => (r.id === e.record.id ? e.record : r)))
    } else if (e.action === 'delete') {
      setAnalises((prev) => prev.filter((r) => r.id !== e.record.id))
    }
  })

  const handleRunDemo = async () => {
    try {
      setRunningDemo(true)
      const res = await processLogPipeline({
        is_demo: true,
        nome: 'Análise Demo — Telemetria Veicular (CAN Bus 1)',
        iqr_multiplier: 2.5,
        gerar_relatorio: true,
      })
      navigate(`/analises/${res.analise_id}`)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao rodar dataset demo',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setRunningDemo(false)
    }
  }

  const filteredAnalises = analises.filter((item) =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Análises de Telemetria
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Histórico completo de verificações e classificações de anomalias veiculares.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Análise</span>
          </button>
          <button
            onClick={handleRunDemo}
            disabled={runningDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Play className={`h-4 w-4 text-[#0EA5E9] ${runningDemo ? 'animate-spin' : ''}`} />
            <span>Dataset Demo</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs max-w-md">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar por nome da análise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-800"
        />
      </div>

      {/* Runs Grid & Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Activity className="h-8 w-8 animate-spin text-[#0EA5E9]" />
          <p className="text-sm">Carregando execuções de análise...</p>
        </div>
      ) : filteredAnalises.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma análise encontrada</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Faça upload de um arquivo de telemetria ou execute o dataset demo para visualizar
            métricas.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 rounded-xl bg-[#0EA5E9] text-white text-sm font-bold shadow-md shadow-sky-500/20 hover:bg-[#0284C7] transition-all"
          >
            Enviar Primeiro Log
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnalises.map((item) => {
            const anomCount = item.anomalias?.length || 0
            const hasAnomalies = anomCount > 0
            const dateStr = new Date(item.criado).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/analises/${item.id}`)}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        hasAnomalies
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                      }`}
                    >
                      {hasAnomalies ? (
                        <>
                          <AlertTriangle className="h-3 w-3 text-rose-600" />
                          <span>
                            {anomCount} Anomalia{anomCount !== 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Conforme</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 tabular-nums">{dateStr}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0EA5E9] transition-colors line-clamp-1 mb-1">
                    {item.nome}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {item.resumo_limpeza?.protocolo_detectado || 'CAN High-Speed (ISO 11898)'} •{' '}
                    {item.resumo_limpeza?.linhas_limpas || 1200} amostras
                  </p>
                </div>

                {/* Metrics footer inside card */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="tabular-nums font-semibold">
                      {item.tempo_processamento_s}s
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="text-slate-400">Precisão:</span>
                    <span className="font-bold text-[#0EA5E9] tabular-nums">
                      {Math.round((item.precisao_modelo || 0.85) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[#0EA5E9] font-bold group-hover:translate-x-1 transition-transform">
                    <span>Abrir</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
