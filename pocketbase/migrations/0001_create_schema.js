migrate(
  (app) => {
    // 1. Collection: logs
    const logsCollection = new Collection({
      name: 'logs',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome_arquivo', type: 'text', required: true },
        {
          name: 'formato',
          type: 'select',
          required: true,
          values: ['auto', 'can_lin', 'csv'],
          maxSelect: 1,
        },
        {
          name: 'arquivo',
          type: 'file',
          maxSelect: 1,
          maxSize: 20971520,
          mimeTypes: ['text/csv', 'text/plain', 'application/octet-stream', 'text/x-log'],
        },
        { name: 'linhas_processadas', type: 'number', min: 0 },
        { name: 'anomalias_detectadas', type: 'number', min: 0 },
        { name: 'criado', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'atualizado', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_logs_usuario ON logs (usuario_id)',
        'CREATE INDEX idx_logs_criado ON logs (criado DESC)',
      ],
    })
    app.save(logsCollection)

    const logsId = logsCollection.id

    // 2. Collection: analises
    const analisesCollection = new Collection({
      name: 'analises',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'log_id',
          type: 'relation',
          required: false,
          collectionId: logsId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['processando', 'concluida', 'erro'],
          maxSelect: 1,
        },
        { name: 'tempo_processamento_s', type: 'number', min: 0 },
        { name: 'precisao_modelo', type: 'number', min: 0, max: 1 },
        { name: 'resumo_limpeza', type: 'json' },
        { name: 'anomalias', type: 'json' },
        { name: 'dados_serie_temporal', type: 'json' },
        { name: 'criado', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'atualizado', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_analises_usuario ON analises (usuario_id)',
        'CREATE INDEX idx_analises_status ON analises (status)',
        'CREATE INDEX idx_analises_criado ON analises (criado DESC)',
      ],
    })
    app.save(analisesCollection)

    const analisesId = analisesCollection.id

    // 3. Collection: relatorios
    const relatoriosCollection = new Collection({
      name: 'relatorios',
      type: 'base',
      listRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && usuario_id = @request.auth.id",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'analise_id',
          type: 'relation',
          required: true,
          collectionId: analisesId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'titulo', type: 'text', required: true },
        { name: 'conteudo', type: 'text', required: true },
        { name: 'criado', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'atualizado', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_relatorios_usuario ON relatorios (usuario_id)',
        'CREATE INDEX idx_relatorios_analise ON relatorios (analise_id)',
      ],
    })
    app.save(relatoriosCollection)
  },
  (app) => {
    try {
      const relatorios = app.findCollectionByNameOrId('relatorios')
      app.delete(relatorios)
    } catch (_) {}
    try {
      const analises = app.findCollectionByNameOrId('analises')
      app.delete(analises)
    } catch (_) {}
    try {
      const logs = app.findCollectionByNameOrId('logs')
      app.delete(logs)
    } catch (_) {}
  },
)
