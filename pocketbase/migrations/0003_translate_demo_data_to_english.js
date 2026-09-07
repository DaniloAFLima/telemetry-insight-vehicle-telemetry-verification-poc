migrate(
  (app) => {
    const demoAnomaliasEn = JSON.stringify([
      {
        id: 'ano-1',
        timestamp: '00:01:23.410',
        canal: 'CAN1_ECU_BattVolt',
        tipo: 'Voltage Spike',
        severidade: 'Critical',
        confianca: 0.94,
        valor_medido: 16.85,
        esperado_intervalo: '11.8V - 14.4V',
        descricao:
          'Anomalous voltage spike of 16.85V detected on the primary ECU power delivery rail.',
      },
      {
        id: 'ano-2',
        timestamp: '00:02:45.120',
        canal: 'CAN1_WheelSpeed_FL',
        tipo: 'Sync Loss',
        severidade: 'High',
        confianca: 0.89,
        valor_medido: 0.0,
        esperado_intervalo: 'Delta t < 20ms',
        descricao: 'Telemetry packet delay with dropped frame on front-left wheel speed sensor.',
      },
      {
        id: 'ano-3',
        timestamp: '00:04:12.800',
        canal: 'CAN1_MotorTemp_Sens',
        tipo: 'Out of Range',
        severidade: 'Medium',
        confianca: 0.85,
        valor_medido: 118.2,
        esperado_intervalo: '60.0°C - 95.0°C',
        descricao: 'Motor core thermal reading exceeded operational verification envelope.',
      },
      {
        id: 'ano-4',
        timestamp: '00:06:05.350',
        canal: 'LIN_SteeringAngle_Sensor',
        tipo: 'High Noise',
        severidade: 'Low',
        confianca: 0.81,
        valor_medido: 4.8,
        esperado_intervalo: 'SNR > 18dB',
        descricao:
          'High-frequency oscillation in steering angle signal exceeding IQR filter threshold.',
      },
    ])

    const timeSeriesEn = []
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
        anomalyType = 'Voltage Spike'
        anomalySev = 'Critical'
      } else if (i === 11) {
        val = 10.1
        isAnomaly = true
        anomalyType = 'Sync Loss'
        anomalySev = 'High'
      } else if (i === 17) {
        val = 14.9
        isAnomaly = true
        anomalyType = 'Out of Range'
        anomalySev = 'Medium'
      } else if (i === 22) {
        val = 13.95
        isAnomaly = true
        anomalyType = 'High Noise'
        anomalySev = 'Low'
      }

      timeSeriesEn.push({
        tempo: t,
        tensao: val,
        limite_superior: 14.4,
        limite_inferior: 11.8,
        anomalia: isAnomaly,
        tipo_anomalia: anomalyType,
        severidade: anomalySev,
      })
    }
    const timeSeriesEnStr = JSON.stringify(timeSeriesEn)

    const resumoLimpezaStr = JSON.stringify({
      linhas_originais: 1250,
      linhas_limpas: 1242,
      outliers_removidos: 8,
      timestamps_normalizados: 1250,
      valores_nulos_imputados: 12,
      tempo_parse_ms: 140,
      multiplicador_iqr: 2.5,
      protocolo_detectado: 'CAN 2.0B / LIN 2.2',
      frequencia_amostragem: '50 Hz (20ms)',
    })

    const reportContentEn = `# VEHICLE TELEMETRY VERIFICATION REPORT
GlobalLogic POC — Measurement Analytics Tool
Generated on: 2026-09-07 | Status: Completed with Anomalies

## Execution Metadata
- **Source File:** demo_can_log.asc
- **Protocol/Format:** CAN/LIN (Automotive)
- **Analyzed Frames:** 1,250 frames
- **Valid Cleaned Frames:** 1,242 frames
- **Filtered Outliers (IQR):** 8 samples
- **Execution Time:** 2.4s
- **Classifier Estimated Precision:** 87%

## Anomalies Summary
Total anomalies detected: 4 events (~0.32% of total frame volume)
- **Critical (1):** Voltage Spike (16.85V on CAN1_ECU_BattVolt)
- **High (1):** Sync Loss (wheel speed sensor frame drop)
- **Medium (1):** Out of Range (CAN1_MotorTemp_Sens at 118.2°C)
- **Low (1):** High Noise (LIN_SteeringAngle_Sensor jitter)

## Software Verification Conclusion
The powertrain power module exhibited a severe transient voltage spike at 00:01:23, indicating uncalibrated inductive switching. Revision of the ECU power management driver and filter parameters is recommended before firmware sign-off.`

    // Direct SQL update to ensure changes apply directly
    app
      .db()
      .newQuery(
        'UPDATE analises SET nome = {:nome}, anomalias = {:anomalias}, dados_serie_temporal = {:serie}, resumo_limpeza = {:resumo}',
      )
      .bind({
        nome: 'Demo Analysis — CAN/LIN Telemetry (Bus 1)',
        anomalias: demoAnomaliasEn,
        serie: timeSeriesEnStr,
        resumo: resumoLimpezaStr,
      })
      .execute()

    app
      .db()
      .newQuery('UPDATE relatorios SET titulo = {:titulo}, conteudo = {:conteudo}')
      .bind({
        titulo: 'Verification Report — CAN/LIN Telemetry (Bus 1)',
        conteudo: reportContentEn,
      })
      .execute()
  },
  (app) => {},
)
