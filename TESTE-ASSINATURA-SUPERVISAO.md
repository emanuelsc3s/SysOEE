# 🧪 Guia de Teste: Modal de Assinatura de Aprovação da Supervisão

## 📋 Pré-requisitos

1. Sistema rodando em modo desenvolvimento:
   ```bash
   npm run dev
   ```

2. Navegador aberto em: `http://localhost:5173`

3. Acesso à página de Operação (Kanban ou Equipamentos)

## 🎯 Cenários de Teste

### ✅ Teste 1: Abrir Modal de Assinatura

**Passos:**
1. Navegue até a página de Operação
2. Localize um card de OP (Ordem de Produção)
3. Role até a área de botões de ação
4. Clique no botão "Assinar" (ícone de caneta)

**Resultado Esperado:**
- Modal abre com título "Assinatura de Aprovação da Supervisão"
- Informações do supervisor são exibidas (nome, crachá)
- Data e hora atual são exibidas e atualizadas a cada segundo
- Canvas de assinatura está vazio e pronto para uso
- Botões "Limpar", "Cancelar" e "Confirmar Assinatura" estão visíveis

---

### ✅ Teste 2: Desenhar Assinatura com Mouse (Desktop)

**Passos:**
1. Abra o modal de assinatura
2. Posicione o cursor sobre o canvas (área branca com borda tracejada)
3. Clique e arraste para desenhar sua assinatura
4. Solte o botão do mouse

**Resultado Esperado:**
- Traços aparecem no canvas conforme você desenha
- Cor preta, espessura variável (mais fino em movimentos rápidos)
- Canvas responde suavemente aos movimentos

---

### ✅ Teste 3: Desenhar Assinatura com Toque (Tablet/Mobile)

**Passos:**
1. Abra o modal em um dispositivo touch (tablet ou smartphone)
2. Toque no canvas e arraste o dedo para desenhar
3. Levante o dedo

**Resultado Esperado:**
- Assinatura é desenhada seguindo o movimento do dedo
- Sem lag ou atraso perceptível
- Canvas não rola a página durante o desenho

---

### ✅ Teste 4: Limpar Assinatura

**Passos:**
1. Desenhe uma assinatura no canvas
2. Clique no botão "Limpar" (ícone de borracha)

**Resultado Esperado:**
- Canvas é completamente limpo
- Volta ao estado inicial (branco)
- Pronto para nova assinatura

---

### ✅ Teste 5: Tentar Confirmar Sem Assinar (Validação)

**Passos:**
1. Abra o modal de assinatura
2. **NÃO** desenhe nada no canvas
3. Clique em "Confirmar Assinatura"

**Resultado Esperado:**
- Mensagem de erro aparece: "Por favor, assine no campo acima antes de confirmar."
- Fundo vermelho claro com ícone de alerta
- Modal permanece aberto
- Assinatura não é salva

---

### ✅ Teste 6: Confirmar Assinatura Válida

**Passos:**
1. Abra o modal de assinatura
2. Desenhe uma assinatura no canvas
3. Clique em "Confirmar Assinatura"

**Resultado Esperado:**
- Modal fecha automaticamente
- Notificação de sucesso aparece (toast verde):
  - Título: "Assinatura registrada com sucesso!"
  - Descrição: "OP [número] assinada por [nome do supervisor]"
- Assinatura é salva no localStorage

---

### ✅ Teste 7: Cancelar Assinatura

**Passos:**
1. Abra o modal de assinatura
2. Desenhe uma assinatura (ou não)
3. Clique em "Cancelar"

**Resultado Esperado:**
- Modal fecha imediatamente
- Nenhuma notificação é exibida
- Assinatura **NÃO** é salva
- Canvas é limpo automaticamente

---

### ✅ Teste 8: Verificar Salvamento no localStorage

**Passos:**
1. Confirme uma assinatura válida
2. Abra o DevTools do navegador (F12)
3. Vá para a aba "Application" (Chrome) ou "Storage" (Firefox)
4. Expanda "Local Storage" → `http://localhost:5173`
5. Procure pela chave `sicfar_assinaturas_supervisao`

**Resultado Esperado:**
- Chave existe no localStorage
- Valor é um array JSON com a(s) assinatura(s)
- Cada assinatura contém:
  ```json
  {
    "id": "ASS-OP123456-1234567890",
    "op": "OP123456",
    "nomeSupervisor": "João Silva Santos",
    "numeroCracha": "12345",
    "dataHoraAssinatura": "2025-10-29T...",
    "assinaturaBase64": "data:image/png;base64,...",
    "supervisorId": 1,
    "created_at": "2025-10-29T...",
    "created_by": 1
  }
  ```

---

### ✅ Teste 9: Verificar Assinatura Base64

**Passos:**
1. Copie o valor de `assinaturaBase64` do localStorage
2. Abra uma nova aba do navegador
3. Cole o valor na barra de endereços
4. Pressione Enter

**Resultado Esperado:**
- Imagem PNG da assinatura é exibida
- Fundo branco, traços pretos
- Assinatura idêntica à desenhada no canvas

---

### ✅ Teste 10: Responsividade - Desktop (> 1024px)

**Passos:**
1. Redimensione a janela do navegador para > 1024px de largura
2. Abra o modal de assinatura

**Resultado Esperado:**
- Modal: 600px de largura
- Canvas: 192px de altura (h-48)
- Botões: Tamanho padrão
- Layout confortável e espaçoso

---

### ✅ Teste 11: Responsividade - Tablet (1000x400px)

**Passos:**
1. Redimensione a janela para 1000x400px (ou use DevTools)
2. Abra o modal de assinatura

**Resultado Esperado:**
- Modal: 500px de largura
- Canvas: 160px de altura (h-40)
- Botões: Texto menor (text-xs)
- Padding reduzido
- Tudo visível sem scroll excessivo

---

### ✅ Teste 12: Responsividade - Mobile (< 640px)

**Passos:**
1. Redimensione a janela para < 640px (ou use DevTools)
2. Abra o modal de assinatura

**Resultado Esperado:**
- Modal: Largura total com margens
- Canvas: Responsivo ao container
- Layout vertical otimizado
- Botões empilhados verticalmente

---

### ✅ Teste 13: Data/Hora em Tempo Real

**Passos:**
1. Abra o modal de assinatura
2. Observe o campo "Data e Hora"
3. Aguarde 1 minuto

**Resultado Esperado:**
- Data/hora atualiza a cada segundo
- Formato brasileiro: DD/MM/YYYY HH:mm:ss
- Exemplo: "29/10/2025 14:35:42"
- Segundos incrementam continuamente

---

### ✅ Teste 14: Múltiplas Assinaturas na Mesma OP

**Passos:**
1. Assine uma OP
2. Abra o modal novamente para a mesma OP
3. Assine novamente

**Resultado Esperado:**
- Ambas as assinaturas são salvas
- localStorage contém array com 2 assinaturas
- Cada uma com ID único e timestamp diferente

---

### ✅ Teste 15: Console do Navegador (Logs)

**Passos:**
1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Confirme uma assinatura

**Resultado Esperado:**
- Log: "Assinatura confirmada: [objeto]"
- Log: "✅ Assinatura salva no localStorage: ASS-OP..."
- Nenhum erro em vermelho

---

## 🔍 Testes Avançados (Opcional)

### 🧪 Teste A: Exportar Assinaturas

**Console do Navegador:**
```javascript
// Importar função
import { exportarAssinaturasJSON } from '@/services/localStorage/assinatura.storage'

// Exportar
const json = exportarAssinaturasJSON()
console.log(json)
```

**Resultado Esperado:**
- JSON formatado com todas as assinaturas
- Pode ser copiado e salvo em arquivo

---

### 🧪 Teste B: Buscar Assinaturas por OP

**Console do Navegador:**
```javascript
import { buscarAssinaturasPorOP } from '@/services/localStorage/assinatura.storage'

const assinaturas = buscarAssinaturasPorOP('OP123456')
console.log(assinaturas)
```

**Resultado Esperado:**
- Array com assinaturas da OP especificada
- Vazio se OP não foi assinada

---

### 🧪 Teste C: Estatísticas de Assinaturas

**Console do Navegador:**
```javascript
import { obterEstatisticasAssinaturas } from '@/services/localStorage/assinatura.storage'

const stats = obterEstatisticasAssinaturas()
console.log(stats)
```

**Resultado Esperado:**
```javascript
{
  total: 5,
  porSupervisor: {
    "João Silva Santos": 3,
    "Maria Oliveira": 2
  },
  porDia: {
    "29/10/2025": 5
  },
  opsAssinadas: 4
}
```

---

## ✅ Checklist de Validação Final

Marque cada item após testar:

- [ ] Modal abre corretamente
- [ ] Informações do supervisor são exibidas
- [ ] Data/hora atualiza em tempo real
- [ ] Canvas aceita desenho com mouse
- [ ] Canvas aceita desenho com toque (se disponível)
- [ ] Botão "Limpar" funciona
- [ ] Validação de assinatura vazia funciona
- [ ] Confirmação salva no localStorage
- [ ] Notificação de sucesso aparece
- [ ] Botão "Cancelar" fecha sem salvar
- [ ] Assinatura em base64 é válida
- [ ] Responsivo em desktop
- [ ] Responsivo em tablet
- [ ] Responsivo em mobile
- [ ] Sem erros no console

---

## 🐛 Problemas Conhecidos e Soluções

### Problema: Canvas não responde ao toque

**Solução:**
- Verifique se está usando um dispositivo touch real (não emulação)
- Certifique-se de que `touch-none` está aplicado ao canvas
- Teste em navegador mobile real

### Problema: Data/hora não atualiza

**Solução:**
- Verifique se o modal está aberto
- Abra o console e procure por erros
- Recarregue a página

### Problema: Assinatura não salva

**Solução:**
- Verifique se localStorage está habilitado
- Abra o console e procure por erros
- Verifique se a assinatura não está vazia

---

## 📞 Suporte

Se encontrar algum problema não listado aqui, verifique:

1. Console do navegador (F12 → Console)
2. Arquivo de documentação: `IMPLEMENTACAO-ASSINATURA-SUPERVISAO.md`
3. Código-fonte: `src/components/operacao/ModalAssinaturaSupervisao.tsx`

---

**Última atualização:** 29/10/2025

