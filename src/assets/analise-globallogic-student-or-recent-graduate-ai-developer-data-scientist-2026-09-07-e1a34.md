# 📊 Relatório de Análise de Oportunidade

**Cargo:** Student or Recent Graduate (AI Developer & Data Scientist)
**Empresa:** GlobalLogic
**Data de Registro:** 07 de setembro de 2026

---

## 🎯 Diagnóstico Executivo de Conexão & Projeto

- **Veredito de Fit & Conexão:** ALTO
- **Score de Portfólio:** 8 / 10
- **Compatibilidade para Desenvolver Projeto:** ADAPTAR

> **Preview da Consultoria:**
> A vaga descreve um problema real de analisar telemetria e logs diagnósticos de veículos para gerar insights de verificação; sua experiência com telemetria de e‑bikes, Python, pipelines de dados e ML conecta diretamente ao core da posição; a dor pode ser abordada adaptando seu projeto Ecoride Assembly Management ou criando um protótipo específico, portanto recomenda‑se adaptar (ALTO fit).

---

## FASE 1 — Fit Profissional & Compatibilidade

**Veredito:** ALTO

| Critério        | Status | Avaliação Detalhada & Justificativa                                                                                                                                                                                                                                                                                     |
| :-------------- | :----: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hard Skills** |  ALTO  | A vaga exige "Solid foundational programming skills in Python" e "Ability to write scripts to parse, filter, and format raw files (like CSVs or text logs)". O candidato possui Python avançado, Pandas, NumPy, Scikit‑learn e experiência comprovada em scripts de ingestão e limpeza de dados, superando o requisito. |
| **Experiência** | MÉDIO  | A descrição indica "No professional experience required" e aceita portfólio acadêmico. O candidato tem mais de 15 anos de experiência industrial, o que excede o nível esperado, porém ainda cumpre o requisito de conhecimento prático; o alinhamento é aceitável, porém há risco de sobrequalificação.                |
| **Stack**       |  ALTO  | A stack requerida inclui Python e bibliotecas padrão de ML. O candidato já domina Python, Pandas, Scikit‑learn, além de Docker, Django e Git, que acrescentam valor ao desenvolvimento de UI e containerização mencionados na vaga.                                                                                     |
| **Setor**       |  ALTO  | Vaga focada em "vehicle telemetry and diagnostic logs". O candidato atuou como técnico de e‑bikes (Ecoride) trabalhando com telemetria de baterias e montagem industrial, proporcionando experiência direta em dados de veículos e protocolos de sensores.                                                              |
| **Senioridade** | MÉDIO  | A posição é de nível "entry‑level" para estudantes ou recém‑formados. O candidato possui senioridade senior/manager, o que pode gerar expectativa de autonomia além do escopo descrito; porém a senioridade pode ser aproveitada para acelerar entregas.                                                                |

### Justificativa do Veredito (Fase 1)

A maioria dos critérios (Hard Skills, Stack e Setor) apresenta alinhamento alto, enquanto Experiência e Senioridade são medianamente compatíveis devido ao perfil superqualificado. O fit global é forte, permitindo que o candidato entregue valor imediato e aproveite seu background industrial.

---

## FASE 2 — Engenharia Reversa do Problema

_Identificação da dor de negócio real descrita na vaga e sua reformulação em desafio técnico._

### 1. Problema de negócio central (dor real por trás da vaga)

A empresa necessita transformar telemetria de veículos e logs diagnósticos em insights de verificação de software, reduzindo tempo e esforço manual de validação. A vaga menciona explicitamente "turns vehicle telemetry and diagnostic logs into software verification insights", indicando uma dor clara de eficiência e qualidade nas etapas de teste de firmware/ECU.

### 2. Contexto/setor da empresa

GlobalLogic atua como parceiro digital para clientes automotivos, desenvolvendo ferramentas de engenharia de software. No contexto automotivo, a análise de dados de CAN/LIN é crítica para validar funcionalidades de veículos conectados, especialmente em projetos de prototipagem rápida e POCs para clientes que demandam agilidade.

### 3. Impacto esperado em 6 meses

Entrega de um POC funcional que automatiza a ingestão, limpeza e análise preliminar de logs, gerando relatórios de verificação que diminuam o tempo de revisão manual em até 40%. Métricas de sucesso:

- Redução de horas de análise manual (>30%).
- Precisão mínima de 80% em detecção de anomalias nos logs.
- Aceitação do protótipo por pelo menos 2 equipes de engenharia internas.

### 4. Problema reformulado como desafio técnico de dados/AI

Construir um pipeline Python que:

1. Ingesta arquivos de telemetria (CSV/text logs, potencialmente CAN).
2. Executa limpeza e normalização (tratamento de timestamps, outliers).
3. Aplica modelos de série temporal (ex.: Random Forest, SVM ou um LSTM simples) para classificação de eventos de falha.
4. Exponha resultados via API/Interface web simples (Flask ou Django).
5. Opcionalmente, utiliza um LLM básico para gerar resumos automatizados dos logs.

---

## FASE 3 — Valor para Portfólio & Compatibilidade de Projeto

- **Score de Portfólio:** 8 / 10
- **Recomendação Final:** **ADAPTAR**

### Checklist de Critérios de Portfólio

- [x] Problema de negócio real identificado
- [x] Conexão setorial (telemetria veicular) comprovada
- [x] Alinhamento de stack técnico (Python, ML, Docker)
- [x] Viabilidade de adaptar projeto existente

### Justificativa da Pontuação e Recomendação

A vaga apresenta uma dor de negócio clara e há forte correspondência setorial e de stack. O projeto "Ecoride Assembly Management" já contém ingestão de telemetria, pipeline de limpeza e UI Dockerizada, podendo ser adaptado rapidamente para lidar com logs de veículos e incluir um modelo de classificação. Adaptar esse projeto maximiza o retorno de investimento de tempo, gera portfólio relevante e atende às expectativas de entrega curta.

---

## FASE 4 — Plano de Projeto Estratégico

### Nome do Projeto: Telemetry Insight POC for Vehicle Verification

**Objetivo do Projeto:**
Entregar um protótipo end‑to‑end que ingere logs CAN/LIN, limpa e normaliza os dados, gera classificações de anomalias e apresenta resultados em uma UI web simples, demonstrando viabilidade de automação de verificação de software veicular.

### Stack Tecnológica

`Python 3.10` • `Pandas, NumPy` • `Scikit‑learn (modelos de classificação temporal)` • `Docker (containerização)` • `Flask (API/Interface web)` • `Git (controle de versão)` • `Jupyter Notebook (exploração e documentação)`

### Entregáveis Tangíveis

- Script de ingestão e limpeza de logs (arquivo .py)
- Modelo de classificação treinado e notebook de validação
- API REST Flask que aceita arquivos de log e devolve relatório JSON
- Interface web mínima (HTML/CSS + JavaScript) para upload e visualização de resultados
- Documentação completa (README, instruções de deploy Docker, relatório de métricas)

### Roadmap de Execução

#### Semana 1: Levantamento de requisitos e coleta de amostras de logs

Reunir exemplos de logs CAN/LIN (simulados ou públicos), definir esquema de dados, criar repositório Git e configurar ambiente Docker.

#### Semana 2: Desenvolvimento do pipeline de ingestão e limpeza

Implementar parser genérico para CSV/text, normalizar timestamps, tratar valores ausentes e gerar dataframe padronizado.

#### Semana 3: Prototipagem do modelo de classificação

Treinar modelo simples (RandomForest ou SVM) usando rótulos sintéticos, avaliar precisão e ajustar hiperparâmetros; documentar performance em notebook.

#### Semana 4: Criação da API Flask e UI básica

Expor endpoint `/predict` que recebe arquivo de log, executa pipeline e retorna JSON; desenvolver página de upload e visualização de resultados.

#### Semana 5: Testes, documentação e entrega

Executar testes de integração, gerar relatório de métricas (tempo de processamento, acurácia), escrever README detalhado e preparar imagem Docker para entrega.

### 🌟 Diferencial Estratégico do Candidato

> A experiência pré‑existente com telemetria de e‑bikes (captura de sensores, análise de baterias) permite acelerar a fase de ingestão e limpeza, enquanto o projeto Django+Docker já demonstra capacidade de entregar UI containerizada, diferenciando o candidato como especialista em soluções de dados industriais aplicáveis ao setor automotivo.

### 🎯 Talking Points para Entrevistas

- "Como a experiência em telemetria de e‑bikes trouxe insights sobre padrões de sinal e tratamento de ruído que são diretamente aplicáveis a logs CAN/LIN."
- "Projeto Ecoride Assembly Management como prova de entrega de pipeline completo (ETL, UI, Docker) em ambiente industrial."
- "Capacidade de combinar ML tradicional com LLM para gerar relatórios automatizados de diagnóstico, alinhado ao objetivo de “prompt engineering” da vaga."

---

## FASE 5 — Ações Imediatas Priorizadas

1. Atualizar o portfólio online incluindo a nova artefato "Telemetry Insight POC" com repositório Git público, destacando ligação ao problema de telemetria veicular.
2. Redigir um cover letter customizado para GlobalLogic enfatizando experiência em telemetria, pipelines Python e entregas rápidas de POCs.
3. Conectar-se com recrutadores/hiring managers da GlobalLogic no LinkedIn, compartilhando o link do projeto e solicitando breve conversa.
4. Preparar um pitch de 2 minutos para entrevista técnica, focando nos 3 talking points acima e nos resultados mensuráveis do POC (ex.: redução de 40% no tempo de análise).
5. Agendar tempo de estudo rápido sobre protocolos CAN/LIN (curso online ou documentação) para alinhar terminologia ao conversar com a equipe.

---

## 📄 Apêndice: Descrição Original da Vaga

```
We are seeking an enthusiastic Student or Recent Graduate (AI Developer & Data Scientist) to support the development of our AI-based Measurement Analytics Tool. In this entry-level role, you will have the unique opportunity to apply your academic knowledge to real-world challenges, helping to build and refine a functional Proof of Concept (POC) that turns vehicle telemetry and diagnostic logs into software verification insights. Working under the direct mentorship of senior architects, you will help implement basic ML pipelines, data cleaning scripts, and prototype user interfaces. This role is highly learning-oriented, designed for individuals eager to grow their skills in a professional automotive data science environment.

Requirements


Experience Level: No professional experience required. Strong portfolio of academic coursework, university lab projects, github repositories, hackathons, or personal projects demonstrating hands-on Python development.
Core Technical Stack: Solid foundational programming skills in Python, with exposure to standard libraries through coursework or projects.
Basic ML Concepts: Academic exposure to machine learning fundamentals, such as time-series analysis, clustering algorithms, or introductory Natural Language Processing (NLP).
Data Manipulation: Ability to write scripts to parse, filter, and format raw files (like CSVs or text logs).
Aptitude & Passion: High curiosity, strong problem-solving skills, and a keen interest in learning vehicle systems, automotive protocols (e.g., CAN, LIN), or diagnostic logs.
Education: Currently pursuing or recently completed a Bachelor’s (B.Sc.) or Master’s (M.Sc.) degree in Computer Science, Data Science, Electrical/Software Engineering, or a related quantitative field.


Job responsibilities


AI/ML Pipeline & Development Support: Assist with the development, testing, and documentation of data-processing pipelines and machine learning components optimized for vehicle datasets.
Data Cleaning & Exploratory Analysis: Help inspect, clean, and structure text-based diagnostic logs and numerical telemetry streams (such as bus logs and sensor measurements) for analysis.
Model Testing & Prototyping: Support the implementation and testing of baseline analytical models (including time-series classification, clustering, or prompt engineering for basic NLP/LLM assistants).
UI Prototyping & Coding: Write clean, readable, and well-documented Python code. Assist in building simple web interfaces or APIs to help package these analytical tools.
Technical Collaboration & Learning: Actively participate in team syncs, gather engineering requirements under guidance, and learn the fundamentals of vehicle software systems from domain experts.


What we offer

Empowering Projects: With 500+ clients spanning diverse industries and domains, we provide an exciting opportunity to contribute to groundbreaking projects that leverage cutting-edge technologies. As a team, we engineer digital products that positively impact people’s lives.

Empowering Growth: We foster a culture of continuous learning and professional development. Our dedication is to provide timely and comprehensive assistance for every consultant through our dedicated Learning & Development team, ensuring their continuous growth and success.

DE&I Matters: At GlobalLogic, we deeply value and embrace diversity. We are dedicated to providing equal opportunities for all individuals, fostering an inclusive and empowering work environment.

Career Development: Our corporate culture places a strong emphasis on career development, offering abundant opportunities for growth. Regular interactions with our teams ensure their engagement, motivation, and recognition. We empower our team members to pursue their career goals with confidence and enthusiasm.

Comprehensive Benefits: In addition to equitable compensation, we provide a comprehensive benefits package that prioritizes the overall well-being of our consultants. We genuinely care about their health and strive to create a positive work environment.

Flexible Opportunities: At GlobalLogic, we prioritize work-life balance by offering flexible opportunities tailored to your lifestyle. Explore relocation and rotation options for diverse cultural and professional experiences in different countries with our company.

About GlobalLogic

GlobalLogic, a Hitachi Group Company, is a trusted digital engineering partner to the world’s largest and most forward-thinking companies. Since 2000, we’ve been at the forefront of the digital revolution – helping create some of the most innovative and widely used digital products and experiences. Today we continue to collaborate with clients in transforming businesses and redefining industries through intelligent products, platforms, and services.
```
