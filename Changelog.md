# Changelog

## [Unreleased]
- Ajustado o estilo tipográfico do título e subtítulo no `AppHeader` para melhorar legibilidade e hierarquia visual.
- Reduzido o espaçamento vertical entre título e subtítulo no `AppHeader`.
- Ajustado o espaçamento e a altura de linha do bloco de título no `AppHeader`.
- Ajustado o tamanho da logomarca no `AppHeader` para ficar mais proporcional ao cabeçalho.
- Ajustadas a largura e a altura da logomarca no `AppHeader` para ocupar melhor o cabeçalho.
- Ajustada a largura da logomarca no `AppHeader` para 132px.
- Ajustado o padding direito do cabeçalho do `ApontamentoOEE` para alinhar o espaço externo dos botões com a lateral direita.
- Ajustado o estilo e as dimensões dos botões do `ApontamentoOEE` para o padrão visual do `OeeTurno`.
- Ajustado o botão Voltar no `ApontamentoOEE` para sempre redirecionar para `OeeTurno`.
- Removido o botão de Dashboard do cabeçalho do Diário de Bordo no `ApontamentoOEE`.
- Corrigida a dependência de `useEffect` no `useAuth` para evitar avisos de lint e reexecuções desnecessárias.
- Bloqueada a exclusão de registros de produção quando o turno está Encerrado/Fechado, com validação antes do modal e antes da exclusão.
- Corrigida a quebra do modal de busca de SKU quando a lista de produtos não está disponível.
- Ajustadas mensagens de erro do apontamento de produção para indicar falhas de permissão no Supabase.
- Ajustada a busca de tipos de parada para consultar `tboee_parada` no Supabase e removida a exibição de Grande Parada na hierarquia.
- Implementada persistência da produção no Supabase (`tboee_turno_producao`) com CRUD, auditoria e soft delete na guia Produção.
- Integrada a velocidade nominal via `tbvelocidadenominal` para salvar registros de produção.
- Atualizado o cálculo do OEE para usar os dados de produção persistidos no Supabase.
- Estabilizada a função de cálculo de perdas para evitar recriações e dependências instáveis no hook de recálculo do OEE.
- Gerado CSV de produtos para importação na `tbproduto` do Supabase.
- Modal de busca de Produto SKU agora consulta `tbproduto` no Supabase com `deletado = 'N'`.
- Ajustado o carregamento de produção no `ApontamentoOEE` ao abrir turnos pela lista, com fallback por data/turno/produto.