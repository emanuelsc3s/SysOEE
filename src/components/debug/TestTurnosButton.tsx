/**
 * Componente de debug para testar o hook useTurnos
 * Adicione este componente temporariamente em qualquer página para testar
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTurnos } from '@/hooks/useTurnos'
import { Loader2 } from 'lucide-react'

export function TestTurnosButton() {
  const { loading, turnos, fetchTurnos } = useTurnos()
  const [testResult, setTestResult] = useState<string>('')

  const handleTest = async () => {
    console.log('🧪 Iniciando teste do hook useTurnos...')
    setTestResult('Carregando...')
    
    try {
      const result = await fetchTurnos()
      console.log('✅ Resultado do teste:', result)
      
      setTestResult(
        `✅ Sucesso!\n` +
        `Total de turnos: ${result.data.length}\n` +
        `Turnos: ${JSON.stringify(result.data, null, 2)}`
      )
    } catch (error) {
      console.error('❌ Erro no teste:', error)
      setTestResult(`❌ Erro: ${error}`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold mb-2">🧪 Debug: useTurnos</h3>
      
      <div className="space-y-2 mb-2">
        <p className="text-sm">
          <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
        </p>
        <p className="text-sm">
          <strong>Turnos carregados:</strong> {turnos.length}
        </p>
      </div>

      <Button 
        onClick={handleTest} 
        disabled={loading}
        className="w-full mb-2"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          'Testar fetchTurnos()'
        )}
      </Button>

      {testResult && (
        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-60">
          {testResult}
        </pre>
      )}

      {turnos.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-bold mb-1">Turnos no estado:</p>
          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(turnos, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

