# Boas Práticas para Inserção de Dados

## ⚠️ PROBLEMA: Erro de Chave Duplicada em Sequências IDENTITY

### O que aconteceu?

Quando você insere dados **manualmente especificando o ID**, a sequência automática do PostgreSQL **NÃO é atualizada**. Isso causa erro de chave duplicada quando o sistema tenta inserir novos registros.

**Exemplo do problema:**
```sql
-- ❌ ERRADO - Especifica turno_id manualmente
INSERT INTO tbturno (turno_id, codigo, turno, hora_inicio, hora_fim, meta_oee)
VALUES (1, 'D1', 'Diurno', '06:00', '18:00', 85.0);

-- Sequência continua em 1, próximo INSERT automático vai tentar usar turno_id = 1
-- ERRO: duplicate key value violates unique constraint "tbturno_turno_id_key"
```

---

## ✅ SOLUÇÃO 1: Sempre Omitir o ID (RECOMENDADO)

**Deixe o banco gerar o ID automaticamente:**

```sql
-- ✅ CORRETO - Omite turno_id, banco gera automaticamente
INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee, created_by)
VALUES ('D1', 'Diurno', '06:00', '18:00', 85.0, 1);

-- ✅ CORRETO - Múltiplas inserções
INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee, created_by)
VALUES 
  ('D1', 'Diurno 1', '06:00', '14:00', 85.0, 1),
  ('D2', 'Diurno 2', '14:00', '22:00', 85.0, 1),
  ('N1', 'Noturno 1', '22:00', '06:00', 85.0, 1);
```

---

## ✅ SOLUÇÃO 2: Se Precisar Inserir ID Manualmente

**Quando você REALMENTE precisa de IDs específicos** (ex: importação de dados, migração):

### Passo 1: Insira os dados com IDs específicos
```sql
INSERT INTO tbturno (turno_id, codigo, turno, hora_inicio, hora_fim, meta_oee)
VALUES 
  (1, 'D1', 'Diurno 1', '06:00', '14:00', 85.0),
  (2, 'D2', 'Diurno 2', '14:00', '22:00', 85.0),
  (5, 'N1', 'Noturno 1', '22:00', '06:00', 85.0);  -- Note: pulou 3 e 4
```

### Passo 2: **SEMPRE** atualize a sequência depois
```sql
-- Atualiza sequência para o próximo valor disponível
SELECT setval('tbturno_turno_id_seq', (SELECT MAX(turno_id) FROM tbturno) + 1, false);
```

### Passo 3: Verifique se funcionou
```sql
-- Deve retornar o próximo valor (6 no exemplo acima)
SELECT last_value, is_called FROM tbturno_turno_id_seq;
```

---

## 🔧 SOLUÇÃO 3: Script de Correção Automática

**Se você já inseriu dados e esqueceu de atualizar as sequências:**

Execute o script de correção que criamos:

```bash
# Via psql
psql -h <host> -U <user> -d <database> -f database/migrations/99-fix-sequences.sql

# Ou via Supabase Dashboard > SQL Editor
# Cole o conteúdo de database/migrations/99-fix-sequences.sql
```

Este script corrige **todas** as sequências de uma vez.

---

## 📋 Tabelas com IDENTITY no Projeto

Sempre que inserir dados manualmente nestas tabelas, lembre-se de atualizar a sequência:

| Tabela | Coluna ID | Sequência |
|--------|-----------|-----------|
| `tbdepartamento` | `departamento_id` | `tbdepartamento_departamento_id_seq` |
| `tblinhaproducao` | `linhaproducao_id` | `tblinha_producao_linhaproducao_id_seq` |
| `tbvelocidadenominal` | `velocidade_id` | `tbvelocidadenominal_velocidade_id_seq` |
| `tbturno` | `turno_id` | `tbturno_turno_id_seq` |
| `tbusuario` | `usuario_id` | `tbusuario_usuario_id_seq` |
| `tbproduto` | `produto_id` | `tbproduto_produto_id_seq` |
| `tbfuncionario` | `funcionario_id` | `tbfuncionario_funcionario_id_seq` |
| `tbcargo` | `cargo_id` | `tbcargo_cargo_id_seq` |
| `tbfuncao` | `funcao_id` | `tbfuncao_funcao_id_seq` |
| `tblotacao` | `lotacao_id` | `tblotacao_lotacao_id_seq` |

---

## 🎯 Quando Executar o Script de Correção

Execute `99-fix-sequences.sql` sempre que:

- ✅ Importar dados de outro sistema
- ✅ Restaurar backup do banco de dados
- ✅ Inserir registros manualmente com IDs específicos
- ✅ Após executar scripts de migração que inserem dados
- ✅ Como rotina de manutenção mensal

---

## 🚫 O que NÃO fazer

```sql
-- ❌ NUNCA faça isso em produção
INSERT INTO tbturno (turno_id, codigo, turno, ...) VALUES (1, 'D1', ...);
-- Sem atualizar a sequência depois!

-- ❌ NUNCA use DEFAULT com valor específico
INSERT INTO tbturno (turno_id, codigo, turno, ...) 
VALUES (DEFAULT, 'D1', ...);  -- Isso é redundante, omita turno_id

-- ❌ NUNCA altere manualmente a sequência para valor menor que o máximo
SELECT setval('tbturno_turno_id_seq', 1, false);  -- Se já existe turno_id = 5
```

---

## 📝 Exemplo Completo: Importação de Dados

```sql
-- 1. Inserir dados com IDs específicos (importação)
INSERT INTO tbturno (turno_id, codigo, turno, hora_inicio, hora_fim, meta_oee)
VALUES 
  (10, 'D1', 'Diurno 1', '06:00', '14:00', 85.0),
  (20, 'D2', 'Diurno 2', '14:00', '22:00', 85.0),
  (30, 'N1', 'Noturno 1', '22:00', '06:00', 85.0);

-- 2. Atualizar sequência (OBRIGATÓRIO!)
SELECT setval('tbturno_turno_id_seq', (SELECT MAX(turno_id) FROM tbturno) + 1, false);

-- 3. Verificar
SELECT last_value, is_called FROM tbturno_turno_id_seq;
-- Deve retornar: last_value = 31, is_called = false

-- 4. Testar inserção automática
INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee)
VALUES ('N2', 'Noturno 2', '22:00', '06:00', 85.0);
-- Deve gerar turno_id = 31 automaticamente
```

---

## 🔍 Como Verificar se Há Problema

```sql
-- Verificar se sequência está dessincronizada
SELECT 
  'tbturno' as tabela,
  (SELECT MAX(turno_id) FROM tbturno) as max_id_tabela,
  (SELECT last_value FROM tbturno_turno_id_seq) as ultimo_valor_sequencia,
  CASE 
    WHEN (SELECT MAX(turno_id) FROM tbturno) >= (SELECT last_value FROM tbturno_turno_id_seq)
    THEN '⚠️ PROBLEMA! Sequência precisa ser corrigida'
    ELSE '✅ OK'
  END as status;
```

---

## 📚 Referências

- PostgreSQL IDENTITY: https://www.postgresql.org/docs/current/sql-createtable.html
- Script de correção: `database/migrations/99-fix-sequences.sql`
- Seeds corretos: `database/migrations/08-seeds.sql` (exemplo de como fazer certo)

