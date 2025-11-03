# 🛠️ Scripts de Sincronização de Coordenadas

## 📋 Visão Geral

Scripts para extrair coordenadas calibradas do localStorage do navegador e sincronizar com o arquivo padrão do sistema.

## 🚀 Uso Rápido

### 1️⃣ Extrair Coordenadas do Navegador

Abra o Console do navegador (F12) em `http://localhost:8081/armazens` e execute:

```javascript
(function() {
  const coordenadas = localStorage.getItem('sysoee_coordenadas_armazens');
  if (!coordenadas) {
    console.error('❌ Nenhuma coordenada calibrada encontrada!');
    return;
  }
  const json = JSON.parse(coordenadas);
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'coordenadas-calibradas.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('✅ Arquivo baixado: coordenadas-calibradas.json');
})();
```

### 2️⃣ Sincronizar com Arquivo Padrão

```bash
node scripts/sync-coordenadas.js coordenadas-calibradas.json
```

### 3️⃣ Verificar Atualização

1. Recarregue `/armazens` no navegador
2. Clique em "Restaurar Padrões"
3. Verifique se marcadores estão corretos

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `extrair-coordenadas-localstorage.js` | Script para console do navegador |
| `sync-coordenadas.js` | Script Node.js de sincronização |
| `INSTRUCOES-SYNC-COORDENADAS.md` | Documentação completa |
| `README.md` | Este arquivo |

## 🎯 Fluxo Completo

```
Calibrar → Salvar → Extrair → Sincronizar → Verificar
```

## 📚 Documentação Completa

Veja `INSTRUCOES-SYNC-COORDENADAS.md` para instruções detalhadas.

## ⚡ Comandos Úteis

```bash
# Sincronizar coordenadas
node scripts/sync-coordenadas.js coordenadas-calibradas.json

# Listar backups
ls src/data/*.backup-*.json

# Restaurar backup
cp src/data/coordenadas-armazens.backup-YYYY-MM-DD*.json src/data/coordenadas-armazens.json
```

## 🆘 Ajuda

```bash
# Ver ajuda do script
node scripts/sync-coordenadas.js
```

---

**Versão**: 1.0.0  
**Data**: 03/11/2025

