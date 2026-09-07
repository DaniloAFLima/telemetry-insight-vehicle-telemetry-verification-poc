import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  FileText,
  X,
  Play,
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  FileCheck,
} from 'lucide-react'
import { createLog } from '@/services/logs'
import { processLogPipeline } from '@/services/analises'
import type { LogFormat } from '@/types/telemetry'
import { toast } from '@/hooks/use-toast'

interface QueuedFile {
  id: string
  file: File
  name: string
  size: number
}

const stepsLabels = [
  'Ingesting log files...',
  'Cleaning & normalizing data (IQR)...',
  'Classifying anomalies...',
  'Generating verification report...',
]

export default function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<QueuedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [format, setFormat] = useState<LogFormat>('auto')
  const [iqrMultiplier, setIqrMultiplier] = useState<number>(2.5)
  const [autoReport, setAutoReport] = useState<boolean>(true)
  const [isOptionsOpen, setIsOptionsOpen] = useState(true)

  const [isProcessing, setIsProcessing] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files))
    }
  }

  const addFiles = (newFiles: File[]) => {
    const formatted = newFiles.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: f,
      name: f.name,
      size: f.size,
    }))
    setFiles((prev) => [...prev, ...formatted])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // Pipeline processing with visual progress indicator
  const handleProcessLogs = async () => {
    if (files.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Add at least one log file or click "Use Demo Dataset".',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsProcessing(true)
      setActiveStep(0)

      // Step 0: Ingesting files
      await new Promise((r) => setTimeout(r, 600))
      const firstFile = files[0]

      // Upload file to pocketbase logs collection
      const logRecord = await createLog({
        nome_arquivo: firstFile.name,
        formato: format,
        file: firstFile.file,
      })

      // Step 1: Cleaning and Normalizing
      setActiveStep(1)
      await new Promise((r) => setTimeout(r, 700))

      // Step 2: Classifying anomalies
      setActiveStep(2)
      await new Promise((r) => setTimeout(r, 700))

      // Step 3: Generating report
      setActiveStep(3)

      const processRes = await processLogPipeline({
        nome: `Analysis — ${firstFile.name}`,
        log_id: logRecord.id,
        is_demo: false,
        iqr_multiplier: iqrMultiplier,
        gerar_relatorio: autoReport,
      })

      await new Promise((r) => setTimeout(r, 400))

      toast({
        title: 'Logs Processed Successfully!',
        description: `${processRes.anomalias_detectadas} anomalies identified.`,
      })

      navigate(`/analises/${processRes.analise_id}`)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Processing failed',
        description: 'An error occurred while ingesting and analyzing the vehicle log.',
        variant: 'destructive',
      })
      setIsProcessing(false)
    }
  }

  // Quick Demo Dataset button
  const handleUseDemo = async () => {
    try {
      setIsProcessing(true)
      setActiveStep(0)
      await new Promise((r) => setTimeout(r, 500))
      setActiveStep(1)
      await new Promise((r) => setTimeout(r, 600))
      setActiveStep(2)
      await new Promise((r) => setTimeout(r, 600))
      setActiveStep(3)

      const res = await processLogPipeline({
        is_demo: true,
        nome: 'Demo Analysis — Vehicle Telemetry (CAN Bus 1)',
        iqr_multiplier: iqrMultiplier,
        gerar_relatorio: autoReport,
      })

      await new Promise((r) => setTimeout(r, 400))
      navigate(`/analises/${res.analise_id}`)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Demo processing failed',
        description: 'Please try again.',
        variant: 'destructive',
      })
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
          Upload Telemetry Logs
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Upload CAN/LIN captures or CSV files for automated ingestion, IQR cleaning, and heuristic
          anomaly detection.
        </p>
      </div>

      {/* Main Upload Box & Options */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
        {/* Dropzone Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group ${
            isDragOver
              ? 'border-[#0EA5E9] bg-sky-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-[#0EA5E9] hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.txt,.log,.asc,.blf"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <div className="h-16 w-16 rounded-2xl bg-sky-50 text-[#0EA5E9] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Drag and drop your telemetry log files here or click to browse
          </h3>
          <p className="text-xs text-slate-500 mt-2 max-w-md">
            Supported formats:{' '}
            <span className="font-semibold text-slate-700">.csv, .txt, .log</span> and automotive
            CAN/LIN <span className="font-semibold text-slate-700">.asc, .blf</span> (up to 20MB per
            file)
          </p>
        </div>

        {/* Queued Files List */}
        {files.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Queued Files ({files.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-[#0EA5E9] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible Options Panel */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="w-full flex items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100/80 text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#0EA5E9]" />
              <span className="text-sm font-bold text-slate-800">
                ETL Cleaning & Processing Options
              </span>
            </div>
            {isOptionsOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {isOptionsOpen && (
            <div className="p-5 space-y-5 bg-white border-t border-slate-200">
              {/* File Format Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    File Format
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as LogFormat)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:bg-white transition-all font-medium"
                  >
                    <option value="auto">Auto-detect (Recommended)</option>
                    <option value="can_lin">CAN/LIN Automotive Log</option>
                    <option value="csv">Tabular CSV Telemetry</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Automatically identifies common vehicle signals (battery voltage, wheel speed,
                    engine temp).
                  </p>
                </div>

                {/* IQR Multiplier Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      IQR Outlier Tolerance
                    </label>
                    <span className="text-xs font-bold text-[#0EA5E9] tabular-nums bg-sky-50 px-2 py-0.5 rounded-md">
                      {iqrMultiplier.toFixed(1)}x IQR
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={iqrMultiplier}
                    onChange={(e) => setIqrMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-[#0EA5E9] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>1.0x (Strict)</span>
                    <span>2.5x (Recommended)</span>
                    <span>5.0x (Permissive)</span>
                  </div>
                </div>
              </div>

              {/* Auto Report Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoReport}
                    onChange={(e) => setAutoReport(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#0EA5E9] focus:ring-[#0EA5E9] accent-[#0EA5E9]"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Automatically generate verification report
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Processing Progress Indicator */}
        {isProcessing && (
          <div className="p-5 bg-sky-50/60 border border-sky-200/80 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#0EA5E9] animate-spin" />
                Ingestion & Verification Pipeline
              </span>
              <span className="text-xs font-bold text-sky-700 tabular-nums">
                {Math.round(((activeStep + 1) / stepsLabels.length) * 100)}%
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stepsLabels.map((lbl, idx) => {
                const isDone = idx < activeStep
                const isCurrent = idx === activeStep
                return (
                  <div
                    key={lbl}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isCurrent
                          ? 'bg-white text-[#0EA5E9] border-[#0EA5E9] shadow-xs ring-2 ring-sky-400/20'
                          : 'bg-white/60 text-slate-400 border-slate-200'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <div className="h-3.5 w-3.5 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <span className="truncate">{lbl}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Buttons Action Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcessLogs}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-sky-700 active:scale-[0.98] shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span>{isProcessing ? 'Processing Pipeline...' : 'Process Logs'}</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleUseDemo}
            className="w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-300 disabled:opacity-50"
          >
            <Layers className="h-4 w-4 text-[#0EA5E9]" />
            <span>Use Demo Dataset</span>
          </button>
        </div>
      </div>

      {/* Automotive Specs Helper Card */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-[#0F172A] text-slate-300 rounded-2xl border border-slate-800 shadow-sm flex items-start gap-4">
        <FileCheck className="h-6 w-6 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-white text-sm">
            Compatibility with Global Automotive Protocols
          </p>
          <p className="text-slate-400 leading-relaxed">
            The pipeline parses raw CAN 2.0B / CAN-FD frames and LIN buses. Input streams undergo 50
            Hz temporal resampling, Interquartile Range (IQR) outlier filtering, and automated
            anomaly classification with statistical confidence scoring.
          </p>
        </div>
      </div>
    </div>
  )
}
