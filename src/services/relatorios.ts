import pb from '@/lib/pocketbase/client'
import type { RelatorioRecord } from '@/types/telemetry'

export async function listRelatorios(page = 1, perPage = 50): Promise<RelatorioRecord[]> {
  const result = await pb.collection('relatorios').getList<RelatorioRecord>(page, perPage, {
    sort: '-criado',
    expand: 'analise_id',
  })
  return result.items
}

export async function getRelatorioById(id: string): Promise<RelatorioRecord> {
  return await pb.collection('relatorios').getOne<RelatorioRecord>(id, {
    expand: 'analise_id',
  })
}

export async function deleteRelatorio(id: string): Promise<boolean> {
  return await pb.collection('relatorios').delete(id)
}
