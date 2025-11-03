#!/usr/bin/env node

/**
 * Script para sincronizar coordenadas calibradas com o arquivo padrão
 *
 * USO:
 *   node scripts/sync-coordenadas.js <arquivo-coordenadas-calibradas.json>
 *
 * EXEMPLO:
 *   node scripts/sync-coordenadas.js coordenadas-calibradas.json
 *
 * O script irá:
 * 1. Ler as coordenadas calibradas do arquivo fornecido
 * 2. Ler o arquivo padrão src/data/coordenadas-armazens.json
 * 3. Atualizar as coordenadas (x, y) mantendo as descrições
 * 4. Criar backup do arquivo original
 * 5. Salvar o arquivo atualizado
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Caminhos dos arquivos
const ARQUIVO_PADRAO = path.join(__dirname, '../src/data/coordenadas-armazens.json');

// Verifica argumentos
const args = process.argv.slice(2);

if (args.length === 0) {
  logError('Nenhum arquivo de coordenadas fornecido!');
  console.log('\nUSO:');
  console.log('  node scripts/sync-coordenadas.js <arquivo-coordenadas-calibradas.json>');
  console.log('\nEXEMPLO:');
  console.log('  node scripts/sync-coordenadas.js coordenadas-calibradas.json');
  console.log('\nPASSOS:');
  console.log('1. Abra o navegador em http://localhost:8081/armazens');
  console.log('2. Abra o Console (F12)');
  console.log('3. Execute: node scripts/extrair-coordenadas-localstorage.js');
  console.log('4. Copie o JSON gerado ou baixe o arquivo');
  console.log('5. Execute este script com o arquivo baixado\n');
  process.exit(1);
}

const arquivoCoordenadas = args[0];

// Verifica se arquivo de coordenadas existe
if (!fs.existsSync(arquivoCoordenadas)) {
  logError(`Arquivo não encontrado: ${arquivoCoordenadas}`);
  process.exit(1);
}

// Verifica se arquivo padrão existe
if (!fs.existsSync(ARQUIVO_PADRAO)) {
  logError(`Arquivo padrão não encontrado: ${ARQUIVO_PADRAO}`);
  process.exit(1);
}

try {
  log('\n' + '='.repeat(80), 'bright');
  log('🔄 SINCRONIZAÇÃO DE COORDENADAS CALIBRADAS', 'bright');
  log('='.repeat(80) + '\n', 'bright');

  // Lê coordenadas calibradas
  logInfo(`Lendo coordenadas calibradas de: ${arquivoCoordenadas}`);
  const coordenadasCalibradasRaw = fs.readFileSync(arquivoCoordenadas, 'utf8');
  const coordenadasCalibradas = JSON.parse(coordenadasCalibradasRaw);
  
  if (!Array.isArray(coordenadasCalibradas)) {
    throw new Error('Formato inválido: esperado um array de coordenadas');
  }
  
  logSuccess(`${coordenadasCalibradas.length} coordenadas calibradas carregadas`);

  // Lê arquivo padrão
  logInfo(`Lendo arquivo padrão: ${ARQUIVO_PADRAO}`);
  const arquivoPadraoRaw = fs.readFileSync(ARQUIVO_PADRAO, 'utf8');
  const arquivoPadrao = JSON.parse(arquivoPadraoRaw);
  
  if (!arquivoPadrao.coordenadas || !Array.isArray(arquivoPadrao.coordenadas)) {
    throw new Error('Formato inválido do arquivo padrão');
  }
  
  logSuccess(`${arquivoPadrao.coordenadas.length} coordenadas padrão carregadas`);

  // Cria mapa de coordenadas calibradas para busca rápida
  const mapaCoordenadas = new Map();
  coordenadasCalibradas.forEach(coord => {
    mapaCoordenadas.set(coord.codigo, { x: coord.x, y: coord.y });
  });

  // Atualiza coordenadas mantendo descrições
  let atualizados = 0;
  let naoEncontrados = [];
  
  arquivoPadrao.coordenadas = arquivoPadrao.coordenadas.map(item => {
    const coordCalibrada = mapaCoordenadas.get(item.codigo);
    
    if (coordCalibrada) {
      atualizados++;
      return {
        ...item,
        x: coordCalibrada.x,
        y: coordCalibrada.y
      };
    } else {
      naoEncontrados.push(item.codigo);
      return item;
    }
  });

  // Exibe resumo
  console.log('\n' + '-'.repeat(80));
  log('📊 RESUMO DA ATUALIZAÇÃO', 'bright');
  console.log('-'.repeat(80));
  logSuccess(`Coordenadas atualizadas: ${atualizados}`);
  
  if (naoEncontrados.length > 0) {
    logWarning(`Coordenadas não encontradas (mantidas originais): ${naoEncontrados.length}`);
    console.log(`   Códigos: ${naoEncontrados.join(', ')}`);
  }

  // Cria backup do arquivo original
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const arquivoBackup = ARQUIVO_PADRAO.replace('.json', `.backup-${timestamp}.json`);
  
  logInfo(`Criando backup: ${path.basename(arquivoBackup)}`);
  fs.copyFileSync(ARQUIVO_PADRAO, arquivoBackup);
  logSuccess('Backup criado com sucesso');

  // Salva arquivo atualizado
  logInfo('Salvando arquivo atualizado...');
  const jsonAtualizado = JSON.stringify(arquivoPadrao, null, 2);
  fs.writeFileSync(ARQUIVO_PADRAO, jsonAtualizado, 'utf8');
  logSuccess('Arquivo padrão atualizado com sucesso!');

  // Exibe algumas coordenadas atualizadas
  console.log('\n' + '-'.repeat(80));
  log('📋 EXEMPLO DE COORDENADAS ATUALIZADAS (primeiros 5)', 'bright');
  console.log('-'.repeat(80));
  
  arquivoPadrao.coordenadas.slice(0, 5).forEach(item => {
    const coordCalibrada = mapaCoordenadas.get(item.codigo);
    if (coordCalibrada) {
      console.log(`  ${item.codigo}: (${coordCalibrada.x.toFixed(1)}%, ${coordCalibrada.y.toFixed(1)}%) - ${item.descricao}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  logSuccess('SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('='.repeat(80) + '\n');

  logInfo('Próximos passos:');
  console.log('1. Recarregue a página /armazens no navegador');
  console.log('2. Clique em "Restaurar Padrões" para limpar o localStorage');
  console.log('3. Verifique se os marcadores estão nas posições corretas');
  console.log('4. As novas coordenadas agora são o padrão para todos os usuários\n');

  logInfo(`Backup salvo em: ${arquivoBackup}`);
  console.log('Para reverter: copie o backup de volta para coordenadas-armazens.json\n');

} catch (error) {
  console.log('\n' + '='.repeat(80));
  logError('ERRO DURANTE A SINCRONIZAÇÃO');
  console.log('='.repeat(80) + '\n');
  logError(error.message);
  
  if (error.stack) {
    console.log('\nStack trace:');
    console.log(error.stack);
  }
  
  process.exit(1);
}

