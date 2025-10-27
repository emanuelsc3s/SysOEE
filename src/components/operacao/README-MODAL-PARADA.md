# Modal de Apontamento de Parada - Documentação

## 🎯 Objetivo

O **Modal de Apontamento de Parada** permite registrar paradas de produção de forma contemporânea, seguindo os princípios **ALCOA+** (Atribuível, Legível, Contemporâneo, Original, Exato, Completo, Consistente, Durável, Disponível).

## 📋 Funcionalidades Implementadas

### ✅ Hierarquia de Paradas (5 Níveis)

O modal implementa a hierarquia completa de classificação de paradas conforme especificação do projeto:

1. **Nível 1 - Classe de Parada** (obrigatório)
   - Estratégica
   - Planejada
   - Não Planejada

2. **Nível 2 - Grande Parada** (obrigatório)
   - Exemplos: Manutenção, Setup, Quebra/Falhas, Falta de Insumo, etc.

3. **Nível 3 - Apontamento** (condicional)
   - Exemplos: Preventiva, Mecânica, Elétrica, Material, etc.

4. **Nível 4 - Grupo** (condicional)
   - Exemplos: Programada, Equipamento, Sistema Elétrico, Matéria-Prima, etc.

5. **Nível 5 - Detalhamento** (condicional)
   - Exemplos: Extrusão/Sopro, Embalagem Primária, etc.

**Nota**: Os níveis 3, 4 e 5 são exibidos apenas se houver opções disponíveis na hierarquia selecionada.

### ✅ Registro Contemporâneo (ALCOA+)

- **Data e hora pré-preenchidas** com o momento atual
- **Detecção automática do turno** baseado na hora atual
- **Validação**: Não permite registro de data/hora futura
- **Tolerância**: 5 minutos para ajustes (conforme especificação)

### ✅ Campos do Formulário

**Obrigatórios:**
- Hierarquia de paradas (5 níveis)
- Data da parada
- Hora de início
- Turno

**Opcionais:**
- Observações (até 500 caracteres)

### ✅ Validações Implementadas

1. **Hierarquia completa**: Todos os níveis obrigatórios devem ser selecionados
2. **Data/hora válida**: Não pode ser futura
3. **Turno selecionado**: Obrigatório
4. **Código de parada**: Encontrado automaticamente baseado na hierarquia

### ✅ Integração com Supabase

- **Busca de códigos de parada** (globais ou específicos da linha)
- **Busca de turnos** ativos
- **Criação de apontamento** com auditoria ALCOA+
- **Modo mock** para desenvolvimento (USE_MOCK_DATA = true)

## 🏗️ Arquitetura

### Componentes Criados

```
src/
├── components/
│   └── operacao/
│       └── ModalApontamentoParada.tsx    # Modal principal
├── types/
│   └── parada.ts                         # Tipos TypeScript
├── services/
│   └── api/
│       └── parada.api.ts                 # API de paradas
├── data/
│   └── mockParadas.ts                    # Dados mock
└── lib/
    └── supabase.ts                       # Cliente Supabase
```

### Fluxo de Dados

```
OperacaoDetalheOP.tsx
    ↓ (clica botão "Parada")
    ↓
ModalApontamentoParada.tsx
    ↓ (carrega dados)
    ↓
parada.api.ts → buscarCodigosParada()
parada.api.ts → buscarTurnos()
    ↓ (usuário preenche)
    ↓
parada.api.ts → criarApontamentoParada()
    ↓
Supabase → tbapontamentoparada
    ↓
✅ Sucesso → Fecha modal + Mensagem
```

## 🚀 Como Usar

### 1. Acessar a Página de Detalhes da OP

```
http://localhost:8081/operacao/:numeroOP
```

### 2. Clicar no Botão "Parada"

O botão está localizado na seção de ações rápidas, com ícone de pause (⏸️).

### 3. Preencher o Formulário

1. **Selecione a Classe de Parada** (Nível 1)
2. **Selecione a Grande Parada** (Nível 2)
3. **Preencha os níveis seguintes** conforme disponível
4. **Verifique Data/Hora** (pré-preenchidas)
5. **Confirme o Turno** (detectado automaticamente)
6. **Adicione Observações** (opcional)

### 4. Registrar a Parada

Clique em **"Registrar Parada"** para salvar.

## 📊 Dados Mock (Desenvolvimento)

### Códigos de Parada Disponíveis

- **ESTR-001**: Parada Estratégica - Controle de Estoque
- **PLAN-MAN-PRE**: Manutenção Preventiva Programada
- **PLAN-SETUP**: Setup - Troca de Produto
- **PLAN-LIMPEZA**: Limpeza Programada CIP/SIP
- **NP-QUE-MEC**: Quebra Mecânica
- **NP-QUE-ELE**: Quebra Elétrica
- **NP-FAL-INS**: Falta de Insumo
- **NP-FAL-EMB**: Falta de Embalagem
- **PP-AJUSTE**: Pequeno Ajuste de Máquina (< 10 min)

### Turnos Disponíveis

- **1º Turno**: 06:00 - 14:00
- **2º Turno**: 14:00 - 22:00
- **3º Turno**: 22:00 - 06:00
- **Administrativo**: 08:00 - 17:00

## 🔧 Configuração

### Modo Mock (Desenvolvimento)

Por padrão, o sistema usa dados mock. Para alterar:

```typescript
// src/services/api/parada.api.ts
const USE_MOCK_DATA = true  // false para usar Supabase real
```

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📝 Princípios ALCOA+ Implementados

| Princípio | Implementação |
|-----------|---------------|
| **Atribuível** | Campo `criado_por_operador` registra quem fez o apontamento |
| **Legível** | Interface clara com labels descritivos |
| **Contemporâneo** | Data/hora pré-preenchidas com momento atual |
| **Original** | Registro direto no banco sem intermediários |
| **Exato** | Validações impedem dados incorretos |
| **Completo** | Hierarquia completa de 5 níveis obrigatória |
| **Consistente** | Sequência lógica de seleção (nível 1 → 2 → 3 → 4 → 5) |
| **Durável** | Armazenamento permanente no PostgreSQL |
| **Disponível** | Dados acessíveis para consulta e auditoria |

## ⚠️ Regras de Negócio

### Paradas < 10 minutos

Paradas com duração menor que 10 minutos afetam **Performance**, não **Disponibilidade**.

Exemplo: `PP-AJUSTE` tem `impacta_disponibilidade = false`

### Paradas Estratégicas

Paradas estratégicas **NÃO** entram no cálculo do tempo disponível para OEE.

Exemplo: `ESTR-001` tem `tipo_parada = 'ESTRATEGICA'`

### Contemporaneidade

- Tolerância de **5 minutos** para ajuste de data/hora
- Sistema valida que data/hora não seja futura
- Turno é detectado automaticamente baseado na hora

## 🎨 Responsividade

O modal é otimizado para:

- **Desktop**: Largura máxima 700px
- **Tablet de Produção**: Largura máxima 600px (classe `tab-prod`)
- **Mobile**: Largura adaptativa com scroll vertical

## 🔮 Próximos Passos

### Pendências (TODO)

1. **Integração com Autenticação**
   - Obter `usuarioId` real do contexto de autenticação
   - Substituir mock `usuarioId={1}`

2. **Integração com Lotes**
   - Obter `linhaId` real da OP
   - Obter `loteId` real da OP
   - Substituir mock `linhaId="mock-linha-id"`

3. **Atualização de Status**
   - Atualizar status da OP para "Em Parada" após registro
   - Exibir indicador visual de parada ativa

4. **Finalização de Parada**
   - Implementar botão "Finalizar Parada"
   - Registrar `hora_fim` e calcular `duracao_minutos`

5. **Histórico de Paradas**
   - Exibir lista de paradas da OP
   - Permitir edição/exclusão (com auditoria)

6. **Notificações**
   - Substituir `alert()` por componente Toast
   - Feedback visual mais elegante

7. **Validação de Turno**
   - Validar que hora_inicio está dentro do turno selecionado
   - Alertar se houver inconsistência

## 📚 Referências

- **Especificação**: `docs/project/05-Metodologia-Calculo.md`
- **Banco de Dados**: `database/migrations/02-tables.sql`
- **Seeds**: `database/migrations/08-seeds.sql`
- **Arquitetura**: `docs/architecture/data-models.md`
- **Workflows**: `docs/architecture/core-workflows.md`

## 🐛 Troubleshooting

### Modal não abre

1. Verifique se o botão "Parada" está sendo clicado
2. Verifique console do navegador para erros
3. Confirme que `modalParadaAberto` está sendo setado para `true`

### Dados não carregam

1. Verifique se `USE_MOCK_DATA = true` em `parada.api.ts`
2. Verifique console para logs de carregamento
3. Confirme que `mockParadas.ts` está sendo importado corretamente

### Erro ao salvar

1. Verifique se todos os campos obrigatórios estão preenchidos
2. Verifique validações no console
3. Confirme que `criarApontamentoParada()` está sendo chamado

### Hierarquia não funciona

1. Verifique se `mockCodigosParada` tem dados
2. Confirme que os níveis estão sendo filtrados corretamente
3. Verifique se `obterOpcoesNivelX()` retorna valores

## ✅ Checklist de Implementação

- [x] Criar tipos TypeScript (`parada.ts`)
- [x] Criar componente modal (`ModalApontamentoParada.tsx`)
- [x] Criar API de paradas (`parada.api.ts`)
- [x] Criar dados mock (`mockParadas.ts`)
- [x] Integrar com página de detalhes da OP
- [x] Implementar hierarquia de 5 níveis
- [x] Implementar validações
- [x] Implementar registro contemporâneo
- [x] Implementar detecção automática de turno
- [x] Adicionar componente Select (shadcn/ui)
- [x] Testar fluxo completo
- [ ] Integrar com Supabase real
- [ ] Integrar com autenticação
- [ ] Adicionar Toast notifications
- [ ] Implementar finalização de parada
- [ ] Adicionar histórico de paradas

