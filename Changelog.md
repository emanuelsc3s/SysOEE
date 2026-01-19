# Changelog

## [Unreleased]
- Ajustada a busca de tipos de parada para consultar `tboee_parada` no Supabase e removida a exibição de Grande Parada na hierarquia.
- Implementada persistência da produção no Supabase (`tboee_turno_producao`) com CRUD, auditoria e soft delete na guia Produção.
- Integrada a velocidade nominal via `tbvelocidadenominal` para salvar registros de produção.
- Atualizado o cálculo do OEE para usar os dados de produção persistidos no Supabase.
- Estabilizada a função de cálculo de perdas para evitar recriações e dependências instáveis no hook de recálculo do OEE.
- Gerado CSV de produtos para importação na `tbproduto` do Supabase.
