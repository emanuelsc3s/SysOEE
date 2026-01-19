# Changelog

## [Unreleased]
- Corrigida a quebra do modal de busca de SKU quando a lista de produtos não está disponível.
- Ajustadas mensagens de erro do apontamento de produção para indicar falhas de permissão no Supabase.
- Ajustada a busca de tipos de parada para consultar `tboee_parada` no Supabase e removida a exibição de Grande Parada na hierarquia.
- Implementada persistência da produção no Supabase (`tboee_turno_producao`) com CRUD, auditoria e soft delete na guia Produção.
- Integrada a velocidade nominal via `tbvelocidadenominal` para salvar registros de produção.
- Atualizado o cálculo do OEE para usar os dados de produção persistidos no Supabase.
- Estabilizada a função de cálculo de perdas para evitar recriações e dependências instáveis no hook de recálculo do OEE.
- Gerado CSV de produtos para importação na `tbproduto` do Supabase.
- Modal de busca de Produto SKU agora consulta `tbproduto` no Supabase com `deletado = 'N'`.
