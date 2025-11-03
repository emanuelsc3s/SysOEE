/**
 * Script para extrair coordenadas calibradas do localStorage
 * 
 * COMO USAR:
 * 1. Abra o navegador em http://localhost:8081/armazens
 * 2. Abra o Console do Desenvolvedor (F12 → Console)
 * 3. Cole este script completo e pressione Enter
 * 4. Copie o JSON gerado e salve em um arquivo
 * 5. Use o script sync-coordenadas.js para atualizar o arquivo padrão
 */

(function() {
  const STORAGE_KEY = 'sysoee_coordenadas_armazens';
  
  console.log('🔍 Verificando coordenadas calibradas no localStorage...\n');
  
  // Tenta obter coordenadas do localStorage
  const coordenadasSalvas = localStorage.getItem(STORAGE_KEY);
  
  if (!coordenadasSalvas) {
    console.error('❌ Nenhuma coordenada calibrada encontrada no localStorage!');
    console.log('\n📝 Para calibrar as coordenadas:');
    console.log('1. Acesse /armazens');
    console.log('2. Clique na guia "Mapa"');
    console.log('3. Clique em "Calibrar Posições"');
    console.log('4. Arraste os marcadores para as posições corretas');
    console.log('5. Clique em "Salvar Posições"');
    console.log('6. Execute este script novamente\n');
    return;
  }
  
  try {
    const coordenadas = JSON.parse(coordenadasSalvas);
    
    console.log(`✅ Encontradas coordenadas de ${coordenadas.length} armazéns!\n`);
    
    // Exibe resumo
    console.log('📊 Resumo das coordenadas:');
    console.table(coordenadas.slice(0, 10)); // Mostra primeiros 10
    
    console.log('\n📋 JSON completo (copie e salve):');
    console.log('═'.repeat(80));
    
    const jsonFormatado = JSON.stringify(coordenadas, null, 2);
    console.log(jsonFormatado);
    
    console.log('═'.repeat(80));
    console.log('\n💾 Para salvar em arquivo:');
    console.log('1. Copie o JSON acima (entre as linhas ═)');
    console.log('2. Salve em: coordenadas-calibradas.json');
    console.log('3. Execute: node scripts/sync-coordenadas.js coordenadas-calibradas.json\n');
    
    // Cria um blob para download
    const blob = new Blob([jsonFormatado], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coordenadas-calibradas.json';
    
    console.log('🔽 Ou clique no link abaixo para baixar automaticamente:');
    console.log(a);
    console.log('\n💡 Dica: Clique com botão direito no link acima → "Reveal in Elements Panel" → Clique no elemento');
    
    // Adiciona link temporário ao DOM
    document.body.appendChild(a);
    
    // Auto-download (pode ser bloqueado pelo navegador)
    try {
      a.click();
      console.log('✅ Download iniciado automaticamente!');
    } catch {
      console.log('⚠️ Download automático bloqueado. Use o link acima.');
    }
    
    // Remove link após 5 segundos
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Erro ao processar coordenadas:', error);
    console.log('Dados brutos:', coordenadasSalvas);
  }
})();

