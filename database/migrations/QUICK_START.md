# 🚀 Quick Start - Deploy Database no Supabase

## Passos Rápidos (5 minutos)

### 1️⃣ Executar Scripts Principais

Abra o **Supabase SQL Editor** e execute NA ORDEM:

```bash
# 1. Enums (OBRIGATÓRIO PRIMEIRO)
database/migrations/01-enums.sql

# 2. Tabelas (15 tabelas)
database/migrations/02-tables.sql
```

**✅ Pronto!** Estrutura básica criada.

---

### 2️⃣ Popular Dados Iniciais (Seeds)

Execute no SQL Editor:

```sql
-- Turnos
INSERT INTO tbturno (codigo, nome, hora_inicio, hora_fim, duracao_horas) VALUES
('D1', 'Diurno 1', '06:00', '14:00', 8.00),
('D2', 'Diurno 2', '14:00', '22:00', 8.00),
('N1', 'Noturno 1', '22:00', '06:00', 8.00);

-- Departamentos
INSERT INTO tbdepartamento (codigo, nome, descricao) VALUES
('SPEP', 'Soluções Parenterais de Embalagem Plástica', 'Grande e Pequeno Volume'),
('SPPV', 'Soluções Parenterais de Pequeno Volume - Vidros', 'Frascos de vidro'),
('LIQUIDOS', 'Líquidos Orais', 'Gotas e Xaropes'),
('CPHD', 'Concentrado Polieletrolítico para Hemodiálise', 'Linha Ácida e Básica');
```

---

### 3️⃣ Adicionar Functions Essenciais

**OPÇÃO A - Mínimo Viável:**

Crie apenas a function de updated_at (obrigatória):

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em TODAS as tabelas
CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbdepartamento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tblinha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repetir para: tbproduto, tbloteinsumo, tbvelocidadenominal,
-- tbcodigoparada, tbturno, tbusuario, tbmetaoee, tblote,
-- tbapontamentoparada, tbapontamentoproducao, tbapontamentoqualidade
```

**OPÇÃO B - Completo:**

Consulte `GENERATE_REMAINING.md` para todas as 6 functions.

---

### 4️⃣ Testar Estrutura

```sql
-- Listar todas as tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'tb%'
ORDER BY table_name;

-- Deve retornar 14 tabelas:
-- tbdepartamento
-- tblinha
-- tbproduto
-- tbloteinsumo
-- tbvelocidadenominal
-- tbcodigoparada
-- tbturno
-- tbusuario
-- tbmetaoee
-- tblote
-- tbapontamentoparada
-- tbapontamentoproducao
-- tbapontamentoqualidade
-- tboeecalculado
-- tbauditlog
```

---

## 📝 Próximas Etapas

### MVP Mínimo (pode iniciar desenvolvimento frontend)
- ✅ Scripts 01 e 02 executados
- ✅ Seeds básicos populados
- ✅ Trigger de updated_at criado
- ⏳ Criar usuários de teste no Supabase Auth
- ⏳ Configurar variáveis de ambiente frontend

### Completo (sistema funcionando 100%)
- ✅ Tudo do MVP
- ⏳ Executar todas as 6 functions (`GENERATE_REMAINING.md`)
- ⏳ Criar todos os triggers (auditoria + cache OEE)
- ⏳ Criar views para dashboards
- ⏳ Criar indexes para performance
- ⏳ Habilitar RLS policies
- ⏳ Popular 37 linhas de produção

---

## 🔧 Configuração do Frontend

Após executar os scripts, configure `.env.local`:

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

Teste conexão:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Testar query
const { data, error } = await supabase
  .from('tbdepartamento')
  .select('*')

console.log(data) // Deve listar 4 departamentos
```

---

## 📚 Documentação Completa

- **Arquitetura:** `/docs/architecture.md`
- **Functions/Triggers:** `GENERATE_REMAINING.md`
- **Workflows:** `/docs/architecture.md` seção 4
- **Especificações:** `/docs/project/`

---

## ⚠️ Troubleshooting

### Erro: "relation tbusuario does not exist"
**Solução:** Certifique-se de executar `02-tables.sql` antes dos demais scripts.

### Erro: "violates foreign key constraint"
**Solução:** Execute os scripts NA ORDEM (enums → tables → seeds).

### Tabelas criadas mas vazias
**Solução:** Execute o bloco de seeds (passo 2).

---

## 🎯 MVP Ready Checklist

- [ ] Scripts 01 e 02 executados sem erro
- [ ] 14 tabelas criadas
- [ ] 4 departamentos e 3 turnos populados
- [ ] Trigger updated_at criado
- [ ] Teste de conexão frontend → Supabase funcionando
- [ ] Primeira linha de produção criada manualmente

**Pronto para começar desenvolvimento! 🚀**
