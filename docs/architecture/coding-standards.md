# Coding Standards

[← Voltar para Índice](./index.md)

## Padrões de Código para Sistema OEE

### 1. Nomenclatura

#### TypeScript/JavaScript
```typescript
// PascalCase para componentes, classes, tipos
export class OEECalculator {}
export interface ApontamentoParada {}
export type LinhaProducao = {}

// camelCase para variáveis, funções
const velocidadeNominal = 120;
function calcularDisponibilidade() {}

// SCREAMING_SNAKE_CASE para constantes
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
```

#### Database (PostgreSQL)
```sql
-- snake_case para tudo
CREATE TABLE linhas_producao ();
CREATE FUNCTION calcular_oee_lote();
CREATE VIEW vw_oee_por_linha;
```

### 2. Comentários e Documentação

#### Sempre Comentar em Português
```typescript
/**
 * Calcula o OEE de um lote de produção
 * 
 * @param loteId - ID do lote
 * @returns Objeto com Disponibilidade, Performance, Qualidade e OEE
 */
export function calcularOEELote(loteId: string): OEEResult {
  // Buscar apontamentos de parada do lote
  const paradas = getParadas(loteId);
  
  // Calcular tempo de operação (tempo disponível - paradas)
  const tempoOperacao = calcularTempoOperacao(paradas);
  
  // ...
}
```

#### Comentar Lógica de Negócio Complexa
```typescript
// IMPORTANTE: Pequenas paradas (< 10 min) afetam Performance, não Disponibilidade
// Conforme metodologia validada em docs/project/05-Metodologia-Calculo.md
if (duracaoParada < 10) {
  // Impacta Performance
  tempoOperacionalLiquido -= duracaoParada;
} else {
  // Impacta Disponibilidade
  tempoOperacao -= duracaoParada;
}
```

### 3. Estrutura de Arquivos

#### Um componente por arquivo
```typescript
// VelocimetroOEE.tsx
export function VelocimetroOEE({ oee, meta }: Props) {
  // ...
}

// Não misturar múltiplos componentes em um arquivo
// Exceção: subcomponentes pequenos e privados
```

#### Barrel Exports
```typescript
// components/graficos/index.ts
export { VelocimetroOEE } from './VelocimetroOEE';
export { GraficoPareto } from './GraficoPareto';
export { GraficoComponentesOEE } from './GraficoComponentesOEE';
```

### 4. Error Handling

```typescript
// SEMPRE capturar e logar erros
try {
  await sincronizarTOTVS();
} catch (error) {
  console.error('[TOTVS Sync] Erro ao sincronizar:', error);
  
  // Registrar no audit log
  await logError({
    service: 'totvs-sync',
    error: error.message,
    context: { timestamp: new Date() }
  });
  
  // Re-throw se crítico
  throw error;
}
```

### 5. TypeScript

#### Sempre Tipar
```typescript
// ✅ BOM
function calcularOEE(
  disponibilidade: number,
  performance: number,
  qualidade: number
): number {
  return disponibilidade * performance * qualidade;
}

// ❌ RUIM
function calcularOEE(d, p, q) {
  return d * p * q;
}
```

#### Usar Tipos Específicos
```typescript
// types/oee.ts
export interface ComponentesOEE {
  disponibilidade: number; // 0-100
  performance: number;     // 0-100
  qualidade: number;       // 0-100
  oee: number;            // 0-100
}

export interface ApontamentoParada {
  id: string;
  loteId: string;
  codigoParadaId: string;
  inicio: Date;
  fim: Date | null;
  duracao: number; // minutos
  operadorId: string;
}
```

### 6. Compliance ALCOA+

#### Sempre registrar contexto de auditoria
```typescript
// Incluir em todas as mutations
const auditContext = {
  userId: session.user.id,
  timestamp: new Date(),
  ip: request.ip,
  device: request.headers['user-agent']
};

await criarApontamento({
  ...dadosApontamento,
  created_by: auditContext.userId,
  created_at: auditContext.timestamp
});
```

### 7. Performance

#### Usar React.memo para componentes pesados
```typescript
export const GraficoPareto = React.memo(({ dados }: Props) => {
  // Renderização pesada de gráfico
});
```

#### Lazy Loading
```typescript
const DashboardOEE = lazy(() => import('./pages/DashboardOEE'));
const ConfiguracoesPage = lazy(() => import('./pages/Configuracoes'));
```

### 8. Testes

Ver **[testing-strategy.md](./testing-strategy.md)** para detalhes completos.

---

**Última Atualização:** 2025-10-25  
**Status:** Draft - Será refinado durante implementação
