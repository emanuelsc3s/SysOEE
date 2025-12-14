/**
 * Utilitário de debug para verificar dados de turnos
 * Usar temporariamente para diagnosticar problema com hora_fim
 */

import { supabase } from '@/lib/supabase'

/**
 * Busca dados brutos da tabela tbturno para debug
 */
export async function debugTurnoData() {
  console.group('🔍 DEBUG: Dados de Turnos')
  
  try {
    // Query simples sem filtros
    const { data, error } = await supabase
      .from('tbturno')
      .select('*')
      .eq('deletado', 'N')
      .order('codigo', { ascending: true })
    
    if (error) {
      console.error('❌ Erro na query:', error)
      return
    }
    
    console.log('✅ Total de registros:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('\n📋 Dados brutos do primeiro registro:')
      console.log(JSON.stringify(data[0], null, 2))
      
      console.log('\n📊 Resumo de todos os registros:')
      data.forEach((turno, index) => {
        console.log(`\n${index + 1}. ${turno.codigo} - ${turno.turno}`)
        console.log(`   hora_inicio: ${turno.hora_inicio}`)
        console.log(`   hora_fim: ${turno.hora_fim}`)
        console.log(`   meta_oee: ${turno.meta_oee}`)
      })
      
      // Verificar campos ausentes
      const semHoraFim = data.filter(t => !t.hora_fim)
      if (semHoraFim.length > 0) {
        console.warn('\n⚠️ Turnos sem hora_fim:', semHoraFim.map(t => t.codigo))
      } else {
        console.log('\n✅ Todos os turnos têm hora_fim preenchido')
      }
    } else {
      console.warn('⚠️ Nenhum registro encontrado')
    }
    
  } catch (err) {
    console.error('❌ Erro ao buscar dados:', err)
  }
  
  console.groupEnd()
}

/**
 * Verifica estrutura da tabela tbturno
 */
export async function debugTurnoSchema() {
  console.group('🔍 DEBUG: Estrutura da Tabela tbturno')
  
  try {
    const { data, error } = await supabase
      .from('tbturno')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('📋 Campos disponíveis:')
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}: ${typeof data[0][key]}`)
      })
    }
    
  } catch (err) {
    console.error('❌ Erro:', err)
  }
  
  console.groupEnd()
}

