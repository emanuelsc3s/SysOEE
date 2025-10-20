# 🚀 Guia Rápido: Conclusão de OP com Validação

## ⚡ Como Concluir uma OP (2 minutos)

### **Passo a Passo**:

#### 1️⃣ **Arraste a OP para "Concluído"**
- Clique e segure no card da OP
- Arraste para a coluna "Concluído"
- Solte o card

#### 2️⃣ **Confirme a Conclusão** (Diálogo 1)
- Leia as informações da OP
- Clique em **"Confirmar"** para prosseguir
- Ou clique em **"Cancelar"** para desistir

#### 3️⃣ **Informe os Dados de Produção** (Diálogo 2)
- Digite a **Quantidade Produzida** (obrigatório, > 0)
- Digite as **Perdas** (obrigatório, ≥ 0)
- Clique em **"Salvar e Concluir"**

#### 4️⃣ **Pronto!** ✅
- OP aparece na coluna "Concluído"
- Dados atualizados são exibidos no card
- Tudo salvo automaticamente

---

## 📝 Exemplo Prático

### **Cenário**: Concluir OP 001234

```
1. Arraste OP 001234 para "Concluído"
   ↓
2. Diálogo aparece:
   "Deseja realmente marcar esta OP como concluída?"
   OP 001234
   Produto XYZ 500ml
   Lote: L123456
   Equipamento: Linha A
   
   [Cancelar]  [Confirmar] ← Clique aqui
   ↓
3. Segundo diálogo aparece:
   "Dados de Produção - OP 001234"
   
   Quantidade Produzida *
   [9500] ← Digite aqui
   
   Perdas *
   [50] ← Digite aqui (ou 0 se não houver)
   
   [Cancelar]  [Salvar e Concluir] ← Clique aqui
   ↓
4. ✅ OP 001234 concluída!
   - Produzido: 9500
   - Perdas: 50
   - Fase: Concluído
```

---

## ⚠️ Validações Importantes

### **Quantidade Produzida**:
- ❌ Não pode estar vazio
- ❌ Não pode ser zero
- ❌ Não pode ser negativo
- ✅ Deve ser maior que zero

### **Perdas**:
- ❌ Não pode estar vazio
- ❌ Não pode ser negativo
- ✅ Pode ser zero (se não houver perdas)
- ✅ Pode ser qualquer número positivo

---

## 🔄 Cancelar a Conclusão

### **Opção 1: Cancelar no Primeiro Diálogo**
1. Arraste OP para "Concluído"
2. Clique em **"Cancelar"**
3. ✅ OP retorna para fase original

### **Opção 2: Cancelar no Segundo Diálogo**
1. Arraste OP para "Concluído"
2. Confirme no primeiro diálogo
3. Clique em **"Cancelar"** no formulário
4. ✅ OP retorna para fase original

### **Opção 3: Fechar o Diálogo (X)**
1. Clique no X no canto do diálogo
2. ✅ OP retorna para fase original

---

## 💡 Dicas Úteis

### ✅ **Faça**:
- Verifique as informações da OP antes de confirmar
- Digite valores realistas de produção
- Informe 0 (zero) nas perdas se não houver
- Use a tecla Enter para avançar entre campos

### ❌ **Evite**:
- Deixar campos vazios
- Digitar valores negativos
- Digitar zero na quantidade produzida
- Fechar o navegador durante o processo

---

## 🎯 Atalhos de Teclado

- **Enter**: Salvar formulário (após preencher campos)
- **Esc**: Fechar diálogo (cancela a conclusão)
- **Tab**: Navegar entre campos

---

## 🐛 Problemas Comuns

### **Erro: "Campo obrigatório"**
**Causa**: Campo vazio  
**Solução**: Digite um valor válido

### **Erro: "Deve ser maior que zero"**
**Causa**: Quantidade produzida = 0  
**Solução**: Digite um valor maior que zero

### **Erro: "Não pode ser negativo"**
**Causa**: Perdas < 0  
**Solução**: Digite 0 ou um valor positivo

### **OP não move para "Concluído"**
**Causa**: Validação falhou ou cancelou  
**Solução**: Verifique os campos e tente novamente

---

## 📊 O que Acontece Após Concluir

### **No Card da OP**:
- ✅ Aparece na coluna "Concluído"
- ✅ Quantidade produzida atualizada
- ✅ Perdas atualizadas
- ✅ Porcentagem de progresso recalculada

### **No Sistema**:
- ✅ Dados salvos no localStorage
- ✅ Logs registrados no console
- ✅ Estatísticas atualizadas

### **Ao Recarregar a Página**:
- ✅ OP permanece em "Concluído"
- ✅ Dados de produção mantidos
- ✅ Nada é perdido

---

## 🔍 Verificar Dados Salvos

### **Console do Navegador** (F12):
```
✅ Concluindo OP 001234:
   - Produzido: 9500
   - Perdas: 50
   - Fase: "Embalagem" → "Concluído"
💾 Dados salvos no localStorage: 20 OPs
```

### **localStorage** (DevTools → Application):
1. Abra DevTools (F12)
2. Vá para "Application" → "Local Storage"
3. Procure `sysoee_operacao_ops`
4. Verifique os dados da OP concluída

---

## 📱 Funciona em Dispositivos Touch

### **Tablet/Smartphone**:
1. Toque e segure no card
2. Arraste para "Concluído"
3. Solte
4. Preencha o formulário
5. Toque em "Salvar e Concluir"

---

## 🎓 Perguntas Frequentes

### **P: Posso editar os dados após concluir?**
R: Atualmente não. Planeje implementar edição futura.

### **P: O que acontece se eu fechar o navegador durante o processo?**
R: A OP retorna para a fase original. Nada é salvo.

### **P: Posso concluir múltiplas OPs de uma vez?**
R: Não. Cada OP deve ser concluída individualmente.

### **P: Os dados são enviados para o servidor?**
R: Atualmente não. Dados são salvos apenas no localStorage. Integração com backend será implementada futuramente.

### **P: Posso mover uma OP de "Concluído" para outra fase?**
R: Sim, mas sem validação. Arraste normalmente.

---

## ✨ Resumo

**Para concluir uma OP**:
1. Arraste para "Concluído"
2. Confirme
3. Informe produção e perdas
4. Salve

**Para cancelar**:
- Clique em "Cancelar" em qualquer etapa

**Validações**:
- Quantidade produzida > 0
- Perdas ≥ 0

**Resultado**:
- OP em "Concluído"
- Dados atualizados
- Salvo automaticamente

---

**Sistema OEE SicFar - Validação de Conclusão v1.0**

