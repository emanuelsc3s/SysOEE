# Guia de Contribuição - Documentação LicitacoesCad

Obrigado por considerar contribuir para esta documentação! Este guia ajudará você a fazer contribuições efetivas.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Padrões de Documentação](#padrões-de-documentação)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Exemplos de Código](#exemplos-de-código)
- [Diagramas](#diagramas)
- [Revisão](#revisão)

## Como Contribuir

### 1. Identificar Necessidade

Antes de contribuir, identifique:
- ✅ Gap na documentação existente
- ✅ Informação desatualizada
- ✅ Exemplo de código faltando
- ✅ Diagrama que ajudaria na compreensão
- ✅ Erro ou inconsistência

### 2. Tipos de Contribuição

#### Correções
- Erros de digitação
- Links quebrados
- Código incorreto
- Informações desatualizadas

#### Melhorias
- Exemplos adicionais
- Explicações mais claras
- Novos diagramas
- Casos de uso práticos

#### Adições
- Novos padrões descobertos
- Componentes não documentados
- Hooks adicionais
- Utilitários úteis

## Padrões de Documentação

### Idioma
- ✅ **Sempre em português brasileiro**
- ✅ Comentários de código em português
- ✅ Nomes de variáveis em inglês (padrão do código)
- ✅ Termos técnicos podem ser mantidos em inglês quando apropriado

### Formatação Markdown

#### Títulos
```markdown
# Título Principal (H1)
## Seção (H2)
### Subseção (H3)
#### Tópico (H4)
```

#### Código
```markdown
# Código inline
Use `código` para termos técnicos.

# Blocos de código
\`\`\`typescript
// Sempre especifique a linguagem
const exemplo = 'código aqui'
\`\`\`
```

#### Listas
```markdown
# Listas não ordenadas
- Item 1
- Item 2
  - Subitem 2.1

# Listas ordenadas
1. Primeiro passo
2. Segundo passo
3. Terceiro passo

# Checklists
- [ ] Tarefa pendente
- [x] Tarefa completa
```

#### Links
```markdown
# Link interno
[Texto do link](./arquivo.md)
[Texto com âncora](./arquivo.md#secao)

# Link externo
[Documentação React](https://react.dev/)
```

#### Ênfase
```markdown
**Negrito** para termos importantes
*Itálico* para ênfase leve
`código` para termos técnicos
```

### Estrutura de Seções

Cada arquivo deve seguir esta estrutura:

```markdown
# Título do Arquivo

Breve descrição do conteúdo (1-2 parágrafos).

## 1. Primeira Seção

### Conceito

Explicação do conceito.

### Implementação

Código de exemplo.

### Uso

Como usar na prática.

## 2. Segunda Seção

...
```

## Estrutura de Arquivos

### Nomenclatura

- Arquivos numerados: `01-nome-do-arquivo.md`
- Arquivos especiais: `NOME-EM-MAIUSCULAS.md`
- Use kebab-case para nomes
- Seja descritivo mas conciso

### Organização

```
docs/design/licitacao/
├── README.md                          # Índice principal
├── SUMARIO-EXECUTIVO.md              # Visão geral
├── INDICE-BUSCA.md                   # Busca rápida
├── CHANGELOG.md                       # Histórico
├── CONTRIBUTING.md                    # Este arquivo
├── 01-visao-geral-arquitetura.md     # Arquitetura
├── 02-funcionalidades-detalhadas.md  # Funcionalidades
├── ...                                # Outros arquivos
└── 15-diagramas-fluxogramas.md       # Diagramas
```

## Exemplos de Código

### Padrão de Exemplo

Todo exemplo de código deve incluir:

1. **Contexto**: Quando usar
2. **Código**: Implementação completa
3. **Explicação**: Como funciona
4. **Uso**: Exemplo prático

```markdown
## Exemplo: Nome do Componente

### Quando Usar

Descreva o caso de uso.

### Implementação

\`\`\`typescript
// Código completo e funcional
import { useState } from 'react'

export function ExemploComponente() {
  const [estado, setEstado] = useState('')
  
  return (
    <div>
      {/* Implementação */}
    </div>
  )
}
\`\`\`

### Como Funciona

Explique a lógica passo a passo.

### Uso Prático

\`\`\`typescript
// Como usar o componente
<ExemploComponente />
\`\`\`
```

### Comentários em Código

```typescript
// ✅ Bom - Comentário explicativo
const handleSave = async () => {
  // Validar campos obrigatórios antes de salvar
  if (!formData.nome) {
    return
  }
  
  await save(formData)
}

// ❌ Ruim - Comentário óbvio
const handleSave = async () => {
  // Chamar função save
  await save(formData)
}
```

## Diagramas

### Mermaid

Use Mermaid para diagramas:

```markdown
\`\`\`mermaid
graph TD
    A[Início] --> B[Processo]
    B --> C[Fim]
\`\`\`
```

### Tipos de Diagramas

- **Fluxogramas**: Para processos e fluxos
- **Sequência**: Para interações entre componentes
- **ERD**: Para estrutura de dados
- **Estados**: Para ciclo de vida

## Revisão

### Checklist de Qualidade

Antes de submeter, verifique:

- [ ] Português correto e claro
- [ ] Código testado e funcional
- [ ] Exemplos completos
- [ ] Links funcionando
- [ ] Formatação consistente
- [ ] Sem erros de digitação
- [ ] Diagramas renderizando
- [ ] Referências atualizadas

### Processo de Revisão

1. **Auto-revisão**: Revise seu próprio trabalho
2. **Teste**: Execute os exemplos de código
3. **Validação**: Verifique links e referências
4. **Submissão**: Envie para revisão

## Boas Práticas

### Seja Claro e Conciso

```markdown
# ✅ Bom
Este componente gerencia o estado do formulário.

# ❌ Ruim
Este componente, que foi criado para gerenciar de forma eficiente
e robusta o estado complexo do formulário de cadastro, permite...
```

### Use Exemplos Práticos

```markdown
# ✅ Bom
\`\`\`typescript
// Exemplo real do projeto
const { data } = await supabase
  .from('tblicitacao')
  .select('*')
  .eq('deletado', 'N')
\`\`\`

# ❌ Ruim
\`\`\`typescript
// Exemplo genérico
const data = await fetchData()
\`\`\`
```

### Mantenha Consistência

- Use os mesmos termos em toda documentação
- Siga o padrão de formatação existente
- Mantenha a estrutura de seções
- Use os mesmos exemplos de dados

## Contato

Para dúvidas sobre contribuições:
- Revise a documentação existente
- Consulte o [README.md](./README.md)
- Entre em contato com a equipe

---

**Obrigado por contribuir!** 🎉

