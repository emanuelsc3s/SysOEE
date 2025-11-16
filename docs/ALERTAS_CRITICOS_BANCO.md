# ⚠️ ALERTAS CRÍTICOS - ESTRUTURA DO BANCO DE DADOS

**Data da Análise:** 2025-11-16
**Analisado por:** Sarah (PO) via Claude Code
**Versão do Documento:** 1.0

---

## 🔴 RESUMO EXECUTIVO

A estrutura **REAL** do banco de dados possui **diferenças críticas** em relação à documentação original das migrations. Estas diferenças **IMPACTAM DIRETAMENTE** a capacidade de calcular OEE corretamente.

**Severidade:** 🔴 **CRÍTICA** - Bloqueia cálculo preciso de Performance OEE

---

## 📊 TABELAS AFETADAS

### 1. **tblinhaproducao** (não `tblinha`)

**Diferença de Nomenclatura:**
- ❌ Documentação: `tblinha`
- ✅ Real: `tblinhaproducao`

**Diferença de Estrutura:**

| Campo | Documentado | Real | Impacto |
|-------|-------------|------|---------|
| PK | `id UUID` | `linhaproducao_id INTEGER` | 🟡 Médio - Todas FKs afetadas |
| Nome | `codigo` + `nome` (2 campos) | `linhaproducao` (1 campo) | 🟡 Médio - Sem separação |
| Localização | `localizacao VARCHAR(200)` | ❌ Não existe | 🟢 Baixo |
| CLP | `tem_clp BOOLEAN`, `tipo_clp VARCHAR(50)` | ❌ Não existem | 🔴 Alto - Sem controle de integração |
| Meta OEE | `meta_oee_padrao DECIMAL(5,2)` | ❌ Não existe | 🟡 Médio - Depende de tbmetaoee |
| Ativo | `ativo BOOLEAN` | `ativo TEXT` (Sim/Não) | 🟢 Baixo - Apenas convenção |

---

### 2. **tbvelocidadenominal** ⚠️ CRÍTICO PARA OEE

**Diferenças Estruturais:**

| Campo | Documentado | Real | Impacto |
|-------|-------------|------|---------|
| PK | `id UUID` | `velocidade_id INTEGER` | 🟡 Médio |
| FK Linha | `linha_id UUID` | `linhaproducao_id INTEGER` | 🟡 Médio |
| Velocidade | `velocidade_nominal DECIMAL(10,2)` | `velocidade NUMERIC(10,2)` | 🟢 Baixo - Apenas nome |
| **Vigência Início** | `data_inicio_vigencia DATE NOT NULL` | ❌ **NÃO EXISTE** | 🔴 **CRÍTICO** |
| **Vigência Fim** | `data_fim_vigencia DATE` | ❌ **NÃO EXISTE** | 🔴 **CRÍTICO** |
| Aprovação | `aprovado_por`, `aprovado_em` | ❌ Não existem | 🟡 Médio |
| Deletado | `deletado CHAR(1)` | `deletado TEXT` | 🟢 Baixo |

**🔴 IMPACTO CRÍTICO:**

```sql
-- ❌ IMPOSSÍVEL FAZER:
SELECT velocidade_nominal
FROM tbvelocidadenominal
WHERE linha_id = 'X'
  AND produto_id = 123
  AND data_producao BETWEEN data_inicio_vigencia AND COALESCE(data_fim_vigencia, '9999-12-31');

-- ✅ ÚNICO MÉTODO POSSÍVEL (LIMITADO):
SELECT velocidade
FROM tbvelocidadenominal
WHERE linhaproducao_id = X
  AND produto_id = 123;
  -- ⚠️ RETORNA VELOCIDADE ATUAL, NÃO VIGENTE NA DATA DA PRODUÇÃO
```

**Consequências:**
1. ❌ **Não é possível calcular OEE histórico** com velocidade correta
2. ❌ **Mudanças de velocidade sobrescrevem dados anteriores** (sem histórico)
3. ❌ **Recálculos de OEE de lotes antigos usarão velocidade atual** (INCORRETO)
4. ❌ **Violação de rastreabilidade ALCOA+** (não é possível recuperar velocidade original)

**Exemplo de Problema:**
```
Cenário:
- Janeiro/2025: Velocidade da Linha A + Produto X = 5000 Und/h
- Março/2025: Velocidade mudou para 6000 Und/h (após melhoria)
- Maio/2025: Gestor solicita relatório OEE de Janeiro

❌ Com estrutura atual:
- Sistema buscará velocidade = 6000 Und/h (valor atual)
- OEE de Janeiro será calculado INCORRETAMENTE

✅ Com vigências:
- Sistema buscaria velocidade vigente em Janeiro = 5000 Und/h
- OEE seria calculado corretamente
```

---

### 3. **tbusuario**

**Diferenças Estruturais:**

| Campo | Documentado | Real | Impacto |
|-------|-------------|------|---------|
| PK | `id BIGSERIAL` | `usuario_id INTEGER` | 🟡 Médio - Todas FKs afetadas |
| Nome | `nome_completo VARCHAR(200)` | ❌ Não existe | 🟡 Médio |
| Login | ❌ Não documentado | `login TEXT` | 🟢 Baixo |
| Matrícula | `matricula VARCHAR(20)` | ❌ Não existe | 🟡 Médio |
| Senha | `senha_hash VARCHAR(255)` | ❌ Não existe | 🔴 Alto - Como autenticar? |
| Tipo | `tipo_usuario ENUM` | ❌ Não existe | 🔴 Alto - Como aplicar RLS? |
| Perfil | ❌ Não documentado | `perfil_id INTEGER` (FK não definida) | 🔴 Alto - Tabela ausente |
| Funcionário | ❌ Não documentado | `funcionario_id INTEGER` (FK tbfuncionario) | 🟡 Médio - Tabela não documentada |
| Departamento | `departamento_id UUID` | ❌ Não existe | 🟡 Médio |
| Linha | `linha_id UUID` | ❌ Não existe | 🟡 Médio |
| Ativo | `ativo BOOLEAN` | ❌ Não existe | 🟡 Médio |

**Tabelas Referenciadas Mas Não Documentadas:**
- `tbfuncionario` (referenced por FK)
- Tabela de perfis (referenced por `perfil_id`)

---

### 4. **tbdepartamento**

**Diferenças Estruturais:**

| Campo | Documentado | Real | Impacto |
|-------|-------------|------|---------|
| PK | `departamento_id SERIAL` | `departamento_id INTEGER` | 🟢 Baixo |
| Código ERP | `erp_codigo VARCHAR(10)` | ❌ Não existe | 🟢 Baixo |
| Email Gerente | `gerente_email VARCHAR(100)` | ❌ Não existe | 🟢 Baixo |
| Deletado | `deletado CHAR(1)` | ❌ Não existe (apenas bloqueado) | 🟢 Baixo |
| Sync | `sync CHAR(1)` | `sync TEXT NOT NULL` | 🟢 Baixo |

---

## 🐛 ERROS DE TIPO IDENTIFICADOS

### **tbvelocidadenominal** - Campos de Auditoria

```sql
-- ❌ INCORRETO (estrutura real):
created_by INTEGER REFERENCES tbusuario(usuario_id),  -- ✅ CORRETO
updated_at INTEGER,  -- ❌ DEVERIA SER TIMESTAMP
updated_by TIMESTAMP WITHOUT TIME ZONE,  -- ❌ DEVERIA SER INTEGER
deleted_at INTEGER,  -- ❌ DEVERIA SER TIMESTAMP
deleted_by TIMESTAMP WITHOUT TIME ZONE  -- ❌ DEVERIA SER INTEGER
```

**Consequências:**
- ❌ `updated_at` e `deleted_at` armazenarão números ao invés de datas
- ❌ `updated_by` e `deleted_by` armazenarão datas ao invés de IDs de usuários
- ❌ Impossível rastrear QUANDO foi alterado (ALCOA+ comprometido)
- ❌ Impossível rastrear QUEM deletou (ALCOA+ comprometido)

**Severidade:** 🔴 **CRÍTICA** - Viola princípios ALCOA+ (Atribuível, Contemporâneo)

---

## 📋 CONVENÇÕES DIFERENTES

### IDs: UUID vs INTEGER IDENTITY

**Documentado:**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

**Real:**
```sql
velocidade_id INTEGER GENERATED BY DEFAULT AS IDENTITY NOT NULL
```

**Impacto:** 🟡 Médio
- Queries e FKs precisam ser ajustadas
- INTEGER IDENTITY é mais performático que UUID
- Perde benefícios de UUIDs (geração distribuída, segurança por obscuridade)

### Campos BOOLEAN vs TEXT

**Documentado:**
```sql
ativo BOOLEAN NOT NULL DEFAULT TRUE
deletado CHAR(1) CHECK (deletado IN ('S', 'N'))
```

**Real:**
```sql
ativo TEXT DEFAULT 'Sim'
deletado TEXT DEFAULT 'N'
```

**Impacto:** 🟢 Baixo
- Apenas convenção diferente
- Queries precisam usar `ativo = 'Sim'` ao invés de `ativo = TRUE`

---

## 🎯 AÇÕES RECOMENDADAS

### 🔴 **URGENTE - Antes de Implementar Cálculo de OEE**

1. **Adicionar Campos de Vigência em `tbvelocidadenominal`:**
   ```sql
   ALTER TABLE tbvelocidadenominal
   ADD COLUMN data_inicio_vigencia DATE NOT NULL DEFAULT CURRENT_DATE,
   ADD COLUMN data_fim_vigencia DATE NULL,
   ADD CONSTRAINT ck_vigencia CHECK (
     data_fim_vigencia IS NULL
     OR data_fim_vigencia >= data_inicio_vigencia
   );
   ```

2. **Corrigir Tipos de Campos de Auditoria:**
   ```sql
   ALTER TABLE tbvelocidadenominal
   ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE,
   ALTER COLUMN deleted_at TYPE TIMESTAMP WITHOUT TIME ZONE,
   ALTER COLUMN updated_by TYPE INTEGER,
   ALTER COLUMN deleted_by TYPE INTEGER;
   ```

3. **Criar Constraint de Vigência Única:**
   ```sql
   ALTER TABLE tbvelocidadenominal
   ADD CONSTRAINT uq_velocidade_vigente
   UNIQUE (linhaproducao_id, produto_id, data_inicio_vigencia);
   ```

4. **Criar Function `get_velocidade_nominal()`:**
   ```sql
   CREATE OR REPLACE FUNCTION get_velocidade_nominal(
     p_linha_id INTEGER,
     p_produto_id INTEGER,
     p_data DATE
   ) RETURNS NUMERIC(10,2) AS $$
     SELECT velocidade
     FROM tbvelocidadenominal
     WHERE linhaproducao_id = p_linha_id
       AND produto_id = p_produto_id
       AND data_inicio_vigencia <= p_data
       AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= p_data)
     ORDER BY data_inicio_vigencia DESC
     LIMIT 1;
   $$ LANGUAGE SQL STABLE;
   ```

### 🟡 **IMPORTANTE - Antes do MVP**

5. **Documentar Tabelas Ausentes:**
   - `tbfuncionario`
   - Tabela de perfis (nome a definir)

6. **Padronizar Convenções:**
   - Decidir: TEXT (Sim/Não) ou BOOLEAN?
   - Documentar padrão escolhido

7. **Adicionar Campos Faltantes em `tblinhaproducao`:**
   ```sql
   ALTER TABLE tblinhaproducao
   ADD COLUMN tem_clp BOOLEAN DEFAULT FALSE,
   ADD COLUMN tipo_clp VARCHAR(50),
   ADD COLUMN meta_oee_padrao NUMERIC(5,2) CHECK (meta_oee_padrao BETWEEN 0 AND 100);
   ```

### 🟢 **DESEJÁVEL - Pós-MVP**

8. **Migrar para UUIDs** (se necessário)
9. **Adicionar validações de email** em `tbusuario`
10. **Implementar autenticação própria** ou integrar com Supabase Auth

---

## 📊 IMPACTO NA ANÁLISE DE GAPS DE OEE

### Revisão da Análise Anterior:

**Anteriormente identificado como "Implementado":**
- ✅ Function `get_velocidade_nominal()` → ❌ **NÃO EXISTE** (precisa ser criada)
- ✅ Histórico de velocidades → ❌ **NÃO EXISTE** (sem campos de vigência)

**Gap CRÍTICO Adicional:**
- **Impossibilidade de cálculo de OEE histórico** sem vigências
- **Necessidade de migration URGENTE** antes de qualquer cadastro de velocidades

### Atualização de Prioridades:

**🔴 PRIORIDADE CRÍTICA (BLOQUEADOR):**

| Seq | Item Original | Nova Prioridade | Motivo |
|-----|---------------|----------------|--------|
| 0️⃣ | **MIGRATION: Adicionar vigências** | **NOVO - P0** | **SEM ISSO, OEE HISTÓRICO IMPOSSÍVEL** |
| 1️⃣ | Cadastro de Velocidades Nominais | P1 | Depende de #0 |
| 2️⃣ | API de OEE | P2 | Depende de #1 |
| 3️⃣ | Integração com Produção | P3 | - |

---

## 📝 CHECKLIST DE VALIDAÇÃO

Antes de iniciar desenvolvimento de OEE, validar:

- [ ] Campos de vigência adicionados em `tbvelocidadenominal`
- [ ] Tipos de auditoria corrigidos
- [ ] Function `get_velocidade_nominal()` criada
- [ ] Constraint de vigência única adicionada
- [ ] Tabelas `tbfuncionario` e perfis documentadas
- [ ] Decisão sobre convenções (BOOLEAN vs TEXT) tomada
- [ ] Migrations atualizadas refletem estrutura real
- [ ] Testes de cálculo de OEE histórico realizados

---

## 🔗 REFERÊNCIAS

- **Estrutura Real:** Fornecida em 2025-11-16 via Supabase
- **Documentação Original:** `/home/emanuel/SysOEE/database/migrations/02-tables.sql`
- **Documentação Arquitetura:** `/home/emanuel/SysOEE/docs/architecture/database-schema.md`
- **Especificação OEE:** `/home/emanuel/SysOEE/docs/project/05-Metodologia-Calculo.md`

---

**⚠️ ESTE DOCUMENTO DEVE SER REVISADO E APROVADO ANTES DE QUALQUER DESENVOLVIMENTO DE CÁLCULO DE OEE**

---

**Assinatura Digital:**
Sarah (Product Owner - Agent ID: po)
Data: 2025-11-16
Versão: 1.0
