# Guia de Teste - Página ArmazemSaldo

**Data**: 03 de Novembro de 2025  
**Versão**: 1.0.0

## 🚀 Como Testar a Página

### 1. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:5173`

### 2. Acessar a Página de Armazéns

Existem duas formas de acessar:

#### Opção A: Pela Home
1. Acesse `http://localhost:5173`
2. Clique no card **"Armazéns"** no grid de navegação

#### Opção B: Diretamente pela URL
1. Acesse `http://localhost:5173/armazens`

## ✅ Checklist de Testes

### Teste 1: Carregamento Inicial
- [ ] A página carrega sem erros
- [ ] Header exibe título "Armazéns" e subtítulo
- [ ] Botão "Voltar" está visível
- [ ] Campo de busca está presente
- [ ] Grid de cards é exibido
- [ ] 47 armazéns são exibidos
- [ ] Contador mostra "47 armazéns cadastrados"

### Teste 2: Busca por Código
- [ ] Digite "01" no campo de busca
- [ ] Apenas armazéns com código "01" aparecem (01, 06, 10, 11, 31, 32, 38, 40)
- [ ] Contador atualiza corretamente
- [ ] Digite "99"
- [ ] Apenas armazém "99 - PRODUTO ENVASADO" aparece

### Teste 3: Busca por Descrição
- [ ] Digite "SPEP" no campo de busca
- [ ] Armazéns com "SPEP" na descrição aparecem (06, 10, 11, 31, 32, 33, 38, 40, 46)
- [ ] Contador atualiza corretamente
- [ ] Digite "LISVET"
- [ ] Armazéns Lisvet aparecem (44, 45, 46, 49, 56, 58)

### Teste 4: Busca Sem Resultados
- [ ] Digite "XYZABC" no campo de busca
- [ ] Mensagem "Nenhum armazém encontrado" é exibida
- [ ] Ícone de pacote vazio aparece
- [ ] Sugestão "Tente ajustar os termos de busca" é mostrada

### Teste 5: Limpar Busca
- [ ] Digite qualquer texto no campo de busca
- [ ] Limpe o campo (delete/backspace)
- [ ] Todos os 47 armazéns voltam a aparecer
- [ ] Contador volta para "47 armazéns cadastrados"

### Teste 6: Interação com Cards
- [ ] Passe o mouse sobre um card
- [ ] Card aumenta levemente (scale 1.02)
- [ ] Sombra do card aumenta
- [ ] Borda azul aparece
- [ ] Clique em um card
- [ ] Console do navegador mostra log "Armazém selecionado: {dados}"

### Teste 7: Navegação
- [ ] Clique no botão "Voltar" (seta)
- [ ] Página retorna para Home
- [ ] Navegue novamente para `/armazens`
- [ ] Dados continuam carregados

### Teste 8: localStorage
Abra o Console do Navegador (F12) e execute:

```javascript
// Verificar dados salvos
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))
console.log('Total de armazéns:', armazens.length)
console.log('Primeiro armazém:', armazens[0])
console.log('Último armazém:', armazens[armazens.length - 1])
```

- [ ] Console mostra 47 armazéns
- [ ] Primeiro armazém: `{codigo: "01", descricao: "ALMOXARIFADO CENTRAL"}`
- [ ] Último armazém: `{codigo: "99", descricao: "PRODUTO ENVASADO"}`

### Teste 9: Responsividade

#### Mobile (< 640px)
- [ ] Redimensione o navegador para largura < 640px
- [ ] Grid exibe 1 coluna
- [ ] Cards ocupam largura total
- [ ] Header compacto
- [ ] Busca em largura total

#### Tablet (640px - 1024px)
- [ ] Redimensione para largura entre 640px e 1024px
- [ ] Grid exibe 2-3 colunas
- [ ] Espaçamento adequado
- [ ] Header expandido

#### Desktop (> 1024px)
- [ ] Redimensione para largura > 1024px
- [ ] Grid exibe 4 colunas
- [ ] Ícone decorativo aparece no header
- [ ] Layout otimizado

### Teste 10: Acessibilidade

#### Navegação por Teclado
- [ ] Pressione Tab repetidamente
- [ ] Foco passa por: Botão Voltar → Campo de Busca → Cards
- [ ] Foco visível em cada elemento
- [ ] Pressione Enter em um card focado
- [ ] Card é ativado (log no console)
- [ ] Pressione Space em um card focado
- [ ] Card é ativado (log no console)

#### Screen Reader (Opcional)
- [ ] Ative um screen reader (NVDA, JAWS, VoiceOver)
- [ ] Navegue pela página
- [ ] Labels são lidos corretamente
- [ ] Descrições dos armazéns são anunciadas

### Teste 11: Performance
- [ ] Página carrega rapidamente (< 1 segundo)
- [ ] Busca é instantânea (sem lag)
- [ ] Scroll é suave
- [ ] Hover effects são fluidos

### Teste 12: Persistência de Dados
1. [ ] Acesse `/armazens`
2. [ ] Verifique que dados estão carregados
3. [ ] Feche a aba do navegador
4. [ ] Abra nova aba e acesse `/armazens` novamente
5. [ ] Dados continuam disponíveis (não recarregam do código)

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento.

## 📊 Resultados Esperados

### Dados Corretos
- **Total de armazéns**: 47
- **Primeiro código**: 01
- **Último código**: 99
- **Armazéns SPEP**: 9 (06, 10, 11, 31, 32, 33, 38, 40, 46)
- **Armazéns Lisvet**: 6 (44, 45, 46, 49, 56, 58)

### Performance
- **Carregamento inicial**: < 1 segundo
- **Busca**: Instantânea
- **Hover effects**: Suaves (300ms)

### Responsividade
- **Mobile**: 1 coluna
- **Tablet**: 2-3 colunas
- **Desktop**: 4 colunas

## 🔍 Inspeção de Elementos

### Verificar Estrutura HTML
Abra DevTools (F12) e inspecione:

1. **Header**
   - Classe: `bg-gradient-to-br from-primary via-primary/95 to-accent`
   - Sticky: `sticky top-0 z-10`

2. **Campo de Busca**
   - Ícone de lupa à esquerda
   - Placeholder: "Buscar por código ou descrição..."

3. **Grid de Cards**
   - Classe: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`

4. **Card Individual**
   - Hover: `hover:shadow-md hover:scale-[1.02] hover:border-primary/20`
   - Transição: `transition-all duration-300`

## 📱 Testes em Dispositivos Reais

### Recomendado Testar Em:
- [ ] **Desktop**: Chrome, Firefox, Edge
- [ ] **Tablet**: iPad, Samsung Galaxy Tab
- [ ] **Mobile**: iPhone, Android

### Orientações
- [ ] **Portrait** (vertical)
- [ ] **Landscape** (horizontal)

## 🎯 Critérios de Aceitação

### Funcionalidade
- ✅ Todos os 47 armazéns são exibidos
- ✅ Busca funciona por código e descrição
- ✅ Navegação funciona corretamente
- ✅ localStorage persiste dados

### Design
- ✅ Layout responsivo em todos os breakpoints
- ✅ Hover effects funcionam
- ✅ Cores consistentes com o projeto
- ✅ Tipografia legível

### Acessibilidade
- ✅ Navegação por teclado funciona
- ✅ ARIA labels presentes
- ✅ Contraste adequado
- ✅ Foco visível

### Performance
- ✅ Carregamento rápido
- ✅ Busca instantânea
- ✅ Sem lag no scroll
- ✅ Transições suaves

## 📝 Relatório de Teste

Após completar os testes, preencha:

**Data do Teste**: _______________  
**Testador**: _______________  
**Navegador**: _______________  
**Resolução**: _______________

### Resultados
- [ ] Todos os testes passaram
- [ ] Alguns testes falharam (especificar abaixo)
- [ ] Bugs encontrados (especificar abaixo)

### Observações:
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

### Bugs Encontrados:
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

## 🚀 Próximos Passos Após Testes

1. **Se todos os testes passaram**:
   - ✅ Página está pronta para uso
   - Considerar implementar funcionalidades futuras
   - Integrar com backend (Supabase)

2. **Se houver bugs**:
   - Documentar bugs encontrados
   - Priorizar correções
   - Executar testes novamente após correções

## 📚 Recursos Adicionais

### Documentação
- `src/pages/README-ARMAZEM-SALDO.md`: Documentação completa
- `IMPLEMENTACAO-ARMAZEM-SALDO.md`: Resumo da implementação

### Código Fonte
- `src/pages/ArmazemSaldo.tsx`: Componente principal
- `src/App.tsx`: Configuração de rotas

### DevTools
- **Console**: Logs de debug
- **Network**: Verificar carregamento
- **Application → Local Storage**: Verificar dados salvos

---

**Boa sorte com os testes! 🎉**

