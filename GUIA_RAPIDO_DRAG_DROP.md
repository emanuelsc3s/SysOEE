# 🚀 Guia Rápido: Drag-and-Drop no Kanban

## ⚡ Início Rápido (2 minutos)

### 1. Inicie o servidor
```bash
npm run dev
```

### 2. Acesse a aplicação
- Abra: http://localhost:5173
- Clique em "Operação"

### 3. Teste o drag-and-drop
1. **Clique e segure** em qualquer card de OP
2. **Arraste** para outra coluna (fase)
3. **Solte** o card
4. ✅ Pronto! A OP foi movida

---

## 🎯 Como Usar

### Mover uma OP entre fases:

```
1. Posicione o cursor sobre um card de OP
   ↓
2. Clique e segure (cursor vira uma "mão")
   ↓
3. Arraste para a coluna desejada
   ↓
4. Observe o feedback visual:
   - Card original fica semi-transparente
   - Preview segue o cursor
   - Coluna de destino ganha anel colorido
   ↓
5. Solte o mouse
   ↓
6. ✅ OP movida com sucesso!
```

---

## 👀 Feedback Visual

### O que você verá:

#### Ao clicar no card:
- 🖱️ Cursor muda para "mão fechada"
- 👻 Card original fica semi-transparente (50%)
- 📦 Preview do card segue o cursor

#### Ao passar sobre uma coluna:
- 💍 Anel colorido ao redor da coluna
- 📏 Coluna aumenta levemente (102%)
- 📝 Se vazia, mostra "Solte aqui"

#### Ao soltar:
- ✨ Animação suave de transição
- 📊 Contador da coluna atualiza
- 💾 Dados salvos automaticamente

---

## 💾 Persistência

### Seus dados são salvos automaticamente!

- ✅ Ao mover uma OP, ela é salva no navegador
- ✅ Ao recarregar a página (F5), as OPs permanecem nas fases corretas
- ✅ Funciona mesmo sem internet (localStorage)

### Testar persistência:
1. Mova algumas OPs
2. Pressione F5
3. Verifique que as OPs estão nas mesmas fases

---

## 🔍 Verificar Logs

### Console do Navegador (F12):

Você verá mensagens como:

```
🎯 Iniciando arrasto da OP: 001234
📦 Movendo OP 001234 para fase "Envase"
✅ OP 001234: "Preparação" → "Envase"
💾 Dados salvos no localStorage: 20 OPs
```

---

## ❌ Cancelar um Arrasto

### Opção 1: Soltar fora das colunas
- Arraste o card
- Solte em área vazia (fora das colunas)
- Card retorna à posição original

### Opção 2: Pressionar ESC
- Durante o arrasto, pressione ESC
- Card retorna à posição original

---

## 📱 Funciona em Dispositivos Touch

### Tablet/Smartphone:
1. **Toque e segure** no card
2. **Arraste** com o dedo
3. **Solte** na coluna desejada

---

## ⚠️ Dicas Importantes

### ✅ Faça:
- Arraste pelo menos 8px antes de soltar (evita conflitos com cliques)
- Observe o feedback visual para confirmar o destino
- Use em navegadores modernos (Chrome, Firefox, Safari, Edge)

### ❌ Evite:
- Clicar rapidamente sem arrastar (não vai funcionar)
- Usar em navegadores muito antigos
- Modo privado/anônimo (localStorage pode não funcionar)

---

## 🎓 Exemplos de Uso

### Exemplo 1: Mover OP de Planejado para Emissão de Dossiê
```
1. Encontre uma OP na coluna "Planejado"
2. Clique e segure no card
3. Arraste para a coluna "Emissão de Dossiê"
4. Solte
5. ✅ OP agora está em "Emissão de Dossiê"
```

### Exemplo 2: Mover OP de Envase para Embalagem
```
1. Encontre uma OP na coluna "Envase"
2. Clique e segure no card
3. Arraste para a coluna "Embalagem"
4. Observe o anel colorido na coluna "Embalagem"
5. Solte
6. ✅ OP agora está em "Embalagem"
```

### Exemplo 3: Concluir uma OP
```
1. Encontre uma OP na coluna "Embalagem"
2. Clique e segure no card
3. Arraste para a coluna "Concluído"
4. Solte
5. ✅ OP marcada como concluída
```

---

## 🔧 Solução Rápida de Problemas

### Card não arrasta?
**Solução**: Arraste pelo menos 8px (cerca de 1cm na tela)

### Dados não salvam?
**Solução**: Verifique se não está em modo anônimo/privado

### Feedback visual não aparece?
**Solução**: Atualize a página (F5) e tente novamente

---

## 📊 Estatísticas

Após mover OPs, observe:
- 🔢 Contador de OPs em cada coluna atualiza
- 📈 Estatísticas no topo da página atualizam
- 💾 Dados salvos automaticamente

---

## 🎉 Pronto!

Agora você sabe usar o drag-and-drop no Kanban!

**Dúvidas?** Consulte:
- `DRAG_AND_DROP_IMPLEMENTATION.md` - Documentação técnica
- `RESUMO_IMPLEMENTACAO.md` - Resumo da implementação

---

**Sistema OEE SicFar - Drag-and-Drop v1.0**

