import pb from '@/lib/pocketbase/client'
import type { LogRecord, LogFormat } from '@/types/telemetry'

export async function listLogs(page = 1, perPage = 50): Promise<LogRecord[]> {
  const result = await pb.collection('logs').getList<LogRecord>(page, perPage, {
    sort: '-criado',
  })
  return result.items
}

export async function createLog(data: {
  nome_arquivo: string
  formato: LogFormat
  file?: File | null
}): Promise<LogRecord> {
  const currentUserId = pb.authStore.record?.id
  if (!currentUserId) throw new Error('Usuário não autenticado.')

  const formData = new FormData()
  formData.append('usuario_id', currentUserId)
  formData.append('nome_arquivo', data.nome_arquivo)
  formData.append('formato', data.formato)
  formData.append('linhas_processadas', '0')
  formData.append('anomalias_detectadas', '0')

  if (data.file) {
    formData.append('arquivo', data.file)
  }

  const record = await pb.collection('logs').create<LogRecord>(formData)
  return record
}

export async function deleteLog(id: string): Promise<boolean> {
  return await pb.collection('logs').delete(id)
}
