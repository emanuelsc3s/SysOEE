/**
 * Configuração do React Query
 * Cliente global para gerenciamento de cache e fetching de dados
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * Cliente React Query configurado com defaults otimizados
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo que os dados são considerados "frescos" (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tempo que os dados ficam em cache (10 minutos)
      gcTime: 10 * 60 * 1000,
      // Número de tentativas em caso de erro
      retry: 3,
      // Delay entre tentativas (exponencial)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automático quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Refetch automático quando reconecta à internet
      refetchOnReconnect: true,
    },
    mutations: {
      // Número de tentativas para mutations
      retry: 1,
    },
  },
})

