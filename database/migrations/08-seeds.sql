-- =====================================================
-- Sistema OEE - SicFar | Farmace
-- Script: 08-seeds.sql
-- Descrição: Dados iniciais (seeds)
-- Versão: 1.0
-- Data: 2025-10-25
-- =====================================================

-- PRÉ-REQUISITO: Execute 01-07 antes deste script

-- =====================================================
-- TURNOS
-- =====================================================

INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee) VALUES
('D1', 'Diurno 1', '06:00', '14:00', 85.00),
('D2', 'Diurno 2', '14:00', '22:00', 85.00),
('N1', 'Noturno 1', '22:00', '06:00', 85.00)
ON CONFLICT (turno_id) DO NOTHING;

-- =====================================================
-- DEPARTAMENTOS
-- =====================================================

INSERT INTO tbdepartamento (codigo, nome, descricao) VALUES
('SPEP', 'Soluções Parenterais de Embalagem Plástica', 'Departamento de Soluções Parenterais em Embalagens Plásticas (Grande e Pequeno Volume). 10 linhas de envase + 10 linhas de embalagem.'),
('SPPV', 'Soluções Parenterais de Pequeno Volume - Vidros', 'Departamento de Soluções Parenterais de Pequeno Volume em frascos de vidro. 5 linhas de envase + 5 linhas de embalagem.'),
('LIQUIDOS', 'Líquidos Orais', 'Departamento de Líquidos Orais: Gotas (Pequeno Volume) e Xarope (Grande Volume). 3 linhas de envase + 2 encartuchadeiras.'),
('CPHD', 'Concentrado Polieletrolítico para Hemodiálise', 'Departamento de Produto de Concentrado Polieletrolítico para Hemodiálise. 2 linhas: Ácida e Básica.')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- LINHAS DE PRODUÇÃO (MVP: 37 linhas)
-- =====================================================

-- -------------------------------------------------------
-- SPEP - Envase (10 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-A', 'Linha A', 'ENVASE', TRUE, 'Bottelpack', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-B', 'Linha B', 'ENVASE', TRUE, 'Bottelpack', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-C', 'Linha C', 'ENVASE', TRUE, 'Bottelpack', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-D', 'Linha D', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-E', 'Linha E', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-F', 'Linha F', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-G', 'Linha G', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-H', 'Linha H', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-I', 'Linha I', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-ENV-SLE', 'SLE', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

-- -------------------------------------------------------
-- SPEP - Embalagem (10 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST02', 'Esteira 02', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST04', 'Esteira 04', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST05', 'Esteira 05', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST06', 'Esteira 06', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST07', 'Esteira 07', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST08', 'Esteira 08', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST09', 'Esteira 09', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-EST10', 'Esteira 10', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-H', 'Esteira H', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPEP-EMB-I', 'Esteira I', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPEP'
ON CONFLICT (codigo) DO NOTHING;

-- -------------------------------------------------------
-- SPPV - Envase (5 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-ENV-VIDRO01', 'Vidro 01', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-ENV-VIDRO02', 'Vidro 02', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-ENV-VIDRO03', 'Vidro 03', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-ENV-VIDRO04', 'Vidro 04', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-ENV-VIDRO05', 'Vidro 05', 'ENVASE', TRUE, 'Bausch Strobbel', 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

-- -------------------------------------------------------
-- SPPV - Embalagem (5 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-EMB-SALA01', 'Sala 01', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-EMB-SALA02', 'Sala 02', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-EMB-SALA04', 'Sala 04', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-EMB-SALA05', 'Sala 05', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'SPPV-EMB-SALA06', 'Sala 06', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'SPPV'
ON CONFLICT (codigo) DO NOTHING;

-- -------------------------------------------------------
-- LÍQUIDOS - Envase (3 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'LIQ-ENV-A', 'Linha A (L)', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'LIQUIDOS'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'LIQ-ENV-B', 'Linha B (L)', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'LIQUIDOS'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, tipo_clp, meta_oee_padrao)
SELECT s.id, 'LIQ-ENV-C', 'Linha C (L)', 'ENVASE', TRUE, 'Pró Maquia', 85.00 FROM tbdepartamento s WHERE s.codigo = 'LIQUIDOS'
ON CONFLICT (codigo) DO NOTHING;

-- -------------------------------------------------------
-- LÍQUIDOS - Embalagem (2 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'LIQ-EMB-VERTO', 'Encartuchadeira Vertopack', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'LIQUIDOS'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'LIQ-EMB-HICART', 'Encartuchadeira Hicart', 'EMBALAGEM', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'LIQUIDOS'
ON CONFLICT (codigo) DO NOTHING;

-- -------------------------------------------------------
-- CPHD (2 linhas)
-- -------------------------------------------------------
INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'CPHD-ACIDA', 'Linha Ácida', 'ENVASE', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'CPHD'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tblinha (departamento_id, codigo, nome, tipo, tem_clp, meta_oee_padrao)
SELECT s.id, 'CPHD-BASICA', 'Linha Básica', 'ENVASE', FALSE, 85.00 FROM tbdepartamento s WHERE s.codigo = 'CPHD'
ON CONFLICT (codigo) DO NOTHING;

-- Total: 37 linhas inseridas

-- =====================================================
-- CÓDIGOS DE PARADAS GLOBAIS (Exemplos)
-- =====================================================

-- Paradas Estratégicas
INSERT INTO tbcodigoparada (
  linha_id, codigo, descricao,
  nivel_1_classe, nivel_2_grande_parada, nivel_3_apontamento, nivel_4_grupo, nivel_5_detalhamento,
  tipo_parada, impacta_disponibilidade, tempo_minimo_registro
) VALUES
(NULL, 'ESTR-001', 'Parada Estratégica - Controle de Estoque', 'Estratégica', 'Decisão Gerencial', 'Controle de Estoque', NULL, NULL, 'ESTRATEGICA', FALSE, 10);

-- Paradas Planejadas
INSERT INTO tbcodigoparada (
  linha_id, codigo, descricao,
  nivel_1_classe, nivel_2_grande_parada, nivel_3_apontamento, nivel_4_grupo, nivel_5_detalhamento,
  tipo_parada, impacta_disponibilidade, tempo_minimo_registro
) VALUES
(NULL, 'PLAN-MAN-PRE', 'Manutenção Preventiva Programada', 'Planejada', 'Manutenção', 'Preventiva', 'Programada', NULL, 'PLANEJADA', TRUE, 10),
(NULL, 'PLAN-SETUP', 'Setup - Troca de Produto', 'Planejada', 'Setup', 'Troca de SKU', NULL, NULL, 'PLANEJADA', TRUE, 10),
(NULL, 'PLAN-LIMPEZA', 'Limpeza Programada CIP/SIP', 'Planejada', 'Limpeza', 'CIP/SIP', 'Sanitização', NULL, 'PLANEJADA', TRUE, 10);

-- Paradas Não Planejadas
INSERT INTO tbcodigoparada (
  linha_id, codigo, descricao,
  nivel_1_classe, nivel_2_grande_parada, nivel_3_apontamento, nivel_4_grupo, nivel_5_detalhamento,
  tipo_parada, impacta_disponibilidade, tempo_minimo_registro
) VALUES
(NULL, 'NP-QUE-MEC', 'Quebra Mecânica', 'Não Planejada', 'Quebra/Falhas', 'Mecânica', 'Equipamento', 'Extrusão, Sopro', 'NAO_PLANEJADA', TRUE, 10),
(NULL, 'NP-QUE-ELE', 'Quebra Elétrica', 'Não Planejada', 'Quebra/Falhas', 'Elétrica', 'Sistema Elétrico', NULL, 'NAO_PLANEJADA', TRUE, 10),
(NULL, 'NP-FAL-INS', 'Falta de Insumo', 'Não Planejada', 'Falta de Insumo', 'Material', 'Matéria-Prima', NULL, 'NAO_PLANEJADA', TRUE, 10),
(NULL, 'NP-FAL-EMB', 'Falta de Embalagem', 'Não Planejada', 'Falta de Insumo', 'Embalagem', 'Embalagem Primária', NULL, 'NAO_PLANEJADA', TRUE, 10);

-- Pequenas Paradas (< 10 min - afetam Performance)
INSERT INTO tbcodigoparada (
  linha_id, codigo, descricao,
  nivel_1_classe, nivel_2_grande_parada, nivel_3_apontamento, nivel_4_grupo, nivel_5_detalhamento,
  tipo_parada, impacta_disponibilidade, tempo_minimo_registro
) VALUES
(NULL, 'PP-AJUSTE', 'Pequeno Ajuste de Máquina', 'Não Planejada', 'Pequenas Paradas', 'Ajuste', 'Operacional', NULL, 'NAO_PLANEJADA', FALSE, 1);

-- 5. Criar usuários no Supabase Auth e popular tbusuario
