# 📋 Instruções para Sincronizar Coordenadas Calibradas

## 🎯 Objetivo

Atualizar o arquivo padrão `src/data/coordenadas-armazens.json` com as coordenadas que foram calibradas manualmente e salvas no localStorage do navegador.

## 📝 Pré-requisitos

1. Ter calibrado os marcadores usando o Modo de Calibração
2. Ter clicado em "Salvar Posições" para persistir no localStorage
3. Estar no mesmo navegador onde a calibração foi feita

## 🚀 Método 1: Extração via Console do Navegador (RECOMENDADO)

### Passo 1: Extrair Coordenadas do localStorage

1. Abra o navegador em `http://localhost:8081/armazens`
2. Pressione `F12` para abrir o Console do Desenvolvedor
3. Vá para a aba **Console**
4. Cole o seguinte código e pressione `Enter`:

```javascript
// Copie e cole este código completo no console
(function() {
  const coordenadas = localStorage.getItem('sysoee_coordenadas_armazens');
  if (!coordenadas) {
    console.error('❌ Nenhuma coordenada calibrada encontrada!');
    return;
  }
  const json = JSON.parse(coordenadas);
  console.log('✅ Coordenadas encontradas:', json.length, 'armazéns');
  console.log('\n📋 Copie o JSON abaixo:\n');
  console.log(JSON.stringify(json, null, 2));
  
  // Cria arquivo para download
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'coordenadas-calibradas.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('\n✅ Arquivo baixado: coordenadas-calibradas.json');
})();
```

5. O arquivo `coordenadas-calibradas.json` será baixado automaticamente
6. Salve o arquivo na raiz do projeto SysOEE

### Passo 2: Sincronizar com Arquivo Padrão

1. Abra o terminal na raiz do projeto
2. Execute o script de sincronização:

```bash
node scripts/sync-coordenadas.js coordenadas-calibradas.json
```

3. O script irá:
   - ✅ Criar backup do arquivo original
   - ✅ Atualizar as coordenadas (x, y)
   - ✅ Manter as descrições dos armazéns
   - ✅ Salvar o arquivo atualizado

### Passo 3: Verificar Atualização

1. Recarregue a página `/armazens` no navegador
2. Vá para a guia "Mapa"
3. Clique em **"Restaurar Padrões"** para limpar o localStorage
4. Verifique se os marcadores estão nas posições corretas
5. ✅ As novas coordenadas agora são o padrão!

## 🔧 Método 2: Extração Manual via DevTools

### Passo 1: Acessar localStorage

1. Abra o navegador em `http://localhost:8081/armazens`
2. Pressione `F12` → Aba **Application** (Chrome) ou **Storage** (Firefox)
3. No menu lateral: **Local Storage** → `http://localhost:8081`
4. Localize a chave: `sysoee_coordenadas_armazens`
5. Clique no valor para visualizar o JSON

### Passo 2: Copiar JSON

1. Clique com botão direito no valor
2. Selecione **"Copy value"** ou **"Copiar valor"**
3. Cole em um editor de texto
4. Formate o JSON (opcional):
   - Cole em https://jsonformatter.org/
   - Clique em "Format/Beautify"
   - Copie o resultado formatado

### Passo 3: Salvar em Arquivo

1. Crie um arquivo: `coordenadas-calibradas.json`
2. Cole o JSON copiado
3. Salve na raiz do projeto

### Passo 4: Sincronizar

```bash
node scripts/sync-coordenadas.js coordenadas-calibradas.json
```

## 🛠️ Método 3: Extração via Script Auxiliar

### Opção A: Executar Script no Console

1. Abra `scripts/extrair-coordenadas-localstorage.js`
2. Copie todo o conteúdo do arquivo
3. Abra o Console do navegador (F12 → Console)
4. Cole o script e pressione Enter
5. Siga as instruções exibidas no console

### Opção B: Usar Bookmarklet

1. Crie um novo favorito/bookmark no navegador
2. Nome: "Extrair Coordenadas OEE"
3. URL: Cole o conteúdo de `extrair-coordenadas-localstorage.js` precedido de `javascript:`
4. Acesse `/armazens` e clique no bookmark
5. Arquivo será baixado automaticamente

## 📊 Exemplo de Saída do Script

```
================================================================================
🔄 SINCRONIZAÇÃO DE COORDENADAS CALIBRADAS
================================================================================

ℹ️  Lendo coordenadas calibradas de: coordenadas-calibradas.json
✅ 47 coordenadas calibradas carregadas
ℹ️  Lendo arquivo padrão: src/data/coordenadas-armazens.json
✅ 47 coordenadas padrão carregadas

--------------------------------------------------------------------------------
📊 RESUMO DA ATUALIZAÇÃO
--------------------------------------------------------------------------------
✅ Coordenadas atualizadas: 47

ℹ️  Criando backup: coordenadas-armazens.backup-2025-11-03T14-30-00.json
✅ Backup criado com sucesso
ℹ️  Salvando arquivo atualizado...
✅ Arquivo padrão atualizado com sucesso!

--------------------------------------------------------------------------------
📋 EXEMPLO DE COORDENADAS ATUALIZADAS (primeiros 5)
--------------------------------------------------------------------------------
  01: (25.5%, 30.2%) - ALMOXARIFADO CENTRAL
  02: (35.1%, 30.8%) - MATERIA PRIMA
  03: (45.3%, 31.5%) - EMBALAGEM
  04: (55.7%, 32.1%) - REJEITADOS
  05: (65.2%, 32.8%) - SPPV

================================================================================
✅ SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!
================================================================================

ℹ️  Próximos passos:
1. Recarregue a página /armazens no navegador
2. Clique em "Restaurar Padrões" para limpar o localStorage
3. Verifique se os marcadores estão nas posições corretas
4. As novas coordenadas agora são o padrão para todos os usuários

ℹ️  Backup salvo em: coordenadas-armazens.backup-2025-11-03T14-30-00.json
Para reverter: copie o backup de volta para coordenadas-armazens.json
```

## ⚠️ Troubleshooting

### Problema: "Nenhuma coordenada calibrada encontrada"

**Causa:** localStorage vazio ou chave incorreta

**Solução:**
1. Verifique se você está no navegador correto
2. Acesse `/armazens` → Guia "Mapa"
3. Clique em "Calibrar Posições"
4. Ajuste os marcadores
5. Clique em "Salvar Posições"
6. Tente novamente

### Problema: "Arquivo não encontrado"

**Causa:** Caminho do arquivo incorreto

**Solução:**
1. Verifique se o arquivo está na raiz do projeto
2. Use caminho relativo: `./coordenadas-calibradas.json`
3. Ou caminho absoluto: `/home/usuario/SysOEE/coordenadas-calibradas.json`

### Problema: "Formato inválido"

**Causa:** JSON corrompido ou incompleto

**Solução:**
1. Valide o JSON em https://jsonlint.com/
2. Verifique se é um array de objetos
3. Cada objeto deve ter: `codigo`, `x`, `y`
4. Extraia novamente do localStorage

### Problema: Script não executa

**Causa:** Permissões ou Node.js não instalado

**Solução:**
```bash
# Dar permissão de execução
chmod +x scripts/sync-coordenadas.js

# Verificar Node.js
node --version

# Executar com node explicitamente
node scripts/sync-coordenadas.js coordenadas-calibradas.json
```

## 🔄 Reverter Alterações

Se precisar voltar às coordenadas anteriores:

```bash
# Listar backups disponíveis
ls src/data/*.backup-*.json

# Restaurar backup específico
cp src/data/coordenadas-armazens.backup-2025-11-03T14-30-00.json src/data/coordenadas-armazens.json

# Recarregar página
```

## 📝 Notas Importantes

1. **Backup Automático**: O script sempre cria backup antes de atualizar
2. **Descrições Preservadas**: As descrições dos armazéns são mantidas
3. **Validação**: Coordenadas são validadas (0-100%)
4. **localStorage**: Após sincronizar, use "Restaurar Padrões" para limpar
5. **Múltiplos Usuários**: Novas coordenadas serão padrão para todos

## 🎯 Fluxo Completo

```
1. Calibrar marcadores no navegador
   ↓
2. Salvar no localStorage
   ↓
3. Extrair JSON do localStorage (Console ou Script)
   ↓
4. Salvar em coordenadas-calibradas.json
   ↓
5. Executar: node scripts/sync-coordenadas.js coordenadas-calibradas.json
   ↓
6. Backup criado automaticamente
   ↓
7. Arquivo padrão atualizado
   ↓
8. Recarregar página e testar
   ↓
9. Restaurar Padrões (limpa localStorage)
   ↓
10. ✅ Novas coordenadas são o padrão!
```

## 📚 Arquivos Relacionados

- `scripts/extrair-coordenadas-localstorage.js` - Script para console do navegador
- `scripts/sync-coordenadas.js` - Script de sincronização Node.js
- `src/data/coordenadas-armazens.json` - Arquivo padrão de coordenadas
- `docs/MODO-CALIBRACAO-MAPA.md` - Documentação do modo de calibração

---

**Última Atualização**: 03/11/2025  
**Versão**: 1.0.0

