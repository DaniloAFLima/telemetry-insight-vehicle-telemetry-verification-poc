import type { RecordModel } from 'pocketbase'

export interface UserRecord extends RecordModel {
  email: string
  name?: string
  avatar?: string
}

export type LogFormat = 'auto' | 'can_lin' | 'csv'

export interface LogRecord extends RecordModel {
  usuario_id: string
  nome_arquivo: string
  formato: LogFormat
  arquivo?: string
  linhas_processadas: number
  anomalias_detectadas: number
  criado: string
  atualizado: string
}

export type AnomalySeverity =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical'
  | 'Baixa'
  | 'Média'
  | 'Alta'
  | 'Crítica'
export type AnomalyType =
  | 'Voltage Spike'
  | 'Sync Loss'
  | 'Out of Range'
  | 'High Noise'
  | 'Pico de Tensão'
  | 'Falha de Sincronização'
  | 'Valor Fora do Intervalo'
  | 'Ruído Excessivo'

export interface AnomalyItem {
  id: string
  timestamp: string
  canal: string
  tipo: AnomalyType | string
  severidade: AnomalySeverity
  confianca: number // 0 to 1
  valor_medido?: number
  esperado_intervalo?: string
  descricao?: string
}

export interface TimeSeriesPoint {
  tempo: string
  tensao: number
  limite_superior: number
  limite_inferior: number
  anomalia: boolean
  tipo_anomalia?: string | null
  severidade?: string | null
}

export interface CleaningSummary {
  linhas_originais: number
  linhas_limpas: number
  outliers_removidos: number
  timestamps_normalizados: number
  valores_nulos_imputados: number
  tempo_parse_ms?: number
  multiplicador_iqr?: number
  protocolo_detectado?: string
  frequencia_amostragem?: string
}

export type AnalysisStatus = 'processando' | 'concluida' | 'erro'

export interface AnaliseRecord extends RecordModel {
  usuario_id: string
  log_id?: string
  nome: string
  status: AnalysisStatus
  tempo_processamento_s: number
  precisao_modelo: number
  resumo_limpeza?: CleaningSummary
  anomalias?: AnomalyItem[]
  dados_serie_temporal?: TimeSeriesPoint[]
  ai_resumo?: string
  criado: string
  atualizado: string
}

export interface RelatorioRecord extends RecordModel {
  usuario_id: string
  analise_id: string
  titulo: string
  conteudo: string
  criado: string
  atualizado: string
}
