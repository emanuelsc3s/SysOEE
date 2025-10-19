# Navegação Entre Commits e Resolução de Problemas

## Visão Geral

Este documento descreve como navegar entre commits diferentes no Git e como resolver problemas comuns que podem surgir, especialmente relacionados a dependências do Node.js.

## Problema Comum: Aplicação Quebrada Após Navegar Entre Commits

### Sintoma

Após fazer checkout de um commit antigo e retornar ao commit mais recente, a aplicação apresenta erros ao tentar executar `npm run dev`, como:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

### Causa Raiz

Quando você navega entre commits diferentes usando `git checkout`, o Git atualiza os arquivos do código-fonte, mas **NÃO atualiza** a pasta `node_modules` (porque ela está no `.gitignore`). Isso causa uma incompatibilidade entre:

- **Dependências instaladas**: Podem ser de um commit antigo ou estar corrompidas
- **Código atual**: Do commit mais recente com diferentes versões de dependências

### Solução

A solução é reinstalar todas as dependências do zero:

```bash
# 1. Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# 2. Reinstalar as dependências
npm install

# 3. Executar a aplicação
npm run dev
```

## Como Navegar Entre Commits Corretamente

### 1. Preparar o Ambiente Antes de Navegar

Antes de fazer checkout de outro commit, você precisa lidar com mudanças locais não commitadas:

#### Opção A: Salvar mudanças temporariamente (Recomendado)

```bash
# Salvar mudanças locais
git stash push -m "Descrição das mudanças"

# Fazer checkout do commit desejado
git checkout <hash-do-commit>

# Quando voltar, recuperar as mudanças
git checkout main
git stash pop
```

#### Opção B: Commitar as mudanças

```bash
# Adicionar e commitar mudanças
git add .
git commit -m "WIP: Descrição das mudanças"

# Fazer checkout do commit desejado
git checkout <hash-do-commit>

# Voltar para a branch principal
git checkout main
```

#### Opção C: Descartar mudanças (CUIDADO!)

```bash
# ATENÇÃO: Isso apaga suas mudanças não salvas!
git checkout -- .

# Fazer checkout do commit desejado
git checkout <hash-do-commit>
```

### 2. Navegar para um Commit Específico

```bash
# Ir para um commit específico
git checkout <hash-do-commit>

# Exemplo:
git checkout 8bf56614b46222211f51f065272f0935bdfff00f
```

Você entrará no estado **"detached HEAD"**, que é normal e seguro para visualização.

### 3. Reinstalar Dependências (IMPORTANTE!)

Sempre que navegar para um commit diferente, reinstale as dependências:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. Voltar para o Commit Mais Recente

```bash
# Voltar para a branch principal
git checkout main

# Ou usar git switch (comando mais moderno)
git switch main

# Reinstalar dependências novamente
rm -rf node_modules package-lock.json
npm install
```

## Comandos Úteis

### Verificar Estado Atual

```bash
# Ver em qual commit você está
git log --oneline -1

# Ver status do repositório
git status

# Ver todas as branches
git branch -v

# Ver histórico recente
git log --oneline -10
```

### Comparar Commits

```bash
# Ver mudanças de um commit específico
git show <hash-do-commit>

# Ver lista de arquivos modificados em um commit
git show --name-status <hash-do-commit>

# Comparar dois commits
git diff <commit-antigo> <commit-novo>

# Ver como um arquivo estava em um commit específico
git show <hash-do-commit>:caminho/do/arquivo
```

### Visualizar Sem Fazer Checkout

Se você só quer **ver as mudanças** sem alterar seus arquivos:

```bash
# Ver detalhes de um commit
git show <hash-do-commit>

# Ver diferenças entre commits
git diff <commit-antigo> <commit-novo>

# Ver um arquivo específico de um commit
git show <hash-do-commit>:src/components/exemplo.tsx
```

## Entendendo o "Detached HEAD"

### O que é?

Quando você faz `git checkout <hash-do-commit>`, você entra no estado **"detached HEAD"**. Isso significa:

- ✅ Você está visualizando um commit específico
- ✅ É seguro para exploração
- ⚠️ Você não está em nenhuma branch
- ⚠️ Commits feitos neste estado podem ser perdidos

### Mensagem Típica

```
You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
```

### Como Sair

```bash
# Voltar para a branch principal
git checkout main

# Ou criar uma nova branch a partir deste ponto
git switch -c nome-da-nova-branch
```

## Problemas Específicos e Soluções

### Problema 1: Mudanças Locais Impedem Checkout

**Erro:**
```
error: Your local changes to the following files would be overwritten by checkout:
        src/components/exemplo.tsx
Please commit your changes or stash them before you switch branches.
```

**Solução:**
```bash
# Opção 1: Salvar com stash
git stash

# Opção 2: Commitar
git add .
git commit -m "WIP: Mudanças temporárias"

# Opção 3: Descartar (CUIDADO!)
git checkout -- .
```

### Problema 2: Erro de Módulo Não Encontrado

**Erro:**
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema 3: node_modules com Mudanças Não Commitadas

**Erro:**
```
error: Your local changes to the following files would be overwritten by checkout:
        node_modules/...
```

**Causa:** `node_modules` foi commitado por engano (não deveria estar no Git).

**Solução:**
```bash
# Remover node_modules do controle de versão
git rm -r --cached node_modules

# Commitar a remoção
git commit -m "Remove node_modules do controle de versão"

# Garantir que está no .gitignore
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "Adiciona node_modules ao .gitignore"
```

## Boas Práticas

### ✅ Sempre Fazer

1. **Verificar status antes de navegar:**
   ```bash
   git status
   ```

2. **Salvar mudanças locais:**
   ```bash
   git stash
   ```

3. **Reinstalar dependências após navegar:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Verificar em qual commit você está:**
   ```bash
   git log --oneline -1
   ```

### ❌ Evitar

1. **Não commitar node_modules** - Sempre deve estar no `.gitignore`
2. **Não fazer mudanças em detached HEAD** - A menos que crie uma branch
3. **Não forçar checkout sem salvar mudanças** - Use `git stash` primeiro

## Fluxo de Trabalho Recomendado

### Para Visualizar um Commit Antigo

```bash
# 1. Salvar trabalho atual
git stash push -m "Trabalho em progresso"

# 2. Ir para o commit antigo
git checkout <hash-do-commit>

# 3. Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# 4. Explorar o código/executar a aplicação
npm run dev

# 5. Voltar para o estado atual
git checkout main

# 6. Reinstalar dependências novamente
rm -rf node_modules package-lock.json
npm install

# 7. Recuperar trabalho salvo
git stash pop
```

## Referências

- [Git Documentation - Checkout](https://git-scm.com/docs/git-checkout)
- [Git Documentation - Stash](https://git-scm.com/docs/git-stash)
- [Understanding Detached HEAD](https://www.git-tower.com/learn/git/faq/detached-head-when-checkout-commit)
- [npm CLI Issues - Optional Dependencies Bug](https://github.com/npm/cli/issues/4828)

## Histórico de Atualizações

- **2025-10-19**: Documento criado com base em problema real encontrado ao navegar entre commits

