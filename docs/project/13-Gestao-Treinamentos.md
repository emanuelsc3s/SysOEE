# Atividade 13 - Gestão de Treinamentos de Operadores

## Objetivo
Estabelecer a integração entre o cadastro de operadores e o registro de treinamentos em Procedimentos Operacionais Padrão (POPs), garantindo que somente operadores qualificados possam executar atividades críticas no sistema OEE SicFar, em conformidade com as Boas Práticas de Fabricação (BPF).

## Justificativa
Na indústria farmacêutica, a execução de atividades por pessoal não qualificado representa um desvio crítico de BPF e pode resultar em:
- Não conformidades em auditorias regulatórias (ANVISA, FDA, etc.)
- Comprometimento da integridade dos dados (ALCOA+)
- Riscos à qualidade do produto e segurança do paciente
- Invalidação de lotes produzidos

O sistema deve garantir rastreabilidade completa de **quem executou** (Atribuível) e **se estava qualificado** para executar a atividade.

## Contexto Regulatório

### Princípios ALCOA+ Aplicáveis

#### A - Atribuível
Todo registro no sistema deve estar vinculado a um operador identificado e qualificado. O sistema deve armazenar:
- ID do operador
- ID do treinamento vigente no momento da execução
- Data/hora da execução

#### C - Contemporâneo
Treinamentos devem ser registrados no momento da conclusão e validação deve ocorrer em tempo real durante apontamentos.

#### + Completo
Registros de treinamento devem incluir:
- POP/procedimento treinado
- Data de conclusão
- Data de validade (quando aplicável)
- Instrutor responsável
- Avaliação de eficácia (quando aplicável)

### Requisitos BPF
- **RDC 301/2019 (ANVISA)**: Pessoal deve ser qualificado para realizar as atividades designadas
- **21 CFR Part 211 (FDA)**: Training requirements for personnel
- **ICH Q7**: Good Manufacturing Practice Guide for Active Pharmaceutical Ingredients

## Estrutura de Treinamentos

### Hierarquia de Treinamentos

```
Procedimento Operacional Padrão (POP)
  ├─ POP-PROD-001: Operação de Envasadora Bottelpack
  ├─ POP-PROD-002: Registro de Paradas em Diário de Bordo
  ├─ POP-PROD-003: Apontamento de Produção no SicFar
  ├─ POP-PROD-004: Controle em Processo - pH
  ├─ POP-QUAL-001: Abertura de Evento de Desvio
  └─ ...
```

### Tipos de Treinamento

#### 1. Treinamento Inicial
- Realizado na admissão ou mudança de função
- Inclui avaliação teórica e prática
- Validade: Indefinida ou conforme criticidade

#### 2. Treinamento de Reciclagem
- Periodicidade definida por POP (ex: anual)
- Reforço de conhecimentos e atualização de mudanças
- Validade: 12 meses (padrão) ou conforme definido

#### 3. Treinamento de Requalificação
- Após desvio relacionado à falta de conhecimento
- Após mudança significativa no procedimento
- Após período prolongado sem execução da atividade

## Vinculação Operador × Treinamento × Atividade

### Matriz de Competências

| Atividade no SicFar | POP Requerido | Setor | Validade |
|---------------------|---------------|-------|----------|
| Registrar Parada | POP-PROD-002 | Todos | 12 meses |
| Apontar Produção (Envase) | POP-PROD-003 + POP específico da linha | Por linha | 12 meses |
| Apontar Produção (Embalagem) | POP-PROD-003 + POP específico da linha | Por linha | 12 meses |
| Finalizar Parada | POP-PROD-002 | Todos | 12 meses |
| Movimentar OP no Kanban | POP-PROD-005 | Todos | 12 meses |
| Abrir Evento de Desvio | POP-QUAL-001 | Todos | 12 meses |
| Registrar Controle em Processo | POP específico por controle | Por setor | 6 meses |

**Nota**: POPs específicos devem ser definidos em conjunto com Qualidade e Produção.

## Requisitos do Sistema

### 1. Cadastro de Treinamentos

#### Informações Mínimas
- **ID do Treinamento**: Identificador único
- **Código POP**: Ex: POP-PROD-002
- **Nome do POP**: Ex: "Registro de Paradas em Diário de Bordo"
- **Tipo**: Inicial | Reciclagem | Requalificação
- **Setor/Linha**: Se aplicável (ou "Todos")
- **Validade em Meses**: null (indefinido) ou número inteiro
- **Ativo**: Sim/Não

#### Registro de Conclusão de Treinamento
- **ID do Operador**: Usuário treinado
- **ID do Treinamento**: Treinamento concluído
- **Data de Conclusão**: Data em que o treinamento foi concluído
- **Data de Validade**: Data de conclusão + validade em meses (calculado automaticamente)
- **Instrutor**: Usuário responsável pelo treinamento
- **Resultado**: Aprovado | Reprovado
- **Observações**: Campo livre para notas

### 2. Validação em Tempo Real

Ao executar uma atividade no sistema, o SicFar deve:

1. **Identificar o operador logado**
2. **Identificar a atividade sendo executada** (ex: Registrar Parada)
3. **Buscar treinamentos requeridos** para essa atividade
4. **Validar se o operador possui treinamento vigente**:
   - Treinamento existe?
   - Status = Aprovado?
   - Data de validade não expirada? (se aplicável)
   - Setor/linha corresponde? (se aplicável)
5. **Permitir ou Bloquear a execução**

### 3. Comportamento do Sistema

#### Operador Qualificado ✅
- Sistema permite execução normalmente
- Registro de auditoria inclui ID do treinamento vigente

#### Operador Não Qualificado ❌
- Sistema **bloqueia** a execução da atividade
- Exibe mensagem clara:
  ```
  ⚠️ ACESSO NEGADO

  Você não possui treinamento vigente para executar esta atividade.

  Atividade: Registrar Parada de Produção
  Treinamento Requerido: POP-PROD-002

  Entre em contato com seu supervisor ou com Qualidade.
  ```

#### Treinamento Próximo do Vencimento ⚠️
- Sistema permite execução, mas exibe aviso:
  ```
  ⚠️ ATENÇÃO: Treinamento próximo do vencimento

  Seu treinamento em POP-PROD-002 vence em 15 dias (31/12/2025).
  Procure seu supervisor para agendar reciclagem.
  ```
- Limite: 30 dias antes do vencimento

### 4. Relatórios e Rastreabilidade

#### Relatório de Treinamentos por Operador
- Lista todos os treinamentos de um operador
- Status: Vigente | Vencido | Pendente
- Próximos vencimentos

#### Relatório de Operadores por Treinamento
- Lista todos os operadores com determinado treinamento
- Permite identificar quem está apto para cada atividade

#### Relatório de Treinamentos Vencidos
- Lista operadores com treinamentos vencidos
- Crítico para planejamento de reciclagens

#### Auditoria de Bloqueios
- Registra todas as tentativas de acesso bloqueadas
- Útil para identificar necessidade de treinamentos

## Integração com Módulos Existentes

### Módulo de Operação

#### Apontamento de Paradas
- **Validação**: Ao abrir `ModalApontamentoParada.tsx`
- **Treinamento requerido**: POP-PROD-002
- **Bloqueio**: Se não qualificado, modal não abre e exibe alerta

#### Movimentação de OP no Kanban
- **Validação**: Ao movimentar OP entre fases
- **Treinamento requerido**: POP-PROD-005
- **Bloqueio**: Drag-and-drop desabilitado para operadores não qualificados

#### Conclusão de Etapas de Produção
- **Validação**: Ao registrar quantidades (Preparação, Envase, Embalagem)
- **Treinamento requerido**: POP específico da linha + POP-PROD-003
- **Bloqueio**: Campos desabilitados ou modal não abre

### Módulo de Qualidade

#### Abertura de Evento de Desvio
- **Validação**: Ao abrir modal de desvio
- **Treinamento requerido**: POP-QUAL-001
- **Bloqueio**: Modal não abre para operadores não qualificados

#### Controle em Processo
- **Validação**: Ao registrar resultado de controle
- **Treinamento requerido**: POP específico do controle
- **Bloqueio**: Registro não permitido

## Estrutura de Dados

### Interface: `Treinamento`

```typescript
export interface Treinamento {
  /** ID único do treinamento */
  id: string

  /** Código do POP (ex: POP-PROD-002) */
  codigo_pop: string

  /** Nome do procedimento */
  nome_pop: string

  /** Tipo de treinamento */
  tipo: 'inicial' | 'reciclagem' | 'requalificacao'

  /** Setor aplicável (null = todos) */
  setor_id?: string | null

  /** Linha aplicável (null = todas) */
  linha_id?: string | null

  /** Validade em meses (null = indefinido) */
  validade_meses?: number | null

  /** Status do treinamento */
  ativo: boolean

  /** Data de criação do cadastro */
  criado_em: string

  /** Usuário que criou o cadastro */
  criado_por: number
}
```

### Interface: `TreinamentoOperador`

```typescript
export interface TreinamentoOperador {
  /** ID único do registro */
  id: string

  /** ID do operador treinado */
  operador_id: number

  /** ID do treinamento */
  treinamento_id: string

  /** Data de conclusão do treinamento */
  data_conclusao: string

  /** Data de validade (calculado: data_conclusao + validade_meses) */
  data_validade?: string | null

  /** ID do instrutor */
  instrutor_id: number

  /** Resultado da avaliação */
  resultado: 'aprovado' | 'reprovado'

  /** Observações */
  observacoes?: string | null

  /** Data de registro */
  criado_em: string
}
```

### Interface: `ValidacaoTreinamento`

```typescript
export interface ValidacaoTreinamento {
  /** Operador está qualificado? */
  qualificado: boolean

  /** Treinamento encontrado */
  treinamento?: TreinamentoOperador

  /** Motivo de bloqueio (se não qualificado) */
  motivo_bloqueio?: string

  /** Treinamento vence em menos de 30 dias? */
  proximo_vencimento: boolean

  /** Dias restantes até vencimento (se aplicável) */
  dias_para_vencer?: number
}
```

## Fluxo de Validação

```
┌─────────────────────────────────────────┐
│ Operador tenta executar atividade      │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Sistema identifica:                     │
│ - ID do operador logado                 │
│ - Atividade sendo executada             │
│ - POP(s) requerido(s)                   │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Busca treinamentos do operador          │
│ WHERE operador_id = ? AND               │
│       treinamento_id IN (POPs requeridos)│
└───────────────┬─────────────────────────┘
                │
                ▼
        ┌───────┴────────┐
        │ Encontrado?    │
        └───┬────────┬───┘
            │ Não    │ Sim
            ▼        ▼
      ┌─────────┐  ┌────────────────┐
      │ BLOQUEIA│  │ Verifica status │
      └─────────┘  └───┬────────────┘
                       │
                ┌──────┴──────┐
                │ resultado = │
                │ 'aprovado'? │
                └──┬──────┬───┘
                   │ Não  │ Sim
                   ▼      ▼
             ┌─────────┐  ┌──────────────┐
             │ BLOQUEIA│  │ Verifica     │
             └─────────┘  │ validade     │
                          └───┬──────────┘
                              │
                    ┌─────────┴─────────┐
                    │ data_validade     │
                    │ > hoje?           │
                    └──┬──────────┬─────┘
                       │ Não      │ Sim
                       ▼          ▼
                 ┌─────────┐  ┌──────────┐
                 │ BLOQUEIA│  │ PERMITE  │
                 └─────────┘  └──────────┘
                              │
                    ┌─────────┴─────────┐
                    │ Vence em < 30d?   │
                    └──┬──────────┬─────┘
                       │ Sim      │ Não
                       ▼          ▼
                 ┌─────────┐  ┌──────────┐
                 │ AVISA   │  │ Executa  │
                 │ vencim. │  │ normal   │
                 └─────────┘  └──────────┘
```

## Implementação Recomendada

### Fase 1: Estrutura Base
- Criar tabelas/coleções no banco de dados
- Implementar interfaces TypeScript
- Criar serviço de validação de treinamentos

### Fase 2: Telas de Cadastro
- Tela de cadastro de treinamentos (POPs)
- Tela de registro de conclusão de treinamentos
- Relatórios básicos

### Fase 3: Integração com Módulos
- Integrar validação no módulo de Operação
- Integrar validação no módulo de Qualidade
- Testes de bloqueio e permissão

### Fase 4: Alertas e Notificações
- Implementar alertas de vencimento próximo
- Notificações para supervisores sobre vencimentos
- Dashboard de treinamentos

## Responsabilidades

### Qualidade
- Definir lista de POPs críticos
- Definir validade de cada treinamento
- Definir matriz de competências (atividade × POP)
- Validar eficácia dos treinamentos

### Recursos Humanos (RH)
- Cadastrar treinamentos concluídos no sistema
- Manter registros atualizados
- Agendar reciclagens

### Supervisores/Encarregados
- Acompanhar vencimentos de treinamentos da equipe
- Solicitar reciclagens com antecedência
- Autorizar execução de atividades por operadores qualificados

### TI
- Implementar lógica de validação
- Garantir performance das consultas
- Manter integridade dos dados

## Considerações Importantes

### Período de Transição
- Durante implantação do sistema, pode haver período de ajuste
- Sugestão: Modo "aviso" antes de ativar modo "bloqueio"
- Prazo sugerido: 30 dias de aviso antes de bloquear

### Treinamentos Legados
- Operadores já qualificados devem ter treinamentos migrados
- Carga inicial de dados crítica para evitar bloqueios indevidos

### Perfis de Acesso
- Administradores podem ter permissão especial de "override"
- Útil para situações emergenciais
- **Obrigatório**: Justificativa e aprovação registradas

### Backup em Papel
- Diário de Bordo Impresso continua como backup
- Em caso de falha do sistema, operação continua em papel
- Treinamento em registro manual permanece obrigatório

## Validação Necessária

### Stakeholders para Aprovação
1. **Qualidade** - Definir POPs críticos e validades
2. **Recursos Humanos** - Definir processo de registro de treinamentos
3. **Produção** - Validar matriz de competências
4. **Consultor Rafael Gusmão** - Validação técnica final

### Documentos Gerados
- Matriz de Competências (atividade × POP)
- Lista de POPs cadastrados no sistema
- Procedimento de Carga Inicial de Treinamentos
- Manual de Cadastro de Treinamentos no SicFar

## Conclusão

A integração entre operadores e registro de treinamentos é um requisito regulatório **não negociável** para indústria farmacêutica. O sistema OEE SicFar deve garantir que apenas pessoal qualificado execute atividades críticas, mantendo rastreabilidade completa para auditorias.

Esta funcionalidade fortalece os princípios ALCOA+ (especialmente **Atribuível**) e garante conformidade com BPF, protegendo a empresa de não conformidades regulatórias e garantindo a qualidade dos produtos fabricados.

**Prioridade de Implementação**: 🔴 ALTA (requisito regulatório)
