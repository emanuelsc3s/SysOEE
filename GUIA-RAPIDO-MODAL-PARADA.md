# 🚀 Guia Rápido: Modal de Apontamento de Parada

## ⚡ Início Rápido (3 passos)

### 1️⃣ Iniciar o Servidor

```bash
npm run dev
```

### 2️⃣ Acessar a Página

```
http://localhost:8081/operacao/136592
```

### 3️⃣ Clicar no Botão "Parada"

Botão com ícone de pause (⏸️) na seção de ações rápidas.

---

## 📝 Como Preencher o Formulário

### Passo 1: Selecione a Classe de Parada

Escolha entre:
- **Estratégica** - Decisão gerencial (não afeta OEE)
- **Planejada** - Manutenção, setup, limpeza
- **Não Planejada** - Quebras, faltas, ajustes

### Passo 2: Selecione a Grande Parada

Exemplos:
- Manutenção
- Setup
- Quebra/Falhas
- Falta de Insumo
- Pequenas Paradas

### Passo 3: Complete a Hierarquia

Continue selecionando os níveis seguintes conforme aparecem:
- Nível 3: Apontamento
- Nível 4: Grupo
- Nível 5: Detalhamento

**Nota**: Nem todos os códigos têm 5 níveis. Selecione apenas os que aparecem.

### Passo 4: Verifique Data/Hora

- **Data**: Pré-preenchida com hoje
- **Hora**: Pré-preenchida com hora atual
- **Turno**: Detectado automaticamente

**Ajuste apenas se necessário** (tolerância de 5 minutos).

### Passo 5: Adicione Observações (Opcional)

Descreva detalhes sobre a parada (máximo 500 caracteres).

### Passo 6: Registrar

Clique em **"Registrar Parada"**.

---

## ✅ Exemplo Prático

### Cenário: Quebra Mecânica na Linha A

1. **Classe**: Não Planejada
2. **Grande Parada**: Quebra/Falhas
3. **Apontamento**: Mecânica
4. **Grupo**: Equipamento
5. **Detalhamento**: Extrusão, Sopro
6. **Data**: 2025-01-31 (automático)
7. **Hora**: 14:30 (automático)
8. **Turno**: 2º Turno (automático)
9. **Observações**: "Quebra do cilindro de extrusão. Manutenção acionada."

**Resultado**: Parada registrada com sucesso! ✅

---

## 🎯 Códigos de Parada Disponíveis (Mock)

### Estratégicas
- **ESTR-001**: Controle de Estoque

### Planejadas
- **PLAN-MAN-PRE**: Manutenção Preventiva
- **PLAN-SETUP**: Troca de Produto
- **PLAN-LIMPEZA**: Limpeza CIP/SIP

### Não Planejadas
- **NP-QUE-MEC**: Quebra Mecânica ⚙️
- **NP-QUE-ELE**: Quebra Elétrica ⚡
- **NP-FAL-INS**: Falta de Insumo 📦
- **NP-FAL-EMB**: Falta de Embalagem 📦
- **PP-AJUSTE**: Pequeno Ajuste (< 10 min) 🔧

---

## ⏰ Turnos Disponíveis

- **1º Turno**: 06:00 - 14:00 ☀️
- **2º Turno**: 14:00 - 22:00 🌆
- **3º Turno**: 22:00 - 06:00 🌙
- **Administrativo**: 08:00 - 17:00 💼

---

## 🔍 Validações Automáticas

O sistema valida automaticamente:

✅ Hierarquia completa selecionada
✅ Data/hora não é futura
✅ Turno selecionado
✅ Código de parada existe

**Se houver erro**, campos ficam com borda vermelha e mensagem de erro aparece.

---

## 💡 Dicas

### ✨ Registro Contemporâneo (ALCOA+)

- Data e hora são **pré-preenchidas** com o momento atual
- Isso garante que a parada seja registrada **no momento em que ocorre**
- Ajuste apenas se necessário (tolerância de 5 minutos)

### 🎯 Detecção Automática de Turno

- O sistema detecta automaticamente o turno baseado na hora
- Confirme se está correto antes de salvar

### 📝 Observações Úteis

Inclua informações como:
- Causa raiz da parada
- Ações tomadas
- Responsável pelo reparo
- Peças substituídas
- Tempo estimado de reparo

### ⚠️ Pequenas Paradas (< 10 min)

Paradas menores que 10 minutos afetam **Performance**, não **Disponibilidade**.

Exemplo: `PP-AJUSTE` (Pequeno Ajuste de Máquina)

---

## 🐛 Solução de Problemas

### ❌ Tela em branco com erro "Missing Supabase environment variables"

**Causa**: Variáveis de ambiente do Supabase não configuradas.

**Solução**:
1. O arquivo `.env` já foi criado na raiz do projeto
2. O sistema funcionará em **modo MOCK** automaticamente
3. Recarregue a página (F5)
4. Você verá um aviso no console: `⚠️ Variáveis de ambiente do Supabase não configuradas`
5. Isso é **normal** - o sistema funcionará com dados mock

**Para configurar Supabase real** (opcional):
1. Edite o arquivo `.env` na raiz do projeto
2. Descomente e configure as variáveis:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Reinicie o servidor: `npm run dev`

### Modal não abre

**Solução**: Recarregue a página (F5) e tente novamente.

### Dados não aparecem

**Solução**: Verifique o console do navegador (F12) para erros.

### Erro ao salvar

**Solução**: 
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Confirme que a data/hora não é futura
3. Tente novamente

### Hierarquia não carrega

**Solução**: 
1. Selecione a Classe de Parada primeiro
2. Aguarde os próximos níveis aparecerem
3. Selecione em ordem (1 → 2 → 3 → 4 → 5)

---

## 📱 Responsividade

O modal funciona em:

- ✅ Desktop (1920x1080)
- ✅ Tablet de Produção (1000x400) - **Otimizado**
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

**Recomendado**: Tablet de produção em modo paisagem.

---

## 🔧 Modo Desenvolvimento (Mock)

Por padrão, o sistema usa **dados mock** (não salva no banco).

Para ver os dados sendo "salvos":
1. Abra o console do navegador (F12)
2. Registre uma parada
3. Veja o log: `✅ Apontamento mock criado:`

**Para usar Supabase real**:
```typescript
// src/services/api/parada.api.ts
const USE_MOCK_DATA = false
```

---

## 📚 Documentação Completa

- **README Detalhado**: `src/components/operacao/README-MODAL-PARADA.md`
- **Implementação**: `IMPLEMENTACAO-MODAL-PARADA.md`
- **Especificação**: `docs/project/05-Metodologia-Calculo.md`

---

## 🎉 Pronto!

Agora você pode registrar paradas de produção de forma rápida e eficiente, seguindo os princípios ALCOA+ do sistema OEE SicFar.

**Dúvidas?** Consulte a documentação completa ou o console do navegador para logs detalhados.

