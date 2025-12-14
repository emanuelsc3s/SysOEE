/**
 * Script de teste para verificar se a query de turnos está funcionando
 * Execute este arquivo para testar a conexão com Supabase e a query de turnos
 */

import { supabase } from '@/lib/supabase'

export async function testTurnosQuery() {
  console.log('🔍 Testando query de turnos...')
  console.log('📡 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
  console.log('🔑 Supabase Key configurada:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)

  try {
    // Teste 1: Buscar todos os turnos (sem filtro de deletado)
    console.log('\n📋 Teste 1: Buscar TODOS os turnos (incluindo deletados)')
    const { data: allTurnos, error: error1 } = await supabase
      .from('tbturno')
      .select('*')
      .order('codigo', { ascending: true })

    if (error1) {
      console.error('❌ Erro no Teste 1:', error1)
    } else {
      console.log('✅ Total de turnos (todos):', allTurnos?.length || 0)
      console.log('📊 Dados:', allTurnos)
    }

    // Teste 2: Buscar apenas turnos não deletados
    console.log('\n📋 Teste 2: Buscar turnos NÃO deletados (deletado = "N")')
    const { data: activeTurnos, error: error2 } = await supabase
      .from('tbturno')
      .select('*')
      .eq('deletado', 'N')
      .order('codigo', { ascending: true })

    if (error2) {
      console.error('❌ Erro no Teste 2:', error2)
    } else {
      console.log('✅ Total de turnos ativos:', activeTurnos?.length || 0)
      console.log('📊 Dados:', activeTurnos)
    }

    // Teste 3: Verificar estrutura da tabela
    console.log('\n📋 Teste 3: Verificar estrutura da primeira linha')
    if (activeTurnos && activeTurnos.length > 0) {
      const primeiroTurno = activeTurnos[0]
      console.log('📊 Estrutura do primeiro turno:')
      console.log('  - turno_id:', primeiroTurno.turno_id, typeof primeiroTurno.turno_id)
      console.log('  - codigo:', primeiroTurno.codigo, typeof primeiroTurno.codigo)
      console.log('  - turno:', primeiroTurno.turno, typeof primeiroTurno.turno)
      console.log('  - hora_inicio:', primeiroTurno.hora_inicio, typeof primeiroTurno.hora_inicio)
      console.log('  - hora_fim:', primeiroTurno.hora_fim, typeof primeiroTurno.hora_fim)
      console.log('  - meta_oee:', primeiroTurno.meta_oee, typeof primeiroTurno.meta_oee)
      console.log('  - deletado:', primeiroTurno.deletado, typeof primeiroTurno.deletado)
    }

    // Teste 4: Verificar se há turnos deletados
    console.log('\n📋 Teste 4: Verificar turnos deletados')
    const { data: deletedTurnos, error: error4 } = await supabase
      .from('tbturno')
      .select('*')
      .eq('deletado', 'S')

    if (error4) {
      console.error('❌ Erro no Teste 4:', error4)
    } else {
      console.log('✅ Total de turnos deletados:', deletedTurnos?.length || 0)
    }

    return {
      allTurnos,
      activeTurnos,
      deletedTurnos
    }
  } catch (error) {
    console.error('❌ Erro geral ao testar query:', error)
    throw error
  }
}

// Executar teste automaticamente se este arquivo for importado
if (import.meta.env.DEV) {
  console.log('🚀 Modo DEV detectado. Execute testTurnosQuery() no console para testar.')
}

