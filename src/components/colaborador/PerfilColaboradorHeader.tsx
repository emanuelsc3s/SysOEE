/**
 * Componente PerfilColaboradorHeader
 * Exibe cabeçalho com informações do perfil do colaborador
 */

import { Colaborador } from '@/types/colaborador'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Building2, Mail, Calendar } from 'lucide-react'

interface PerfilColaboradorHeaderProps {
  colaborador: Colaborador
}

/**
 * Gera iniciais do nome do colaborador
 * @param nome - Nome completo
 * @returns Iniciais (máximo 2 letras)
 */
function gerarIniciais(nome: string): string {
  const palavras = nome.trim().split(' ')
  if (palavras.length === 1) {
    return palavras[0].substring(0, 2).toUpperCase()
  }
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}

/**
 * Formata data ISO para formato brasileiro
 * @param dataISO - Data no formato ISO
 * @returns Data formatada (DD/MM/YYYY)
 */
function formatarData(dataISO?: string): string {
  if (!dataISO) return 'N/A'
  
  try {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  } catch {
    return 'N/A'
  }
}

export default function PerfilColaboradorHeader({ colaborador }: PerfilColaboradorHeaderProps) {
  const iniciais = gerarIniciais(colaborador.nome)

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="flex justify-center sm:justify-start">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              {colaborador.fotoUrl && (
                <AvatarImage src={colaborador.fotoUrl} alt={colaborador.nome} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                {iniciais}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Informações do Colaborador */}
          <div className="flex-1 space-y-3">
            {/* Nome e Matrícula */}
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {colaborador.nome}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Matrícula: {colaborador.id}
              </p>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Cargo */}
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground">Cargo: </span>
                  <span className="font-medium text-foreground">{colaborador.cargo}</span>
                </div>
              </div>

              {/* Setor */}
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-muted-foreground">Setor: </span>
                  <span className="font-medium text-foreground">{colaborador.setor}</span>
                </div>
              </div>

              {/* Email (se disponível) */}
              {colaborador.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium text-foreground">{colaborador.email}</span>
                  </div>
                </div>
              )}

              {/* Data de Admissão (se disponível) */}
              {colaborador.dataAdmissao && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-muted-foreground">Admissão: </span>
                    <span className="font-medium text-foreground">
                      {formatarData(colaborador.dataAdmissao)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

