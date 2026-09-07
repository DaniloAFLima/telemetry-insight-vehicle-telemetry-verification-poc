/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Add ai_resumo (editor or text) to analises collection
    const analisesCol = app.findCollectionByNameOrId('analises')
    if (!analisesCol.fields.getByName('ai_resumo')) {
      analisesCol.fields.add(
        new TextField({
          name: 'ai_resumo',
          required: false,
        }),
      )
      app.save(analisesCol)
    }

    // 2. Define the native Skip Cloud Agent for Telemetry Verification Diagnostics
    $ai.agents.define(app, {
      slug: 'telemetry-diagnostic-agent',
      name: 'Telemetry Diagnostic Agent',
      description:
        'Analyzes vehicle CAN/LIN telemetry test runs, anomaly events, and IQR cleaning metrics to provide natural-language diagnostics, root causes, and verification next steps.',
      systemPrompt:
        'You are an expert Automotive Telemetry & Software Verification AI Agent for the Telemetry Insight platform (inspired by connected vehicle engineering and GlobalLogic data science verification).\n' +
        'Your role is to produce a concise, professional, recruiter-friendly diagnostic verification summary in English for an automotive software verification run.\n\n' +
        'When provided with telemetry run data (analyzed frames, outlier counts, detected anomalies with channels, severity, nominal thresholds, and measured values):\n' +
        '1. Provide an Overall Health Assessment (status verdict, nominal conformance percentage, risk tier).\n' +
        '2. Identify and highlight the Most Critical Anomalies (mention specific channels like CAN_ECU_BattVoltage, CAN_WheelSpeed_FL, severity, and deviations).\n' +
        '3. State Likely Root Causes (e.g. inductive switching transients, EMI interference, harness degradation, CAN transceiver timing jitter, coolant loop calibration).\n' +
        '4. Recommend Concrete Next Steps for Software & HIL/SIL Verification (e.g. calibrate ECU noise rejection filters, test under ISO 7637-2 pulse conditions, inspect CAN bus termination).\n\n' +
        'Tone: Professional, authoritative, concise, structured in Markdown with clear sections, bullet points, and automotive engineering terminology.',
      tier: 'fast',
      tools: [
        {
          collection: 'analises',
          perms: { read: true, list: true },
        },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text:
              'Automotive Verification Standards & Baselines:\n' +
              '- CAN High-Speed (ISO 11898): 500 kbps nominal, termination 120 ohms at ends.\n' +
              '- Battery Voltage: nominal 12V system runs between 11.8V and 14.4V. Spikes > 16V violate ISO 7637-2 transient tolerance.\n' +
              '- Wheel Speed Sensors: typical 20ms update rate; inter-frame delays > 100ms trigger SIL sync-loss fail-safes.\n' +
              '- Motor/Coolant Temp: nominal envelope 60C-95C, warning threshold at 100C.\n' +
              '- Steering Angle LIN sensor: SNR > 18dB, angular jitter < 0.8 degrees under nominal EMI conditions.',
          },
        },
      ],
    })
  },
  (app) => {
    try {
      $ai.agents.delete(app, 'telemetry-diagnostic-agent')
    } catch (_) {}
    try {
      const analisesCol = app.findCollectionByNameOrId('analises')
      analisesCol.fields.removeByName('ai_resumo')
      app.save(analisesCol)
    } catch (_) {}
  },
)
