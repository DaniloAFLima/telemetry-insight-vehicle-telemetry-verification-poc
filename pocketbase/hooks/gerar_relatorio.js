// Hook: gerar_relatorio.js
// Custom endpoint GET /backend/v1/relatorios/{id}
// Composes or returns the formatted verification report text directly from PocketBase

routerAdd(
  'GET',
  '/backend/v1/relatorios/{id}',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) {
      return e.json(401, { error: 'Unauthorized.' })
    }

    const reportId = e.request.pathValue('id')
    if (!reportId) {
      return e.json(400, { error: 'Report ID not provided.' })
    }

    try {
      const relatorio = $app.findRecordById('relatorios', reportId)
      if (relatorio.getString('usuario_id') !== authRecord.id) {
        return e.json(403, { error: 'Access denied to this report.' })
      }

      const conteudo = relatorio.getString('conteudo')
      const titulo = relatorio.getString('titulo')

      return e.json(200, {
        id: relatorio.id,
        titulo: titulo,
        conteudo: conteudo,
        criado: relatorio.getString('criado'),
        analise_id: relatorio.getString('analise_id'),
      })
    } catch (err) {
      return e.json(404, {
        error: 'Report not found: ' + (err ? err.message : String(err)),
      })
    }
  },
  $apis.requireAuth(),
)
