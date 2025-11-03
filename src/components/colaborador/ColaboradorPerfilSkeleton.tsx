/**
 * Componente ColaboradorPerfilSkeleton
 * Skeleton de loading para a página de perfil do colaborador
 */

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ColaboradorPerfilSkeleton() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <Skeleton className="h-10 w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Perfil do Colaborador Skeleton */}
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Avatar Skeleton */}
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full mx-auto sm:mx-0" />

              {/* Informações Skeleton */}
              <div className="flex-1 space-y-3">
                <div className="text-center sm:text-left space-y-2">
                  <Skeleton className="h-8 w-64 mx-auto sm:mx-0" />
                  <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contadores KPI Skeleton */}
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </CardContent>
        </Card>

        {/* Filtros Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-full sm:w-64" />
          </div>

          {/* Tabs Skeleton */}
          <Skeleton className="h-10 w-full" />

          {/* Lista Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}

