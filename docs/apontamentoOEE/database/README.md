# Documentação de Banco de Dados - Sistema OEE

## 📋 Arquivos Disponíveis

### Documentação Técnica
- **`tboee_apontamentos_schema.md`** - Documentação completa das 3 tabelas de apontamento OEE

### Scripts SQL (Executar em ordem)
1. **`001-create-tboee_producao.sql`** - Tabela de apontamentos de produção
2. **`002-create-tboee_paradas.sql`** - Tabela de paradas de produção
3. **`003-create-tboee_perdas.sql`** - Tabela de perdas de qualidade

### Scripts Auxiliares
- **`999-verify-installation.sql`** - Script de verificação da instalação

---

## 🚀 Como Executar

### Pré-requisitos

Certifique-se de que as seguintes tabelas **já existem** no banco de dados:

- ✅ `tbusuario` (usuários do sistema)
- ✅ `tblinha` (linhas de produção)
- ✅ `tbproduto` (produtos/SKUs)
- ✅ `tbturno` (turnos de trabalho)
- ✅ `tbcodigoparada` (códigos de parada)
- ✅ `tblote` (lotes de produção)
- ✅ `tboee_turno` (cabeçalho do turno OEE)

### Passos de Instalação

#### 1. Conectar ao Supabase

```bash
# Via Supabase CLI
supabase db reset

# Ou via interface web do Supabase
# SQL Editor → New Query
```

#### 2. Executar Scripts em Ordem

```sql
-- Executar na ordem:
\i 001-create-tboee_producao.sql
\i 002-create-tboee_paradas.sql
\i 003-create-tboee_perdas.sql
```

**Importante**: Execute um script por vez e verifique se não há erros antes de prosseguir.

#### 3. Verificar Instalação

```sql
\i 999-verify-installation.sql
```

---

## 🔍 Verificação Manual

### Listar Tabelas Criadas

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'tboee_%'
ORDER BY table_name;
```

**Resultado esperado**:
```
table_name        | table_type
------------------+------------
tboee_paradas     | BASE TABLE
tboee_perdas      | BASE TABLE
tboee_producao    | BASE TABLE
tboee_turno       | BASE TABLE  (já existia)
```

### Verificar Constraints

```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name LIKE 'tboee_%'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;
```

### Verificar Índices

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'tboee_%'
ORDER BY tablename, indexname;
```

---

## 📊 Diagrama de Relacionamentos

```
tboee_turno (cabeçalho - já existe)
    │
    │
    ├──────< tboee_producao (1:N)
    │             │
    │             │
    │             └──────< tboee_perdas (1:N)
    │
    │
    └──────< tboee_paradas (1:N)
```

---

## ⚠️ Troubleshooting

### Erro: Tabela já existe

```sql
-- Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = 'tboee_producao'
);

-- Se precisar recriar (CUIDADO: perde dados!)
DROP TABLE IF EXISTS tboee_perdas CASCADE;
DROP TABLE IF EXISTS tboee_paradas CASCADE;
DROP TABLE IF EXISTS tboee_producao CASCADE;
```

### Erro: Foreign Key não encontrada

**Causa**: Tabela referenciada não existe.

**Solução**: Verificar se todas as tabelas pré-requisito existem:

```sql
-- Verificar tabelas necessárias
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'tbusuario',
    'tblinha',
    'tbproduto',
    'tbturno',
    'tbcodigoparada',
    'tblote',
    'tboee_turno'
  )
ORDER BY table_name;
```

### Erro: Permissão negada

**Causa**: Usuário sem permissão para criar tabelas.

**Solução**: Executar com usuário `postgres` ou dar permissões:

```sql
GRANT CREATE ON SCHEMA public TO seu_usuario;
```

---

## 🧪 Testes de Integridade

### Teste 1: Inserir Produção

```sql
-- Exemplo de inserção (ajustar IDs conforme seu banco)
INSERT INTO tboee_producao (
  oeeturno_id, linha_id, produto_id, turno_id,
  data_apontamento, hora_inicio, hora_fim,
  quantidade_produzida, velocidade_nominal, tempo_operacao, tempo_disponivel,
  linha_nome, setor, sku_codigo, produto_descricao, turno_nome,
  created_by
)
SELECT
  1, 1, 1, 1,
  CURRENT_DATE, '07:00:00', '08:00:00',
  9500, 10000.00, 1.00, 12.00,
  'TESTE LINHA', 'TESTE SETOR', 'TEST001', 'PRODUTO TESTE', 'D1 - Diurno',
  1
WHERE EXISTS (
  SELECT 1 FROM tboee_turno WHERE oeeturno_id = 1
);
```

### Teste 2: Inserir Parada

```sql
INSERT INTO tboee_paradas (
  oeeturno_id, linha_id, turno_id,
  data_parada, hora_inicio, hora_fim, duracao_minutos,
  tipo_parada, codigo_parada, descricao_parada,
  linha_nome, turno_nome,
  created_by
)
SELECT
  1, 1, 1,
  CURRENT_DATE, '09:00:00', '09:30:00', 30,
  'NAO_PLANEJADA', 'TEST-001', 'Teste de parada',
  'TESTE LINHA', 'D1 - Diurno',
  1
WHERE EXISTS (
  SELECT 1 FROM tboee_turno WHERE oeeturno_id = 1
);
```

### Teste 3: Inserir Perda (depende de produção)

```sql
INSERT INTO tboee_perdas (
  oeeturno_id, producao_id, linha_id, turno_id,
  data_apontamento, unidades_rejeitadas, motivo_rejeicao,
  linha_nome, turno_nome,
  created_by
)
SELECT
  1,
  (SELECT producao_id FROM tboee_producao ORDER BY created_at DESC LIMIT 1),
  1, 1,
  CURRENT_DATE, 100, 'Teste de perda',
  'TESTE LINHA', 'D1 - Diurno',
  1
WHERE EXISTS (
  SELECT 1 FROM tboee_producao LIMIT 1
);
```

### Limpar Dados de Teste

```sql
-- Remover dados de teste (exclusão lógica)
UPDATE tboee_perdas SET deletado = 'S', deleted_at = NOW(), deleted_by = 1
WHERE linha_nome = 'TESTE LINHA';

UPDATE tboee_paradas SET deletado = 'S', deleted_at = NOW(), deleted_by = 1
WHERE linha_nome = 'TESTE LINHA';

UPDATE tboee_producao SET deletado = 'S', deleted_at = NOW(), deleted_by = 1
WHERE linha_nome = 'TESTE LINHA';
```

---

## 📝 Próximos Passos

Após criar as tabelas:

1. ✅ **Criar serviços Supabase**
   - `src/services/supabase/producao.service.ts`
   - `src/services/supabase/paradas.service.ts`
   - `src/services/supabase/perdas.service.ts`

2. ✅ **Migrar dados do localStorage**
   - Implementar sincronização batch
   - Tratamento de conflitos
   - Fallback para localStorage

3. ✅ **Atualizar ApontamentoOEE.tsx**
   - Substituir chamadas localStorage
   - Implementar cache offline
   - Sincronização automática

4. ✅ **Validação com stakeholders**
   - Consultor Rafael Gusmão (validação técnica)
   - Sávio Correia Rafael (validação operacional)

---

## 📚 Referências

- **Documentação Técnica**: `tboee_apontamentos_schema.md`
- **Especificações do Cliente**: `/docs/EspecificacaoUsuario/md/`
- **Metodologia OEE**: `Atividade 05 - Última REV.md`
- **ALCOA+**: Princípios de integridade de dados farmacêuticos

---

## 📞 Suporte

**Dúvidas ou problemas?**
- Consulte a documentação técnica completa
- Verifique os logs de erro do PostgreSQL
- Valide pré-requisitos (tabelas dependentes)

---

**Última atualização**: 2025-12-17
**Versão**: 1.0
