import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Download, UploadCloud, Clock, Printer, ChevronRight, Radio } from 'lucide-react'
import { listRelatorios } from '@/services/relatorios'
import type { RelatorioRecord } from '@/types/telemetry'
import { toast } from '@/hooks/use-toast'

export default function RelatoriosPage() {
  const navigate = useNavigate()
  const [relatorios, setRelatorios] = useState<RelatorioRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<RelatorioRecord | null>(null)

  const loadData = async () => {
    try {
      const data = await listRelatorios(1, 50)
      setRelatorios(data)
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0])
      }
    } catch (err) {
      console.error('Falha ao listar relatórios:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Download raw formatted text/markdown
  const handleDownload = (report: RelatorioRecord) => {
    const blob = new Blob([report.conteudo], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.titulo.replace(/\s+/g, '_').toLowerCase()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Download Concluído',
      description: 'O relatório foi exportado no formato Markdown/Texto.',
    })
  }

  // Print formatted report directly using native browser print
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Relatórios de Verificação
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Exporte relatórios de verificação para compartilhar com sua equipe de engenharia e QA.
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold shadow-md shadow-sky-500/20 transition-all"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Enviar Novo Log</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Radio className="h-8 w-8 animate-spin text-[#0EA5E9]" />
          <p className="text-sm font-medium">Carregando relatórios...</p>
        </div>
      ) : relatorios.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 bg-sky-50 text-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nenhum relatório gerado ainda</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6 max-w-sm mx-auto leading-relaxed">
            Execute uma análise ou faça o upload de um log com a opção de relatório automático
            marcada para compor o documento de verificação.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="px-5 py-2.5 rounded-xl bg-[#0EA5E9] text-white text-sm font-bold shadow-md shadow-sky-500/20 hover:bg-[#0284C7] transition-all"
          >
            Enviar Primeiro Log
          </button>
        </div>
      ) : (
        /* Reports Grid + Preview Split */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List of Reports (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Documentos Disponíveis ({relatorios.length})
            </h2>

            <div className="space-y-3">
              {relatorios.map((item) => {
                const isSelected = selectedReport?.id === item.id
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
                    onClick={() => setSelectedReport(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white border-[#0EA5E9] shadow-md ring-2 ring-sky-400/20'
                        : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-sky-50 text-[#0EA5E9]' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                            {item.titulo}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="tabular-nums">{dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(item)
                        }}
                        className="p-2 text-slate-400 hover:text-[#0EA5E9] hover:bg-sky-50 rounded-lg transition-colors"
                        title="Baixar Relatório"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0EA5E9]">
                        <span>Exibindo prévia</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Report Viewer / Printable Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
            {selectedReport ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedReport.titulo}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gerado em {new Date(selectedReport.criado).toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5 text-slate-600" />
                      <span>Imprimir / PDF</span>
                    </button>
                    <button
                      onClick={() => handleDownload(selectedReport)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                {/* Formatted body */}
                <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[620px] overflow-y-auto selection:bg-sky-500 selection:text-white">
                  {selectedReport.conteudo}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-sm">
                Selecione um relatório ao lado para visualizar a prévia.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
