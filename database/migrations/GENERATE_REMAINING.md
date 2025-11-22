# Instruções para Gerar Scripts SQL Restantes

Os scripts **01-enums.sql** e **02-tables.sql** já estão prontos para execução.

Para os scripts restantes (03-08), use os blocos SQL abaixo ou consulte `/docs/architecture.md` seção 3 (Database Schema) para DDL completo.

---

## 03-functions.sql - Functions

### Function: get_velocidade_nominal()

```sql
CREATE OR REPLACE FUNCTION get_velocidade_nominal(
  p_linha_id UUID,
  p_sku_id UUID,
  p_data_referencia DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_velocidade DECIMAL(10,2);
BEGIN
  SELECT velocidade_nominal
  INTO v_velocidade
  FROM tbvelocidadenominal
  WHERE linha_id = p_linha_id
    AND sku_id = p_sku_id
    AND data_inicio_vigencia <= p_data_referencia
    AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= p_data_referencia)
  ORDER BY data_inicio_vigencia DESC
  LIMIT 1;

  RETURN COALESCE(v_velocidade, 0);
END;
$$ LANGUAGE plpgsql STABLE;
```

### Function: get_meta_oee()

```sql
CREATE OR REPLACE FUNCTION get_meta_oee(
  p_linha_id UUID,
  p_data_referencia DATE
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_meta DECIMAL(5,2);
BEGIN
  SELECT meta_oee INTO v_meta
  FROM tbmetaoee
  WHERE linha_id = p_linha_id
    AND data_inicio_vigencia <= p_data_referencia
    AND (data_fim_vigencia IS NULL OR data_fim_vigencia >= p_data_referencia)
    AND ativo = TRUE
  ORDER BY data_inicio_vigencia DESC
  LIMIT 1;

  IF v_meta IS NULL THEN
  SELECT meta_oee_padrao INTO v_meta FROM tblinha WHERE id = p_linha_id;
  END IF;

  RETURN COALESCE(v_meta, 85.00);
END;
$$ LANGUAGE plpgsql STABLE;
```

### Function: calcular_oee_lote() - **IMPORTANTE**

**Esta é a função MAIS CRÍTICA do sistema!**

Consulte `/docs/architecture.md` seção "3.5. Functions de Cálculo de OEE" para o código completo (~200 linhas).

A função implementa as fórmulas da Atividade 05 e retorna:
- Todos os tempos (calendário, disponível, operação, líquido, valioso)
- Breakdown de paradas
- Componentes OEE (Disponibilidade, Performance, Qualidade)
- OEE final

### Function: update_updated_at_column()

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Function: audit_trigger_func()

Consulte `/docs/architecture.md` seção "3.5. Functions e Triggers" para código completo (~60 linhas).

### Function: atualizar_totais_lote()

```sql
CREATE OR REPLACE FUNCTION atualizar_totais_lote()
RETURNS TRIGGER AS $$
DECLARE
  v_lote_id UUID;
BEGIN
  v_lote_id := COALESCE(NEW.lote_id, OLD.lote_id);

  UPDATE tblote
  SET
    unidades_produzidas = COALESCE((
      SELECT SUM(unidades_produzidas)
  FROM tbapontamentoproducao
      WHERE lote_id = v_lote_id
    ), 0),
    unidades_refugo = COALESCE((
      SELECT SUM(unidades_refugadas)
  FROM tbapontamentoqualidade
      WHERE lote_id = v_lote_id AND tipo_perda = 'REFUGO'
    ), 0),
    tempo_retrabalho_minutos = COALESCE((
      SELECT SUM(tempo_retrabalho_minutos)
      FROM tb_apontamento_qualidade
      WHERE lote_id = v_lote_id AND tipo_perda = 'RETRABALHO'
    ), 0),
    unidades_boas = GREATEST(
      COALESCE((SELECT SUM(unidades_produzidas) FROM tb_apontamento_producao WHERE lote_id = v_lote_id), 0) -
      COALESCE((SELECT SUM(unidades_refugadas) FROM tb_apontamento_qualidade WHERE lote_id = v_lote_id AND tipo_perda = 'REFUGO'), 0),
      0
    )
  WHERE id = v_lote_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Function: cache_oee_lote_concluido()

Consulte `/docs/architecture.md` para código completo.

---

## 04-triggers.sql - Triggers

### Triggers de updated_at (14 triggers)

```sql
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON tbsetor
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON tb_linha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repetir para todas as tabelas com updated_at:
-- tbsku, tbinsumo, tbloteinsumo, tbvelocidadenominal,
-- tbcodigoparada, tbturno, tbusuario, tbmetaoee,
-- tblote, tbapontamentoparada, tbapontamentoproducao, tbapontamentoqualidade
```

### Triggers de Auditoria (5 triggers)

```sql
CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbvelocidadenominal
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoparada
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoproducao
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoqualidade
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_trigger AFTER UPDATE OR DELETE ON tblote
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Triggers de Totais de Lote

```sql
CREATE TRIGGER trg_atualizar_lote_producao
  AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoproducao
  FOR EACH ROW EXECUTE FUNCTION atualizar_totais_lote();

CREATE TRIGGER trg_atualizar_lote_qualidade
  AFTER INSERT OR UPDATE OR DELETE ON tbapontamentoqualidade
  FOR EACH ROW EXECUTE FUNCTION atualizar_totais_lote();
```

### Trigger de Cache OEE

```sql
CREATE TRIGGER trg_cache_oee_concluido
  AFTER UPDATE ON tblote
  FOR EACH ROW
  WHEN (NEW.status = 'CONCLUIDO')
  EXECUTE FUNCTION cache_oee_lote_concluido();
```

---

## 05-views.sql - Views

Consulte `/docs/architecture.md` seção "3.7. Views Úteis" para código completo das 5 views:

1. `vw_diario_bordo`
2. `vw_diario_bordo_paradas`
3. `vw_dashboard_oee_linha`
4. `vw_pareto_paradas`
5. `vw_mtbf_mttr`

---

## 06-indexes.sql - Indexes

### Cadastros

```sql
CREATE INDEX idx_linha_setor ON tblinha(setor_id) WHERE ativo = TRUE;
CREATE INDEX idx_linha_codigo ON tblinha(codigo) WHERE ativo = TRUE;
CREATE INDEX idx_sku_totvs ON tbsku(codigo_totvs) WHERE ativo = TRUE;
CREATE INDEX idx_velocidade_linha_sku ON tbvelocidadenominal(linha_id, sku_id);
CREATE INDEX idx_codigo_parada_linha ON tbcodigoparada(linha_id) WHERE ativo = TRUE;
CREATE INDEX idx_usuario_matricula ON tbusuario(matricula) WHERE ativo = TRUE;
```

### Transações (CRÍTICO para performance)

```sql
CREATE INDEX idx_lote_linha_data ON tblote(linha_id, data_producao DESC);
CREATE INDEX idx_lote_status ON tblote(status, data_producao DESC);
CREATE INDEX idx_lote_numero ON tblote(numero_lote);

CREATE INDEX idx_apontamento_parada_lote ON tbapontamentoparada(lote_id);
CREATE INDEX idx_apontamento_parada_linha_data ON tbapontamentoparada(linha_id, data_parada DESC);

CREATE INDEX idx_apontamento_producao_lote ON tbapontamentoproducao(lote_id);
CREATE INDEX idx_apontamento_qualidade_lote ON tbapontamentoqualidade(lote_id);
```

### Cache/Auditoria

```sql
CREATE INDEX idx_oee_calc_linha_data ON tboeecalculado(linha_id, data_referencia DESC);
CREATE INDEX idx_audit_tabela_registro ON tbauditlog(tabela, registro_id, timestamp DESC);
```

---

## 07-rls-policies.sql - Row Level Security

### Habilitar RLS

```sql
ALTER TABLE tblinha ENABLE ROW LEVEL SECURITY;
ALTER TABLE tblote ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbapontamentoparada ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbapontamentoproducao ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbapontamentoqualidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE tboeecalculado ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbauditlog ENABLE ROW LEVEL SECURITY;
```

### Policy: Linha (exemplo)

```sql
CREATE POLICY operador_linha_policy ON tblinha
  FOR SELECT TO authenticated
  USING (
    EXISTS (
  SELECT 1 FROM tbusuario
  WHERE id = auth.uid()
        AND (
          tipo_usuario = 'ADMIN'
          OR tipo_usuario = 'GESTOR'
          OR (tipo_usuario IN ('SUPERVISOR', 'ENCARREGADO') AND setor_id = tb_linha.setor_id)
          OR (tipo_usuario = 'OPERADOR' AND linha_id = tb_linha.id)
        )
    )
  );
```

**Repetir para todas as tabelas com RLS.**

Consulte `/docs/architecture.md` seção "3.9. Row Level Security (RLS)" para todas as policies.

---

## 08-seeds.sql - Dados Iniciais

```sql
-- Turnos
INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee) VALUES
('D1', 'Diurno 1', '06:00', '14:00', 85.00),
('D2', 'Diurno 2', '14:00', '22:00', 85.00),
('N1', 'Noturno 1', '22:00', '06:00', 85.00);

-- Setores
INSERT INTO tbsetor (codigo, nome, descricao) VALUES
('SPEP', 'Soluções Parenterais de Embalagem Plástica', '...'),
('SPPV', 'Soluções Parenterais de Pequeno Volume - Vidros', '...'),
('LIQUIDOS', 'Líquidos Orais', '...'),
('CPHD', 'Concentrado Polieletrolítico para Hemodiálise', '...');

-- Linhas (exemplo - completar com as 37 linhas)
INSERT INTO tblinha (setor_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT
  s.id, 'SPEP-ENV-A', 'Linha A', 'ENVASE', TRUE, 'Bottelpack', 85.00
FROM tb_setor s WHERE s.codigo = 'SPEP';

-- Códigos de Parada Globais (exemplos)
INSERT INTO tbcodigoparada (
  linha_id, codigo, descricao,
  nivel_1_classe, nivel_2_grande_parada, nivel_3_apontamento,
  tipo_parada, impacta_disponibilidade
) VALUES
(NULL, 'ESTR-001', 'Parada Estratégica', 'Estratégica', 'Decisão Gerencial', 'Controle de Estoque', 'ESTRATEGICA', FALSE),
(NULL, 'PLAN-MAN-PRE', 'Manutenção Preventiva', 'Planejada', 'Manutenção', 'Preventiva', 'PLANEJADA', TRUE),
(NULL, 'NP-QUE-MEC', 'Quebra Mecânica', 'Não Planejada', 'Quebra/Falhas', 'Mecânica', 'NAO_PLANEJADA', TRUE);
```

---

## Nota Final

Para economizar tempo, você pode:

1. **Executar diretamente no Supabase SQL Editor** os blocos acima
2. **Consultar `/docs/architecture.md`** para DDL completo de cada function/view
3. **Usar este arquivo** como referência rápida

Os scripts **01 e 02 já estão completos e prontos** para execução imediata!
