# Teste de Armazéns Bloqueados

## Problema Identificado

O HTML renderizado mostra que o armazém 46 está sendo renderizado com as classes de armazém **ativo** em vez de **bloqueado**.

### HTML Atual (Incorreto)
```html
<div class="... cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-primary/20">
  <div class="bg-primary/10 text-primary">46</div>
  <span class="text-muted-foreground">Armazém 46</span>
  <p class="text-foreground">SPEP LISVET</p>
  <div class="bg-primary"></div>
</div>
```

### HTML Esperado (Correto)
```html
<div class="... cursor-not-allowed border-red-500 bg-red-50/50 hover:shadow-sm">
  <Badge variant="destructive">🔒 BLOQUEADO</Badge>
  <div class="bg-red-100 text-red-700">🔒</div>
  <span class="text-red-700">Armazém 46</span>
  <p class="text-red-900/70">SPEP LISVET</p>
  <div class="bg-red-500"></div>
</div>
```

## Possíveis Causas

1. **Cache do Navegador**: O navegador está usando uma versão antiga do JavaScript
2. **localStorage Desatualizado**: Os dados no localStorage não têm a propriedade `bloqueado`
3. **Hot Reload não funcionou**: O Vite não recarregou as mudanças

## Soluções

### 1. Limpar Cache do Navegador

**Chrome/Edge**:
1. Abra DevTools (F12)
2. Clique com botão direito no ícone de reload
3. Selecione "Limpar cache e recarregar forçadamente" (Ctrl+Shift+R)

**Firefox**:
1. Ctrl+Shift+Delete
2. Marque "Cache"
3. Clique em "Limpar agora"
4. Recarregue a página (Ctrl+F5)

### 2. Limpar localStorage

Abra o console do navegador (F12) e execute:

```javascript
// Limpar localStorage
localStorage.removeItem('sysoee_armazens')

// Recarregar a página
location.reload()
```

### 3. Verificar Dados no localStorage

```javascript
// Ver dados atuais
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens') || '[]')
console.log('Total de armazéns:', armazens.length)

// Verificar armazém 46
const arm46 = armazens.find(a => a.codigo === '46')
console.log('Armazém 46:', arm46)
// Deve mostrar: { codigo: '46', descricao: 'SPEP LISVET', bloqueado: true }

// Verificar todos os bloqueados
const bloqueados = armazens.filter(a => a.bloqueado)
console.log('Armazéns bloqueados:', bloqueados.length) // Deve ser 7
console.log('Códigos bloqueados:', bloqueados.map(a => a.codigo)) // ['46', '49', '56', '58', '60', '89', '96']
```

### 4. Forçar Atualização dos Dados

Se o localStorage tiver dados antigos sem a propriedade `bloqueado`, execute:

```javascript
// Forçar atualização
localStorage.removeItem('sysoee_armazens')
location.reload()
```

Isso fará com que o componente recrie os dados com a propriedade `bloqueado`.

### 5. Parar e Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C no terminal)
# Depois reiniciar
npm run dev
```

## Checklist de Verificação

Execute os seguintes passos em ordem:

- [ ] 1. Abrir DevTools (F12)
- [ ] 2. Ir para a aba Console
- [ ] 3. Executar: `localStorage.removeItem('sysoee_armazens')`
- [ ] 4. Executar: `location.reload()`
- [ ] 5. Aguardar página recarregar
- [ ] 6. Verificar se o armazém 46 agora tem badge vermelho "BLOQUEADO"
- [ ] 7. Verificar se o ícone de cadeado aparece
- [ ] 8. Verificar se a borda está vermelha
- [ ] 9. Clicar no armazém 46 e verificar se aparece o alerta
- [ ] 10. Executar no console: `JSON.parse(localStorage.getItem('sysoee_armazens')).find(a => a.codigo === '46')`
- [ ] 11. Verificar se retorna `{ codigo: '46', descricao: 'SPEP LISVET', bloqueado: true }`

## Teste Completo

### Passo 1: Limpar Tudo
```javascript
// Console do navegador
localStorage.clear()
location.reload()
```

### Passo 2: Verificar Dados Após Reload
```javascript
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))
console.log('Armazéns carregados:', armazens.length) // Deve ser 47

// Verificar estrutura
console.log('Primeiro armazém:', armazens[0])
// Deve ter: { codigo, descricao, bloqueado }

// Verificar bloqueados
const bloqueados = armazens.filter(a => a.bloqueado)
console.log('Bloqueados:', bloqueados.map(a => `${a.codigo} - ${a.descricao}`))
// Deve mostrar:
// ['46 - SPEP LISVET', '49 - LISVET RETEM', '56 - ANALISES LISVET', 
//  '58 - PERDAS LISVET', '60 - TEMP2', '89 - ERRADO', '96 - RETIFICACAO FISCAL']
```

### Passo 3: Verificar Visualmente

Procure pelos armazéns bloqueados na página:
- **46** - SPEP LISVET
- **49** - LISVET RETEM
- **56** - ANALISES LISVET
- **58** - PERDAS LISVET
- **60** - TEMP2
- **89** - ERRADO
- **96** - RETIFICACAO FISCAL

Cada um deve ter:
- ✅ Badge vermelho "BLOQUEADO" no canto superior direito
- ✅ Ícone de cadeado no badge
- ✅ Ícone de cadeado no círculo (em vez do número)
- ✅ Borda vermelha
- ✅ Fundo levemente avermelhado
- ✅ Textos em vermelho
- ✅ Barra inferior vermelha

### Passo 4: Testar Interação

Clique em um armazém bloqueado (ex: 46):
- ✅ Deve aparecer um alerta
- ✅ Mensagem: "O armazém 46 - SPEP LISVET está bloqueado e não pode ser acessado."

Clique em um armazém ativo (ex: 01):
- ✅ Deve aparecer log no console
- ✅ Mensagem: "Armazém selecionado: {codigo: '01', descricao: 'ALMOXARIFADO CENTRAL', bloqueado: false}"

## Se Ainda Não Funcionar

Se após todos os passos acima o problema persistir, execute:

```bash
# No terminal do projeto
# Parar o servidor (Ctrl+C)

# Limpar cache do Vite
rm -rf node_modules/.vite

# Reiniciar
npm run dev
```

Depois no navegador:
1. Fechar todas as abas do localhost:8081
2. Limpar cache (Ctrl+Shift+Delete)
3. Abrir nova aba
4. Acessar http://localhost:8081/armazens

## Verificação Final

Execute este script completo no console:

```javascript
// Script de verificação completa
const verificar = () => {
  const armazens = JSON.parse(localStorage.getItem('sysoee_armazens') || '[]')
  
  console.log('=== VERIFICAÇÃO DE ARMAZÉNS BLOQUEADOS ===')
  console.log('Total de armazéns:', armazens.length)
  
  const bloqueados = armazens.filter(a => a.bloqueado)
  console.log('Total de bloqueados:', bloqueados.length)
  
  console.log('\nArmazéns bloqueados:')
  bloqueados.forEach(a => {
    console.log(`  ${a.codigo} - ${a.descricao}`)
  })
  
  console.log('\nVerificação individual:')
  const codigos = ['46', '49', '56', '58', '60', '89', '96']
  codigos.forEach(codigo => {
    const arm = armazens.find(a => a.codigo === codigo)
    console.log(`  ${codigo}: ${arm ? (arm.bloqueado ? '✅ BLOQUEADO' : '❌ NÃO BLOQUEADO') : '❌ NÃO ENCONTRADO'}`)
  })
  
  if (bloqueados.length === 7) {
    console.log('\n✅ DADOS CORRETOS!')
  } else {
    console.log('\n❌ DADOS INCORRETOS - Execute: localStorage.removeItem("sysoee_armazens"); location.reload()')
  }
}

verificar()
```

Resultado esperado:
```
=== VERIFICAÇÃO DE ARMAZÉNS BLOQUEADOS ===
Total de armazéns: 47
Total de bloqueados: 7

Armazéns bloqueados:
  46 - SPEP LISVET
  49 - LISVET RETEM
  56 - ANALISES LISVET
  58 - PERDAS LISVET
  60 - TEMP2
  89 - ERRADO
  96 - RETIFICACAO FISCAL

Verificação individual:
  46: ✅ BLOQUEADO
  49: ✅ BLOQUEADO
  56: ✅ BLOQUEADO
  58: ✅ BLOQUEADO
  60: ✅ BLOQUEADO
  89: ✅ BLOQUEADO
  96: ✅ BLOQUEADO

✅ DADOS CORRETOS!
```

