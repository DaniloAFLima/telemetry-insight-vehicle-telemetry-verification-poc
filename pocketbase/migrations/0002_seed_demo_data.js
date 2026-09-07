migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const logsCol = app.findCollectionByNameOrId('logs')
    const analisesCol = app.findCollectionByNameOrId('analises')
    const relatoriosCol = app.findCollectionByNameOrId('relatorios')

    // 1. Seed user: danilolima45@hotmail.com
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', 'danilolima45@hotmail.com')
    } catch (_) {
      userRecord = new Record(usersCol)
      userRecord.setEmail('danilolima45@hotmail.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Danilo Lima')
      app.save(userRecord)
    }

    // 2. Seed demo log
    let logRecord
    try {
      logRecord = app.findFirstRecordByData('logs', 'nome_arquivo', 'demo_can_log.asc')
    } catch (_) {
      logRecord = new Record(logsCol)
      logRecord.set('usuario_id', userRecord.id)
      logRecord.set('nome_arquivo', 'demo_can_log.asc')
      logRecord.set('formato', 'can_lin')
      logRecord.set('linhas_processadas', 1250)
      logRecord.set('anomalias_detectadas', 4)
      app.save(logRecord)
    }

    // 3. Seed demo analysis
    let analiseRecord
    try {
      analiseRecord = app.findFirstRecordByData(
        'analises',
        'nome',
        'Análise Demo — Telemetria CAN/LIN (Bus 1)',
      )
    } catch (_) {
      analiseRecord = new Record(analisesCol)
      analiseRecord.set('usuario_id', userRecord.id)
      analiseRecord.set('log_id', logRecord.id)
      analiseRecord.set('nome', 'Análise Demo — Telemetria CAN/LIN (Bus 1)')
      analiseRecord.set('status', 'concluida')
      analiseRecord.set('tempo_processamento_s', 2.4)
      analiseRecord.set('precisao_modelo', 0.87)
      analiseRecord.set('resumo_limpeza', {
        linhas_originais: 1250,
        linhas_limpas: 1242,
        outliers_removidos: 8,
        timestamps_normalizados: 1250,
        valores_nulos_imputados: 12,
        tempo_parse_ms: 140,
      })

      const demoAnomalias = [
        {
          id: 'ano-1',
          timestamp: '00:01:23.410',
          canal: 'CAN1_ECU_BattVolt',
          tipo: 'Pico de Tensão',
          severidade: 'Crítica',
          confianca: 0.94,
          valor_medido: 16.85,
          esperado_intervalo: '11.8V - 14.4V',
          descricao:
            'Pico anômalo de 16.85V detectado no barramento principal de alimentação da ECU.',
        },
        {
          id: 'ano-2',
          timestamp: '00:02:45.120',
          canal: 'CAN1_WheelSpeed_FL',
          tipo: 'Falha de Sincronização',
          severidade: 'Alta',
          confianca: 0.89,
          valor_medido: 0.0,
          esperado_intervalo: 'Delta t < 20ms',
          descricao:
            'Atraso no pacote de telemetria CAN com perda de frame de sincronismo de roda.',
        },
        {
          id: 'ano-3',
          timestamp: '00:04:12.800',
          canal: 'CAN1_MotorTemp_Sens',
          tipo: 'Valor Fora do Intervalo',
          severidade: 'Média',
          confianca: 0.85,
          valor_medido: 118.2,
          esperado_intervalo: '60.0°C - 95.0°C',
          descricao:
            'Temperatura térmica do motor excedeu o envelope nominal de verificação operacional.',
        },
        {
          id: 'ano-4',
          timestamp: '00:06:05.350',
          canal: 'LIN_SteeringAngle_Sensor',
          tipo: 'Ruído Excessivo',
          severidade: 'Baixa',
          confianca: 0.81,
          valor_medido: 4.8,
          esperado_intervalo: 'SNR > 18dB',
          descricao:
            'Flutuação de alta frequência no sinal de ângulo de esterçamento superior ao limiar IQR.',
        },
      ]
      analiseRecord.set('anomalias', demoAnomalias)

      // Realistic time series points
      const timeSeries = []
      const baseVoltage = 12.6
      for (let i = 0; i <= 24; i++) {
        const t = (i * 15).toString().padStart(3, '0') + 's'
        let val = +(baseVoltage + Math.sin(i * 0.4) * 0.35 + (i % 3 === 0 ? 0.1 : -0.1)).toFixed(2)
        let isAnomaly = false
        let anomalyType = null
        let anomalySev = null

        if (i === 5) {
          val = 16.85
          isAnomaly = true
          anomalyType = 'Pico de Tensão'
          anomalySev = 'Crítica'
        } else if (i === 11) {
          val = 10.1
          isAnomaly = true
          anomalyType = 'Falha de Sincronização'
          anomalySev = 'Alta'
        } else if (i === 17) {
          val = 14.9
          isAnomaly = true
          anomalyType = 'Valor Fora do Intervalo'
          anomalySev = 'Média'
        } else if (i === 22) {
          val = 13.95
          isAnomaly = true
          anomalyType = 'Ruído Excessivo'
          anomalySev = 'Baixa'
        }

        timeSeries.push({
          tempo: t,
          tensao: val,
          limite_superior: 14.4,
          limite_inferior: 11.8,
          anomalia: isAnomaly,
          tipo_anomalia: anomalyType,
          severidade: anomalySev,
        })
      }
      analiseRecord.set('dados_serie_temporal', timeSeries)
      app.save(analiseRecord)
    }

    // 4. Seed demo report
    try {
      app.findFirstRecordByData(
        'relatorios',
        'titulo',
        'Relatório de Verificação — Telemetria CAN/LIN (Bus 1)',
      )
    } catch (_) {
      const relatorioRecord = new Record(relatoriosCol)
      relatorioRecord.set('usuario_id', userRecord.id)
      relatorioRecord.set('analise_id', analiseRecord.id)
      relatorioRecord.set('titulo', 'Relatório de Verificação — Telemetria CAN/LIN (Bus 1)')
      relatorioRecord.set(
        'conteudo',
        `# RELATÓRIO DE VERIFICAÇÃO DE TELEMETRIA VEICULAR
POC GlobalLogic — Measurement Analytics Tool
Gerado em: 2026-09-07 | Status: Concluído com Anomalias

## Metadados da Execução
- **Arquivo de Origem:** demo_can_log.asc
- **Protocolo/Formato:** CAN/LIN (Automotivo)
- **Linhas Analisadas:** 1.250 linhas
- **Linhas Válidas Limpas:** 1.242 linhas
- **Outliers Tratados (IQR):** 8 amostras
- **Tempo de Execução:** 2.4s
- **Precisão Estimada do Classificador:** 87%

## Resumo das Anomalias
Total de anomalias detectadas: 4 eventos (~0.32% do volume de quadros)
- **Crítica (1):** Pico de Tensão (16.85V no CAN1_ECU_BattVolt)
- **Alta (1):** Falha de Sincronização (perda de frame de roda)
- **Média (1):** Valor Fora do Intervalo (CAN1_MotorTemp_Sens a 118.2°C)
- **Baixa (1):** Ruído Excessivo (LIN_SteeringAngle_Sensor)

## Conclusão da Verificação de Software
O módulo de potência apresentou transitório severo de tensão aos 00:01:23, sugerindo comutação indutiva descalibrada. Recomenda-se revisão no driver de gerenciamento de energia da ECU.`,
      )
      app.save(relatorioRecord)
    }
  },
  (app) => {
    // Rollback logic
    try {
      const rel = app.findFirstRecordByData(
        'relatorios',
        'titulo',
        'Relatório de Verificação — Telemetria CAN/LIN (Bus 1)',
      )
      app.delete(rel)
    } catch (_) {}
    try {
      const ana = app.findFirstRecordByData(
        'analises',
        'nome',
        'Análise Demo — Telemetria CAN/LIN (Bus 1)',
      )
      app.delete(ana)
    } catch (_) {}
    try {
      const lg = app.findFirstRecordByData('logs', 'nome_arquivo', 'demo_can_log.asc')
      app.delete(lg)
    } catch (_) {}
  },
)
