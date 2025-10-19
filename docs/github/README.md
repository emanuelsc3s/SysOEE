# Documentação Git e GitHub

Esta pasta contém documentação sobre uso do Git, GitHub e resolução de problemas comuns no desenvolvimento do projeto SysOEE.

## Documentos Disponíveis

### [Navegação Entre Commits](./navegacao-entre-commits.md)

Guia completo sobre como navegar entre commits diferentes no Git e resolver problemas comuns, especialmente relacionados a dependências do Node.js.

**Tópicos abordados:**
- Como navegar entre commits corretamente
- Resolver erro "Cannot find module" após checkout
- Entender o estado "detached HEAD"
- Salvar e recuperar mudanças locais com `git stash`
- Reinstalar dependências após navegar entre commits
- Boas práticas e fluxo de trabalho recomendado

**Quando consultar:**
- Antes de fazer checkout de um commit antigo
- Quando a aplicação quebrar após navegar entre commits
- Ao encontrar erros de módulos não encontrados
- Para entender como usar `git stash` corretamente

## Estrutura da Documentação

```
docs/github/
├── README.md                      # Este arquivo (índice)
└── navegacao-entre-commits.md     # Guia de navegação entre commits
```

## Contribuindo

Ao adicionar novos documentos nesta pasta:

1. Crie o documento em português brasileiro
2. Use formato Markdown (.md)
3. Adicione uma entrada neste README.md
4. Inclua exemplos práticos e comandos
5. Documente problemas reais encontrados no projeto

## Convenções

- **Idioma**: Português brasileiro
- **Formato**: Markdown
- **Nomenclatura**: Use kebab-case para nomes de arquivos (ex: `navegacao-entre-commits.md`)
- **Conteúdo**: Inclua sempre exemplos práticos e comandos executáveis
- **Atualização**: Adicione data no histórico de atualizações ao modificar documentos

## Recursos Externos

- [Git Documentation (Oficial)](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Pro Git Book (Português)](https://git-scm.com/book/pt-br/v2)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

