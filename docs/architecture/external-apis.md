# External APIs & Integrations

[← Voltar para Índice](./index.md)

## Integrações com Sistemas Externos

### 1. Integração CLPs (Controle de Linha de Produção)

#### Sensores KEYENCE (via Gateway SICFAR)
- **Formato:** Arquivos TXT
- **Frequência:** 4 registros/segundo
- **Dados:**
  - Contadores de produção
  - Contadores de rejeição
  - Timestamps

**Workflow:**
```
Sensor KEYENCE → Gateway SICFAR → TXT File
                                    ↓
                          Edge Function (parser)
                                    ↓
                    Update `ordens_producao_ativas`
                    (a cada 5 segundos, acumulado)
```

#### Outros CLPs
- **Bottelpack** - Linhas SPEP
- **Pró Maquia** - Linhas SPPV
- **Bausch Strobbel** - Linhas específicas

**Protocolo:** A definir (provavelmente OPC UA ou Modbus TCP)

### 2. Integração TOTVS (ERP)

#### Sincronização de Dados Mestres
**TOTVS → SicFar:**
- SKUs (produtos)
- Lotes de produção
- Velocidades nominais
- Insumos e lotes de insumo

**SicFar → TOTVS:**
- Produção realizada (contadores)
- Perdas de qualidade
- Status de lotes

#### Método de Integração
- **API REST** - Endpoints TOTVS
- **Webhooks** - Notificações de eventos
- **Sincronização Bidirecional** - App local + Edge Functions

**Workflow Abertura de Lote (TOTVS → SicFar):**
```
1. TOTVS: Ordem de Produção criada
2. Webhook/API call → Edge Function
3. Edge Function: Criar registro em `lotes_producao`
4. Frontend: Exibir novo lote disponível
```

**Workflow Fechamento de Lote (SicFar → TOTVS):**
```
1. Supervisor: Assina Diário de Bordo
2. Sistema: Calcula totais (produção, perdas)
3. Edge Function: POST para TOTVS API
4. TOTVS: Atualiza OP e estoque
```

### 3. Arquivos de Configuração

#### Endpoint Configuration
```json
{
  "totvs": {
    "baseUrl": "https://totvs.farmace.com/api",
    "endpoints": {
      "ordens": "/ordens-producao",
      "produtos": "/produtos",
      "lotes": "/lotes"
    },
    "auth": {
      "type": "bearer",
      "tokenUrl": "/auth/token"
    }
  },
  "clps": {
    "keyence": {
      "gateway": "192.168.1.100",
      "protocol": "file",
      "path": "/data/production"
    }
  }
}
```

### 4. Error Handling & Retry Logic

- **Exponential Backoff** - Tentativas com delay crescente
- **Dead Letter Queue** - Falhas persistentes para análise
- **Circuit Breaker** - Proteção contra sistemas indisponíveis
- **Logging** - Todas as tentativas e erros registrados

---

**Fontes:**
- `docs/project/07-Identificacao-Fontes-Dados.md`
- `docs/architecture.md` - Core Workflows

**Última Atualização:** 2025-10-25
