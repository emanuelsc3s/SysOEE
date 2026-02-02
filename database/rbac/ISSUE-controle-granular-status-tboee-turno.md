# feat: Controle granular de permissão para campo `status` da `tboee_turno`

**Labels:** `enhancement`, `security`, `database`, `permissions`, `rbac`
**Prioridade:** Alta
**Módulo:** OEE / Apontamento
**Data:** 2025-02-02

---

## 1. Resumo Executivo

Implementar controle de permissões granular para edição do campo `status` na tabela `tboee_turno`. O objetivo é permitir que **Operadores** editem todos os campos do turno, **exceto** o campo `status`, que deve ser restrito a **Supervisores** e **Administradores**.

---

## 2. Contexto do Problema

### 2.1 Situação Atual

A tabela `tboee_turno` possui uma RLS policy que controla atualizações usando a função `check_current_user_permission('OEE_TURNO_A')`:

```sql
ALTER POLICY "Atualizar" ON "public"."tboee_turno"
TO authenticated
USING (check_current_user_permission('OEE_TURNO_A'::text))
WITH CHECK (check_current_user_permission('OEE_TURNO_A'::text));
```

**Problema:** Esta política opera em nível de **linha** (row-level), não de **coluna** (column-level). Isso significa que:
- Se o usuário tem permissão `OEE_TURNO_A`, pode editar **TODOS** os campos
- Se não tem, não pode editar **NENHUM** campo
- Não há como permitir edição parcial (alguns campos sim, outros não)

### 2.2 Limitação Técnica do RLS

O Row Level Security (RLS) do PostgreSQL foi projetado para controlar **quais linhas** um usuário pode acessar, não **quais colunas**. Não existe sintaxe nativa para:

```sql
-- ISSO NÃO EXISTE NO POSTGRESQL
CREATE POLICY exemplo ON tabela
  FOR UPDATE (coluna1, coluna2)  -- Não é possível especificar colunas
  USING (...)
```

---

## 3. Requisito de Negócio

### 3.1 Matriz de Permissões Desejada

| Perfil | perfil_id | Editar campos gerais | Editar campo `status` |
|--------|-----------|---------------------|----------------------|
| Administrador | 1 | ✅ Sim | ✅ Sim |
| Supervisor | 2 | ✅ Sim | ✅ Sim |
| **Operador** | **3** | ✅ Sim | ❌ **Não** |
| Visualizador | 4 | ❌ Não | ❌ Não |

### 3.2 Campos da `tboee_turno`

| Campo | Operador pode editar? | Observação |
|-------|----------------------|------------|
| `data` | ✅ Sim | Data do turno |
| `turno_id` | ✅ Sim | FK para tbturno |
| `turno` | ✅ Sim | Nome do turno |
| `turno_hi` | ✅ Sim | Hora início |
| `turno_hf` | ✅ Sim | Hora fim |
| `linhaproducao_id` | ✅ Sim | FK para tblinha |
| `linhaproducao` | ✅ Sim | Nome da linha |
| `departamento_id` | ✅ Sim | FK para tbdepartamento |
| `departamento` | ✅ Sim | Nome do departamento |
| `produto_id` | ✅ Sim | FK para tbproduto |
| `produto` | ✅ Sim | Nome do produto |
| `velocidade` | ✅ Sim | Velocidade nominal |
| `observacao` | ✅ Sim | Observações |
| `updated_at` | ✅ Sim | Auditoria |
| `updated_by` | ✅ Sim | Auditoria |
| **`status`** | ❌ **Não** | Apenas Supervisor/Admin |

### 3.3 Valores do Campo `status`

| Valor | Descrição | Quem pode definir |
|-------|-----------|-------------------|
| `Aberto` | Turno em andamento | Sistema (criação) |
| `Fechado` | Turno encerrado | Supervisor, Admin |
| `Cancelado` | Turno cancelado | Admin |

---

## 4. Arquivos Envolvidos

### 4.1 Backend (Database)

| Arquivo | Descrição |
|---------|-----------|
| `database/migrations/14-check-user-permission.sql` | Funções de verificação de permissão |
| `database/migrations/15-rls-permission-policies.sql` | Políticas RLS existentes |
| `database/migrations/13-tbrotina-tbperfil-rotina.sql` | Tabelas de rotinas e permissões |

### 4.2 Frontend

| Arquivo | Linha(s) | Descrição |
|---------|----------|-----------|
| `src/pages/ApontamentoOEE.tsx` | ~3577-3585 | Função `handleEncerrarTurno` - altera status para 'Fechado' |
| `src/pages/ApontamentoOEE.tsx` | ~3747-3755 | Update de campos gerais do turno |

### 4.3 Código Relevante do Frontend

**Função `handleEncerrarTurno` (linha ~3577):**
```typescript
const { data: updatedData, error: updateError } = await supabase
  .from('tboee_turno')
  .update({
    status: 'Fechado',
    updated_at: new Date().toISOString()
    // updated_by: TODO - adicionar quando autenticação estiver implementada
  })
  .eq('oeeturno_id', oeeTurnoId)
  .select('oeeturno_id, status, updated_at')
```

**Observação:** O campo `updated_by` está comentado como TODO e precisa ser corrigido.

---

## 5. Soluções Propostas

### 5.1 Opção 1: TRIGGER (⭐ Recomendada)

Criar um trigger `BEFORE UPDATE` que intercepta alterações no campo `status` e verifica o perfil do usuário.

#### Vantagens
- ✅ Transparente para o frontend (não precisa mudar chamadas Supabase)
- ✅ Segurança no nível do banco de dados (impossível burlar via DevTools)
- ✅ Mensagem de erro clara para o usuário
- ✅ Fácil de estender para outros campos no futuro
- ✅ Mantém compatibilidade com código existente

#### Desvantagens
- ⚠️ Adiciona lógica de negócio no banco (pode complicar manutenção)

#### Código Completo

```sql
-- =====================================================
-- FUNÇÃO: is_operador()
-- Verifica se o usuário atual é Operador (perfil_id = 3)
-- =====================================================

CREATE OR REPLACE FUNCTION is_operador()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_perfil_id INTEGER;
BEGIN
  SELECT perfil_id INTO v_perfil_id
  FROM tbusuario
  WHERE user_id = auth.uid()
    AND deletado = 'N'
  LIMIT 1;

  -- Operador tem perfil_id = 3
  RETURN COALESCE(v_perfil_id = 3, FALSE);
END;
$$;

COMMENT ON FUNCTION is_operador() IS
  'Verifica se o usuário atual é Operador (perfil_id = 3)';

GRANT EXECUTE ON FUNCTION is_operador() TO authenticated;

-- =====================================================
-- TRIGGER FUNCTION: tboee_turno_check_status_permission()
-- Bloqueia alteração de status por Operadores
-- =====================================================

CREATE OR REPLACE FUNCTION tboee_turno_check_status_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o campo 'status' está sendo alterado
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Se o usuário é Operador, bloquear a alteração
    IF is_operador() THEN
      RAISE EXCEPTION 'Operadores não têm permissão para alterar o status do turno. Solicite a um Supervisor ou Administrador.'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;

  -- Permitir a operação para outros perfis
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION tboee_turno_check_status_permission() IS
  'Trigger function que bloqueia alteração do campo status por Operadores.
   Apenas Supervisores, Administradores e outros perfis podem alterar status.';

-- =====================================================
-- TRIGGER: trg_tboee_turno_check_status
-- =====================================================

DROP TRIGGER IF EXISTS trg_tboee_turno_check_status ON tboee_turno;

CREATE TRIGGER trg_tboee_turno_check_status
  BEFORE UPDATE ON tboee_turno
  FOR EACH ROW
  EXECUTE FUNCTION tboee_turno_check_status_permission();

COMMENT ON TRIGGER trg_tboee_turno_check_status ON tboee_turno IS
  'Bloqueia Operadores de alterarem o campo status.
   Executado antes de cada UPDATE na tboee_turno.';
```

---

### 5.2 Opção 2: Função RPC Dedicada

Criar uma função RPC específica para alteração de status, removendo a possibilidade de UPDATE direto no campo.

#### Vantagens
- ✅ Controle total sobre a operação
- ✅ Pode adicionar lógica de negócio adicional (validações, logs, etc.)
- ✅ Interface clara e documentada

#### Desvantagens
- ⚠️ Requer alteração no frontend para chamar RPC ao invés de UPDATE direto
- ⚠️ Não impede UPDATE direto se o usuário tiver acesso à tabela

#### Código Completo

```sql
-- =====================================================
-- FUNÇÃO RPC: update_oee_turno_status()
-- Altera status do turno com verificação de permissão
-- =====================================================

CREATE OR REPLACE FUNCTION update_oee_turno_status(
  p_oeeturno_id INTEGER,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
  v_result JSONB;
BEGIN
  -- Validar parâmetros
  IF p_oeeturno_id IS NULL THEN
    RAISE EXCEPTION 'ID do turno é obrigatório';
  END IF;

  IF p_status IS NULL OR p_status = '' THEN
    RAISE EXCEPTION 'Status é obrigatório';
  END IF;

  IF p_status NOT IN ('Aberto', 'Fechado', 'Cancelado') THEN
    RAISE EXCEPTION 'Status inválido. Valores permitidos: Aberto, Fechado, Cancelado';
  END IF;

  -- Verificar permissão
  IF NOT check_current_user_permission('OEE_TURNO_STATUS') THEN
    RAISE EXCEPTION 'Você não tem permissão para alterar o status do turno.'
      USING ERRCODE = '42501';
  END IF;

  -- Buscar status atual
  SELECT status INTO v_old_status
  FROM tboee_turno
  WHERE oeeturno_id = p_oeeturno_id AND deletado = 'N';

  IF v_old_status IS NULL THEN
    RAISE EXCEPTION 'Turno não encontrado';
  END IF;

  -- Executar update
  UPDATE tboee_turno
  SET
    status = p_status,
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE oeeturno_id = p_oeeturno_id;

  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', TRUE,
    'oeeturno_id', p_oeeturno_id,
    'old_status', v_old_status,
    'new_status', p_status,
    'updated_at', NOW()
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION update_oee_turno_status(INTEGER, TEXT) IS
  'Altera o status de um turno OEE com verificação de permissão.
   Apenas usuários com permissão OEE_TURNO_STATUS podem executar.
   Parâmetros:
     - p_oeeturno_id: ID do turno
     - p_status: Novo status (Aberto, Fechado, Cancelado)';

GRANT EXECUTE ON FUNCTION update_oee_turno_status(INTEGER, TEXT) TO authenticated;
```

**Uso no Frontend:**
```typescript
const { data, error } = await supabase.rpc('update_oee_turno_status', {
  p_oeeturno_id: oeeTurnoId,
  p_status: 'Fechado'
})

if (error) {
  toast({ title: 'Erro', description: error.message, variant: 'destructive' })
} else {
  toast({ title: 'Turno encerrado com sucesso' })
}
```

---

### 5.3 Opção 3: Híbrida (Trigger + RPC + Frontend)

Combinar as abordagens para máxima segurança e melhor UX:
1. **Trigger:** Bloqueia no banco (segurança real)
2. **RPC:** Interface limpa para operações de status
3. **Frontend:** Esconde botões para quem não tem permissão (UX)

---

## 6. Solução Recomendada

### 6.1 Implementação Sugerida

**Usar Opção 1 (Trigger)** como base, com melhorias de UX no frontend.

### 6.2 Arquivo de Migração

Criar `database/migrations/17-tboee-turno-granular-permissions.sql`:

```sql
-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 17-tboee-turno-granular-permissions.sql
-- Descrição: Controle granular de edição na tboee_turno
-- Versão: 1.0
-- Data: 2025-02-02
-- =====================================================

-- PRÉ-REQUISITO: Execute 14-check-user-permission.sql antes deste script

-- =====================================================
-- FUNÇÃO: is_operador()
-- =====================================================

CREATE OR REPLACE FUNCTION is_operador()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_perfil_id INTEGER;
BEGIN
  SELECT perfil_id INTO v_perfil_id
  FROM tbusuario
  WHERE user_id = auth.uid()
    AND deletado = 'N'
  LIMIT 1;

  RETURN COALESCE(v_perfil_id = 3, FALSE);
END;
$$;

COMMENT ON FUNCTION is_operador() IS
  'Verifica se o usuário atual é Operador (perfil_id = 3)';

GRANT EXECUTE ON FUNCTION is_operador() TO authenticated;

-- =====================================================
-- TRIGGER: Bloquear alteração de status por Operadores
-- =====================================================

CREATE OR REPLACE FUNCTION tboee_turno_check_status_permission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF is_operador() THEN
      RAISE EXCEPTION 'Operadores não têm permissão para alterar o status do turno. Solicite a um Supervisor ou Administrador.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tboee_turno_check_status ON tboee_turno;

CREATE TRIGGER trg_tboee_turno_check_status
  BEFORE UPDATE ON tboee_turno
  FOR EACH ROW
  EXECUTE FUNCTION tboee_turno_check_status_permission();

-- =====================================================
-- ROTINAS PARA tboee_turno
-- =====================================================

INSERT INTO tbrotina (rotina, descricao, modulo, ordem, deletado)
VALUES
  ('OEE_TURNO_V', 'Visualizar turnos OEE', 'OEE', 50, 'N'),
  ('OEE_TURNO_I', 'Criar turno OEE', 'OEE', 51, 'N'),
  ('OEE_TURNO_A', 'Editar turno OEE', 'OEE', 52, 'N'),
  ('OEE_TURNO_E', 'Excluir turno OEE', 'OEE', 53, 'N'),
  ('OEE_TURNO_STATUS', 'Alterar status do turno OEE', 'OEE', 54, 'N')
ON CONFLICT (rotina) DO NOTHING;

-- =====================================================
-- PERMISSÕES POR PERFIL
-- =====================================================

-- Administrador (perfil_id = 1): Acesso total
INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
SELECT 1, rotina_id, 'S', auth.uid()
FROM tbrotina
WHERE rotina IN ('OEE_TURNO_V', 'OEE_TURNO_I', 'OEE_TURNO_A', 'OEE_TURNO_E', 'OEE_TURNO_STATUS')
  AND deletado = 'N'
ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey DO UPDATE SET acesso = 'S';

-- Supervisor (perfil_id = 2): Acesso total
INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
SELECT 2, rotina_id, 'S', auth.uid()
FROM tbrotina
WHERE rotina IN ('OEE_TURNO_V', 'OEE_TURNO_I', 'OEE_TURNO_A', 'OEE_TURNO_E', 'OEE_TURNO_STATUS')
  AND deletado = 'N'
ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey DO UPDATE SET acesso = 'S';

-- Operador (perfil_id = 3): Pode editar, mas NÃO alterar status
INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
SELECT 3, rotina_id, 'S', auth.uid()
FROM tbrotina
WHERE rotina IN ('OEE_TURNO_V', 'OEE_TURNO_I', 'OEE_TURNO_A')
  AND deletado = 'N'
ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey DO UPDATE SET acesso = 'S';

-- Operador SEM permissão de status
INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
SELECT 3, rotina_id, 'N', auth.uid()
FROM tbrotina
WHERE rotina IN ('OEE_TURNO_E', 'OEE_TURNO_STATUS')
  AND deletado = 'N'
ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey DO UPDATE SET acesso = 'N';

-- Visualizador (perfil_id = 4): Apenas visualizar
INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
SELECT 4, rotina_id, 'S', auth.uid()
FROM tbrotina
WHERE rotina = 'OEE_TURNO_V'
  AND deletado = 'N'
ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey DO UPDATE SET acesso = 'S';

INSERT INTO tbperfil_rotina (perfil_id, rotina_id, acesso, created_by)
SELECT 4, rotina_id, 'N', auth.uid()
FROM tbrotina
WHERE rotina IN ('OEE_TURNO_I', 'OEE_TURNO_A', 'OEE_TURNO_E', 'OEE_TURNO_STATUS')
  AND deletado = 'N'
ON CONFLICT ON CONSTRAINT tbperfil_rotina_pkey DO UPDATE SET acesso = 'N';

-- =====================================================
-- RLS POLICIES PARA tboee_turno
-- =====================================================

ALTER TABLE tboee_turno ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visualizar" ON tboee_turno;
DROP POLICY IF EXISTS "Inserir" ON tboee_turno;
DROP POLICY IF EXISTS "Atualizar" ON tboee_turno;
DROP POLICY IF EXISTS "Excluir" ON tboee_turno;
DROP POLICY IF EXISTS tboee_turno_select_policy ON tboee_turno;
DROP POLICY IF EXISTS tboee_turno_insert_policy ON tboee_turno;
DROP POLICY IF EXISTS tboee_turno_update_policy ON tboee_turno;
DROP POLICY IF EXISTS tboee_turno_delete_policy ON tboee_turno;

CREATE POLICY tboee_turno_select_policy ON tboee_turno
  FOR SELECT TO authenticated
  USING (deletado = 'N' AND check_current_user_permission('OEE_TURNO_V'));

CREATE POLICY tboee_turno_insert_policy ON tboee_turno
  FOR INSERT TO authenticated
  WITH CHECK (check_current_user_permission('OEE_TURNO_I'));

CREATE POLICY tboee_turno_update_policy ON tboee_turno
  FOR UPDATE TO authenticated
  USING (check_current_user_permission('OEE_TURNO_A'))
  WITH CHECK (check_current_user_permission('OEE_TURNO_A'));

CREATE POLICY tboee_turno_delete_policy ON tboee_turno
  FOR DELETE TO authenticated
  USING (check_current_user_permission('OEE_TURNO_E'));

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
```

---

## 7. Alterações no Frontend

### 7.1 Corrigir `updated_by` (Obrigatório)

**Arquivo:** `src/pages/ApontamentoOEE.tsx`
**Linha:** ~3579

```typescript
// DE:
.update({
  status: 'Fechado',
  updated_at: new Date().toISOString()
  // updated_by: TODO - adicionar quando autenticação estiver implementada
})

// PARA:
.update({
  status: 'Fechado',
  updated_at: new Date().toISOString(),
  updated_by: usuario.id
})
```

### 7.2 Esconder Botão de Encerrar para Operadores (Recomendado)

**Adicionar verificação de permissão:**
```typescript
// No hook ou estado
const [podeAlterarStatus, setPodeAlterarStatus] = useState(false)

useEffect(() => {
  const verificarPermissao = async () => {
    const { data } = await supabase.rpc('check_current_user_permission', {
      p_rotina: 'OEE_TURNO_STATUS'
    })
    setPodeAlterarStatus(data === true)
  }
  verificarPermissao()
}, [])

// No JSX - esconder botão
{podeAlterarStatus && (
  <Button onClick={() => setShowConfirmEncerramento(true)}>
    Encerrar Turno
  </Button>
)}
```

### 7.3 Tratar Erro do Trigger (Recomendado)

**Melhorar feedback ao usuário:**
```typescript
const handleEncerrarTurno = async () => {
  // ...
  const { error: updateError } = await supabase
    .from('tboee_turno')
    .update({ status: 'Fechado', updated_at: new Date().toISOString(), updated_by: usuario.id })
    .eq('oeeturno_id', oeeTurnoId)

  if (updateError) {
    // Verificar se é erro de permissão (código 42501)
    if (updateError.code === '42501' || updateError.message.includes('permissão')) {
      toast({
        title: 'Sem permissão',
        description: 'Você não tem permissão para encerrar o turno. Solicite a um Supervisor.',
        variant: 'destructive'
      })
    } else {
      toast({
        title: 'Erro ao encerrar turno',
        description: updateError.message,
        variant: 'destructive'
      })
    }
    return
  }
  // ...
}
```

---

## 8. Testes

### 8.1 Casos de Teste

| # | Cenário | Usuário | Ação | Resultado Esperado |
|---|---------|---------|------|-------------------|
| 1 | Encerrar turno | Admin | Alterar status para 'Fechado' | ✅ Sucesso |
| 2 | Encerrar turno | Supervisor | Alterar status para 'Fechado' | ✅ Sucesso |
| 3 | Encerrar turno | Operador | Alterar status para 'Fechado' | ❌ Erro: "Operadores não têm permissão..." |
| 4 | Editar observação | Operador | Alterar campo 'observacao' | ✅ Sucesso |
| 5 | Editar produto | Operador | Alterar campo 'produto_id' | ✅ Sucesso |
| 6 | Cancelar turno | Admin | Alterar status para 'Cancelado' | ✅ Sucesso |
| 7 | Cancelar turno | Operador | Alterar status para 'Cancelado' | ❌ Erro |
| 8 | Visualizar turno | Visualizador | SELECT na tabela | ✅ Sucesso |
| 9 | Editar turno | Visualizador | UPDATE em qualquer campo | ❌ Erro RLS |

### 8.2 Script de Teste Manual

```sql
-- Testar como Operador (simular auth.uid() de um operador)
-- Execute no SQL Editor do Supabase

-- 1. Verificar perfil do usuário atual
SELECT
  u.usuario_id,
  u.nome,
  u.perfil_id,
  p.perfil
FROM tbusuario u
JOIN tbperfil p ON p.perfil_id = u.perfil_id
WHERE u.user_id = auth.uid();

-- 2. Verificar se é operador
SELECT is_operador();

-- 3. Tentar alterar status (deve falhar para operador)
UPDATE tboee_turno
SET status = 'Fechado'
WHERE oeeturno_id = 1;

-- 4. Tentar alterar outro campo (deve funcionar para operador)
UPDATE tboee_turno
SET observacao = 'Teste de edição por operador'
WHERE oeeturno_id = 1;
```

---

## 9. Checklist de Implementação

### 9.1 Backend (Database)

- [ ] Criar função `is_operador()` no banco
- [ ] Criar função `tboee_turno_check_status_permission()` (trigger function)
- [ ] Criar trigger `trg_tboee_turno_check_status` na tabela `tboee_turno`
- [ ] Adicionar rotinas `OEE_TURNO_*` na `tbrotina`
- [ ] Configurar permissões na `tbperfil_rotina`
- [ ] Criar/atualizar RLS policies para `tboee_turno`
- [ ] Criar script de migração `17-tboee-turno-granular-permissions.sql`
- [ ] Executar script no ambiente de desenvolvimento
- [ ] Testar com usuário Operador
- [ ] Testar com usuário Supervisor
- [ ] Testar com usuário Admin

### 9.2 Frontend

- [ ] Corrigir `updated_by` em `handleEncerrarTurno`
- [ ] Adicionar verificação de permissão `OEE_TURNO_STATUS`
- [ ] Esconder botão "Encerrar Turno" para Operadores
- [ ] Melhorar tratamento de erro de permissão
- [ ] Testar fluxo completo

### 9.3 Documentação

- [ ] Atualizar CLAUDE.md se necessário
- [ ] Documentar novas rotinas no sistema
- [ ] Atualizar matriz de permissões

---

## 10. Referências

### 10.1 Arquivos do Projeto

- `database/migrations/14-check-user-permission.sql` - Funções base de permissão
- `database/migrations/15-rls-permission-policies.sql` - Padrão de políticas RLS
- `database/migrations/13-tbrotina-tbperfil-rotina.sql` - Estrutura de rotinas
- `src/pages/ApontamentoOEE.tsx` - Frontend de apontamento

### 10.2 Documentação PostgreSQL

- [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [CREATE TRIGGER](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [PL/pgSQL Trigger Functions](https://www.postgresql.org/docs/current/plpgsql-trigger.html)

### 10.3 Documentação Supabase

- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

---

## 11. Histórico

| Data | Autor | Descrição |
|------|-------|-----------|
| 2025-02-02 | Claude Code | Criação da issue |

---

**Fim da Issue**
