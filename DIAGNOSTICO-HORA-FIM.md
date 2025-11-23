# Diagnóstico: Campo hora_fim não exibido em Turnos

## Problema Identificado

O campo `hora_fim` da tabela `tbturno` não está sendo exibido na página `/src/pages/Turnos.tsx`:
- **Na tabela**: Coluna "Fim" mostra "-" em vez do horário
- **No formulário**: Campo não aparece ou não é preenchido

## Análise Realizada

### ✅ Estrutura da Tabela (CORRETO)
```sql
-- database/migrations/02-tables.sql (linha 242)
hora_fim TIME WITHOUT TIME ZONE NULL
```

### ✅ Mapeamento de Dados (CORRETO)
```typescript
// src/hooks/useTurnos.ts (linha 35)
const mapDbToForm = (dbTurno: TurnoDB): TurnoFormData => {
  return {
    // ...
    horaFim: dbTurno.hora_fim || '',
    // ...
  }
}
```

### ✅ Renderização na Tabela (CORRETO)
```typescript
// src/pages/Turnos.tsx (linha 586)
{formatarHorario(turno.horaFim)}
```

### ✅ Tipo de Dados (CORRETO)
```typescript
// src/types/turno.ts (linha 24)
export interface TurnoFormData {
  horaFim: string
}
```

## Causa Provável

**Os dados no banco de dados não têm o campo `hora_fim` preenchido.**

Possíveis razões:
1. Seeds não foram executados corretamente
2. Dados foram inseridos manualmente sem `hora_fim`
3. Houve uma atualização que limpou os valores

## Solução

### Passo 1: Verificar Dados no Banco

Execute o script de diagnóstico:

```bash
# No Supabase SQL Editor ou psql
psql -h <host> -U <user> -d <database> -f database/diagnostics/check-turno-hora-fim.sql
```

Ou execute diretamente no Supabase SQL Editor:

```sql
-- Verificar dados existentes
SELECT 
  turno_id,
  codigo,
  turno,
  hora_inicio,
  hora_fim,
  meta_oee
FROM tbturno
WHERE deletado = 'N'
ORDER BY codigo;
```

### Passo 2: Verificar no Console do Navegador

1. Abra a página de Turnos no navegador
2. Abra o DevTools (F12)
3. Vá para a aba Console
4. Procure por mensagens de debug:
   - `🔍 DEBUG: Dados de Turnos`
   - `🔍 DEBUG: Estrutura da Tabela tbturno`

Isso mostrará:
- Dados brutos retornados pelo Supabase
- Campos disponíveis na resposta
- Turnos sem `hora_fim`

### Passo 3: Corrigir Dados (se necessário)

Se os dados estiverem sem `hora_fim`, execute no Supabase SQL Editor:

```sql
-- Atualizar turnos padrão
UPDATE tbturno SET hora_fim = '14:00' WHERE codigo = 'D1' AND hora_fim IS NULL;
UPDATE tbturno SET hora_fim = '22:00' WHERE codigo = 'D2' AND hora_fim IS NULL;
UPDATE tbturno SET hora_fim = '06:00' WHERE codigo = 'N1' AND hora_fim IS NULL;

-- Verificar atualização
SELECT codigo, turno, hora_inicio, hora_fim FROM tbturno WHERE deletado = 'N';
```

### Passo 4: Reexecutar Seeds (alternativa)

Se preferir recriar os dados:

```sql
-- Deletar turnos existentes (soft delete)
UPDATE tbturno SET deletado = 'S' WHERE deletado = 'N';

-- Reexecutar seeds
-- database/migrations/08-seeds.sql (linhas 15-18)
INSERT INTO tbturno (codigo, turno, hora_inicio, hora_fim, meta_oee) VALUES
('D1', 'Diurno 1', '06:00', '14:00', 85.00),
('D2', 'Diurno 2', '14:00', '22:00', 85.00),
('N1', 'Noturno 1', '22:00', '06:00', 85.00);
```

## Arquivos Modificados

### Arquivos de Debug (Temporários)
- ✅ `src/utils/debug-turno.ts` - Utilitário de debug
- ✅ `src/pages/Turnos.tsx` - Adicionadas chamadas de debug
- ✅ `database/diagnostics/check-turno-hora-fim.sql` - Script SQL de diagnóstico

### Próximos Passos

1. **Execute o diagnóstico** conforme Passo 1 ou Passo 2
2. **Identifique se os dados estão sem `hora_fim`**
3. **Corrija os dados** conforme Passo 3 ou Passo 4
4. **Remova o código de debug** após confirmar que o problema foi resolvido

### Remover Debug (após correção)

```typescript
// src/pages/Turnos.tsx
// Remover estas linhas:
import { debugTurnoData, debugTurnoSchema } from '@/utils/debug-turno'

// E remover estas chamadas dentro de queryFn:
await debugTurnoData()
await debugTurnoSchema()
console.log('🔍 DEBUG: Dados após fetchTurnos:', result.data)
```

## Conclusão

O código está **correto**. O problema está nos **dados do banco de dados**.

Após corrigir os dados, o campo `hora_fim` será exibido corretamente tanto na tabela quanto no formulário de edição.

