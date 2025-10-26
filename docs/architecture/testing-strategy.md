# Testing Strategy

[← Voltar para Índice](./index.md)

## Estratégia de Testes para Sistema OEE

### 1. Pirâmide de Testes

```
           /\
          /E2E\        ← Poucos, críticos
         /------\
        /  API   \     ← Moderados
       /----------\
      / Unit Tests \   ← Muitos, rápidos
     /--------------\
```

### 2. Testes Unitários

#### Escopo
- Funções de cálculo de OEE
- Validações de dados
- Formatadores e utilitários
- Componentes React isolados

#### Ferramentas
- **Jest** - Test runner
- **React Testing Library** - Testes de componentes
- **@testing-library/user-event** - Simulação de interações

#### Exemplos
```typescript
// oee-calculator.test.ts
describe('calcularOEE', () => {
  it('deve calcular OEE corretamente com valores válidos', () => {
    const result = calcularOEE({
      disponibilidade: 90,
      performance: 85,
      qualidade: 95
    });
    
    expect(result).toBeCloseTo(72.68); // 90% × 85% × 95%
  });
  
  it('deve retornar 0 se qualquer componente for 0', () => {
    const result = calcularOEE({
      disponibilidade: 0,
      performance: 85,
      qualidade: 95
    });
    
    expect(result).toBe(0);
  });
});
```

```typescript
// VelocimetroOEE.test.tsx
describe('VelocimetroOEE', () => {
  it('deve renderizar valor de OEE corretamente', () => {
    render(<VelocimetroOEE oee={75.5} meta={75} />);
    
    expect(screen.getByText('75.5%')).toBeInTheDocument();
  });
  
  it('deve mostrar zona verde quando OEE >= meta', () => {
    render(<VelocimetroOEE oee={80} meta={75} />);
    
    const gauge = screen.getByTestId('oee-gauge');
    expect(gauge).toHaveClass('zona-verde');
  });
});
```

### 3. Testes de Integração

#### Escopo
- Fluxos completos (apontamento → cálculo → dashboard)
- Integração com Supabase
- Sincronização offline → online
- Workflows de assinatura eletrônica

#### Ferramentas
- **Jest** + **Supertest** - Para APIs
- **Supabase Test Database** - Banco isolado

#### Exemplos
```typescript
// apontamento-parada.integration.test.ts
describe('Fluxo de Apontamento de Parada', () => {
  it('deve criar apontamento e atualizar OEE automaticamente', async () => {
    // 1. Criar apontamento
    const apontamento = await criarApontamentoParada({
      loteId: 'lote-123',
      codigoParadaId: 'parada-manutencao',
      inicio: new Date('2025-10-25T10:00:00'),
      fim: new Date('2025-10-25T11:30:00') // 90 min
    });
    
    expect(apontamento.id).toBeDefined();
    
    // 2. Verificar que trigger atualizou lote
    const lote = await getLote('lote-123');
    expect(lote.totalParadas).toBe(90); // minutos
    
    // 3. Verificar que OEE foi recalculado
    const oee = await getOEELote('lote-123');
    expect(oee.disponibilidade).toBeLessThan(100);
  });
});
```

### 4. Testes End-to-End (E2E)

#### Escopo
- Fluxos críticos de usuário
- Navegação entre telas
- Offline-first scenarios
- Assinatura de Diário de Bordo

#### Ferramentas
- **Playwright** ou **Cypress**

#### Cenários Críticos
```typescript
// e2e/apontamento-parada.spec.ts
test('Operador deve registrar parada contemporaneamente', async ({ page }) => {
  // Login como operador
  await page.goto('/login');
  await page.fill('[name="email"]', 'operador@farmace.com');
  await page.fill('[name="password"]', 'senha123');
  await page.click('button[type="submit"]');
  
  // Navegar para apontamento
  await page.goto('/apontamentos/parada');
  
  // Preencher formulário
  await page.selectOption('[name="linha"]', 'SPEP-ENV-A');
  await page.selectOption('[name="codigo_parada"]', 'MANUTENCAO-PREV');
  await page.fill('[name="observacoes"]', 'Troca de filtro programada');
  
  // Submeter
  await page.click('button[type="submit"]');
  
  // Verificar feedback
  await expect(page.locator('.toast-success')).toContainText('Apontamento registrado');
  
  // Verificar que aparece na lista
  await expect(page.locator('[data-testid="lista-apontamentos"]'))
    .toContainText('Troca de filtro programada');
});
```

### 5. Testes de Compliance (ALCOA+)

#### Validações Obrigatórias
- ✅ **Atribuível**: Todo registro tem `created_by`
- ✅ **Contemporâneo**: Timestamps automáticos
- ✅ **Original**: Audit trail preserva histórico
- ✅ **Exato**: Validações impedem dados inconsistentes
- ✅ **Completo**: Campos obrigatórios forçados

```typescript
// compliance.test.ts
describe('ALCOA+ Compliance', () => {
  it('deve registrar audit trail em updates', async () => {
    // Criar apontamento
    const apt = await criarApontamento(dados);
    
    // Atualizar
    await atualizarApontamento(apt.id, { observacoes: 'Atualizado' });
    
    // Verificar audit trail
    const audits = await getAuditLog('apontamentos_parada', apt.id);
    expect(audits).toHaveLength(1);
    expect(audits[0].campo).toBe('observacoes');
    expect(audits[0].valor_anterior).toBe('');
    expect(audits[0].valor_novo).toBe('Atualizado');
    expect(audits[0].usuario_id).toBeDefined();
  });
});
```

### 6. Testes de Performance

#### Cenários
- Dashboard com 1000+ apontamentos
- Cálculo de OEE para 37 linhas simultâneas
- Sincronização de 500 registros offline

#### Ferramentas
- **Lighthouse** - Performance frontend
- **k6** - Load testing

### 7. Coverage Goals

- **Funções de Cálculo:** 100% (crítico para validação)
- **Componentes React:** 80%
- **Workflows Backend:** 90%
- **Overall:** >= 80%

### 8. CI/CD Integration

#### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      
  coverage:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### 9. Test Data

#### Fixtures
Criar dados de teste realistas em `tests/fixtures/`:
- `setores.json`
- `linhas.json`
- `skus.json`
- `apontamentos-parada.json`

### 10. Validação com Consultor

Antes do MVP, validar:
- ✅ Fórmulas de OEE conferem com especificação
- ✅ Classificação de paradas está correta
- ✅ Gráficos mostram dados esperados
- ✅ Compliance ALCOA+ atendido

---

**Última Atualização:** 2025-10-25  
**Status:** Draft - Será refinado durante implementação
