import { useEffect, useState } from 'react'
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  FileCheck,
  ExternalLink,
  Printer,
  Sparkles,
  Bot,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listRelatorios, deleteRelatorio } from '@/services/relatorios'
import type { RelatorioRecord } from '@/types/telemetry'
import { toast } from '@/hooks/use-toast'

export default function RelatoriosPage() {
  const navigate = useNavigate()
  const [relatorios, setRelatorios] = useState<RelatorioRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRelatorio, setSelectedRelatorio] = useState<RelatorioRecord | null>(null)

  const loadData = async () => {
    try {
      const data = await listRelatorios(1, 100)
      setRelatorios(data)
      if (data.length > 0 && !selectedRelatorio) {
        setSelectedRelatorio(data[0])
      }
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      await deleteRelatorio(id)
      setRelatorios((prev) => prev.filter((r) => r.id !== id))
      if (selectedRelatorio?.id === id) {
        setSelectedRelatorio(null)
      }
      toast({
        title: 'Report deleted',
        description: 'Report successfully removed from workspace.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error deleting report',
        description: 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = (relatorio: RelatorioRecord) => {
    const blob = new Blob([relatorio.conteudo], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${relatorio.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Report Downloaded',
      description: 'Report saved as Markdown (.md).',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Verification Reports
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Automated technical reports generated for vehicle software verification and acceptance
            tests.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">Loading reports...</div>
      ) : relatorios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No reports generated yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            When you run an analysis on the Upload page, a verification report is generated
            automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Reports List Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Generated Reports ({relatorios.length})
            </h2>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {relatorios.map((item) => {
                const isSelected = selectedRelatorio?.id === item.id
                const dateStr = new Date(item.criado).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRelatorio(item)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50/70 border-[#0EA5E9] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCheck
                          className={`h-4 w-4 shrink-0 ${
                            isSelected ? 'text-[#0EA5E9]' : 'text-slate-400'
                          }`}
                        />
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {item.titulo}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{dateStr}</span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Markdown
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Report Viewer (8 cols) */}
          <div className="lg:col-span-8">
            {selectedRelatorio ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                {/* Viewer Header */}
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedRelatorio.titulo}
                    </h2>
                    <span className="text-xs text-slate-500">
                      Generated on {new Date(selectedRelatorio.criado).toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
                      title="Print report"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(selectedRelatorio)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download MD</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedRelatorio.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* AI Summary Badge / Quick link banner if present */}
                {selectedRelatorio.conteudo.includes('AI DIAGNOSTIC SUMMARY') ? (
                  <div className="bg-gradient-to-r from-sky-950 to-slate-900 border-b border-sky-800/50 px-6 py-3 flex items-center justify-between text-xs text-sky-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
                      <span>Includes Skip Cloud Native Agent Diagnostic Summary</span>
                    </div>
                    {selectedRelatorio.analise_id && (
                      <button
                        onClick={() => navigate(`/analises/${selectedRelatorio.analise_id}`)}
                        className="inline-flex items-center gap-1 text-sky-300 hover:text-white font-medium hover:underline"
                      >
                        <span>View Analysis</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : selectedRelatorio.analise_id ? (
                  <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Bot className="h-3.5 w-3.5 text-slate-400" />
                      <span>No AI diagnostic summary generated yet for this run.</span>
                    </div>
                    <button
                      onClick={() => navigate(`/analises/${selectedRelatorio.analise_id}`)}
                      className="text-sky-600 hover:text-sky-700 font-semibold hover:underline"
                    >
                      Open in Analysis to Generate AI Summary →
                    </button>
                  </div>
                ) : null}

                {/* Viewer Content */}
                <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap bg-slate-50/30 max-h-[700px] overflow-y-auto">
                  {selectedRelatorio.conteudo}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                Select a report from the sidebar to inspect its content.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
