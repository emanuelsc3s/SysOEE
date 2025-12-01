# Diagrama de Relacionamentos - Sistema OEE SicFar

## Diagrama Entidade-Relacionamento (ER)

```mermaid
erDiagram
    tbdepartamento ||--o{ tblinhaproducao : "possui"
    tblinhaproducao ||--o{ tblote : "produz"
    tblinhaproducao ||--o{ tbcodigo_parada : "tem códigos"
    tblinhaproducao ||--o{ tbsku_velocidade_nominal : "possui velocidades"
    tblinhaproducao ||--o{ tbapontamento_producao : "registra"
    tblinhaproducao ||--o{ tbapontamento_parada : "registra"
    tblinhaproducao ||--o{ tbapontamento_perdas : "registra"
    tblinhaproducao ||--o{ tbapontamento_retrabalho : "registra"
    tblinhaproducao ||--o{ tboee_calculado : "calcula"
    tblinhaproducao ||--o{ tbindicador_mtbf : "calcula"
    tblinhaproducao ||--o{ tbindicador_mttr : "calcula"
    
    tbsku ||--o{ tbsku_velocidade_nominal : "possui velocidades"
    tbsku ||--o{ tblote : "é produzido em"
    tbsku ||--o{ tbapontamento_producao : "é produzido"
    tbsku ||--o{ tbapontamento_perdas : "tem perdas"
    tbsku ||--o{ tbapontamento_retrabalho : "tem retrabalho"
    tbsku ||--o{ tboee_calculado : "calcula"
    
    tbturno ||--o{ tblote : "produz em"
    tbturno ||--o{ tbapontamento_producao : "registra em"
    tbturno ||--o{ tbapontamento_parada : "registra em"
    tbturno ||--o{ tbapontamento_perdas : "registra em"
    tbturno ||--o{ tbapontamento_retrabalho : "registra em"
    tbturno ||--o{ tboee_calculado : "calcula em"
    
    tblote ||--o{ tbapontamento_producao : "possui"
    tblote ||--o{ tbapontamento_parada : "possui"
    tblote ||--o{ tbapontamento_perdas : "possui"
    tblote ||--o{ tbapontamento_retrabalho : "possui"
    tblote ||--|| tboee_calculado : "calcula"
    
    tbcodigo_parada ||--o{ tbapontamento_parada : "classifica"
    tbcodigo_parada ||--o{ tbindicador_mtbf : "analisa"
    tbcodigo_parada ||--o{ tbindicador_mttr : "analisa"
    
    tbusuario ||--o{ tblote : "cria/atualiza"
    tbusuario ||--o{ tbapontamento_producao : "cria/atualiza"
    tbusuario ||--o{ tbapontamento_parada : "cria/atualiza"
    tbusuario ||--o{ tbapontamento_perdas : "cria/atualiza"
    tbusuario ||--o{ tbapontamento_retrabalho : "cria/atualiza"
    tbusuario ||--o{ tboee_calculado : "cria/atualiza"
    
    tbdepartamento {
        int departamento_id PK
        varchar departamento
        varchar sigla UK
        varchar descricao
        char ativo
        timestamp created_at
        int created_by FK
    }
    
    tblinhaproducao {
        int linhaproducao_id PK
        varchar linhaproducao
        int departamento_id FK
        varchar tipo
        numeric meta_oee
        char ativo
        timestamp created_at
        int created_by FK
    }
    
    tbturno {
        int turno_id PK
        varchar codigo UK
        varchar turno
        time hora_inicio
        time hora_fim
        numeric duracao_horas
        numeric meta_oee
        timestamp created_at
        int created_by FK
    }
    
    tbsku {
        int sku_id PK
        varchar codigo_sku UK
        text descricao
        varchar codigo_totvs
        text descricao_totvs
        varchar registro_anvisa
        varchar codigo_barras
        char ativo
        timestamp created_at
        int created_by FK
    }
    
    tbsku_velocidade_nominal {
        int sku_velocidade_id PK
        int sku_id FK
        int linhaproducao_id FK
        int velocidade_nominal
        date data_vigencia_inicio
        date data_vigencia_fim
        text observacao
        timestamp created_at
        int created_by FK
    }
    
    tbcodigo_parada {
        int codigo_parada_id PK
        int linhaproducao_id FK
        varchar codigo
        text descricao
        varchar nivel_1_classe
        varchar nivel_2_grande_parada
        varchar nivel_3_apontamento
        varchar nivel_4_grupo
        varchar nivel_5_detalhamento
        varchar tipo_parada
        boolean impacta_disponibilidade
        int tempo_minimo_registro
        char ativo
        timestamp created_at
        int created_by FK
    }
    
    tblote {
        int lote_id PK
        varchar numero_lote UK
        int linhaproducao_id FK
        int sku_id FK
        int turno_id FK
        date data_producao
        time hora_inicio
        time hora_fim
        int producao_inicial
        int producao_atual
        int unidades_produzidas
        int unidades_boas
        int unidades_refugo
        int tempo_retrabalho_minutos
        varchar status
        varchar ordem_producao_totvs
        varchar dossie
        timestamp totvs_sincronizado_em
        int conferido_por_supervisor FK
        timestamp conferido_em
        timestamp created_at
        int created_by FK
    }
    
    tbapontamento_producao {
        int apontamento_producao_id PK
        int lote_id FK
        int linhaproducao_id FK
        int sku_id FK
        int turno_id FK
        date data_apontamento
        time hora_inicio
        time hora_fim
        int quantidade_produzida
        int velocidade_nominal
        numeric tempo_operacao
        numeric tempo_disponivel
        varchar origem_dados
        timestamp created_at
        int created_by FK
    }
    
    tbapontamento_parada {
        int apontamento_parada_id PK
        int linhaproducao_id FK
        int lote_id FK
        int codigo_parada_id FK
        int turno_id FK
        date data_parada
        time hora_inicio
        time hora_fim
        int duracao_minutos
        text observacao
        varchar status
        timestamp created_at
        int created_by FK
    }
    
    tbapontamento_perdas {
        int apontamento_perdas_id PK
        int lote_id FK
        int linhaproducao_id FK
        int sku_id FK
        int turno_id FK
        date data_apontamento
        varchar tipo_perda
        int unidades_refugadas
        text motivo
        varchar origem_dados
        boolean totvs_integrado
        timestamp totvs_sincronizado_em
        text observacao
        timestamp created_at
        int created_by FK
    }
```

## Relacionamentos Detalhados

### 1. Hierarquia Organizacional

```
tbdepartamento (Setor)
    └── tblinhaproducao (Linha de Produção)
            ├── tblote (Lote de Produção)
            ├── tbcodigo_parada (Códigos de Paradas)
            └── tbsku_velocidade_nominal (Velocidades Nominais)
```

### 2. Fluxo de Apontamento

```
tblote (Lote)
    ├── tbapontamento_producao (Produção)
    ├── tbapontamento_parada (Paradas)
    ├── tbapontamento_perdas (Perdas)
    ├── tbapontamento_retrabalho (Retrabalho)
    └── tboee_calculado (OEE Calculado)
```

### 3. Cálculo de OEE

```
tboee_calculado
    ├── Entrada: tbapontamento_producao
    ├── Entrada: tbapontamento_parada
    ├── Entrada: tbapontamento_perdas
    ├── Entrada: tbapontamento_retrabalho
    └── Saída: Disponibilidade, Performance, Qualidade, OEE
```

### 4. Indicadores Secundários

```
tbindicador_mtbf
    └── Entrada: tbapontamento_parada (tipo_parada = 'NAO_PLANEJADA')

tbindicador_mttr
    └── Entrada: tbapontamento_parada (duracao_minutos)
```

