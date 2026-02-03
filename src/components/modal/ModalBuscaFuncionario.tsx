/**
 * Modal de Busca de Funcionário
 * Permite buscar e selecionar funcionários da tabela tbfuncionario
 * Segue padrão de modais de busca do projeto (ModalBuscaLinhaProducao, ModalBuscaTurno)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, X, Loader2, Users, RefreshCw } from 'lucide-react'
import { supabase, handleSupabaseError } from '@/lib/supabase'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Interface para dados do funcionário no banco de dados
 */
interface FuncionarioDB {
  funcionario_id: number
  matricula: string | null
  nome: string | null
  nome_social: string | null
  cpf: string
  email: string | null
  cargo: string | null
  lotacao: string | null
  ativo: boolean | null
}

/**
 * Dados do funcionário selecionado retornados ao componente pai
 */
export interface FuncionarioSelecionado {
  funcionario_id: number
  matricula: string
  nome: string
  email: string | null
  cargo: string | null
  lotacao: string | null
}

interface ModalBuscaFuncionarioProps {
  /** Controla se o modal está aberto */
  aberto: boolean
  /** Callback chamado quando o modal é fechado */
  onFechar: () => void
  /** Callback chamado quando um funcionário é selecionado */
  onSelecionarFuncionario: (funcionario: FuncionarioSelecionado) => void
}

export function ModalBuscaFuncionario({
  aberto,
  onFechar,
  onSelecionarFuncionario,
}: ModalBuscaFuncionarioProps) {
  const [termoBusca, setTermoBusca] = useState('')
  const [funcionarios, setFuncionarios] = useState<FuncionarioDB[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Debounce do termo de busca para evitar muitas requisições
  const termoBuscaDebounced = useDebounce(termoBusca, 300)

  /**
   * Carrega funcionários do Supabase
   * Filtra apenas funcionários ativos e sem data de rescisão
   */
  const carregarFuncionarios = useCallback(async (termo: string = '') => {
    try {
      console.log('🔍 ModalBuscaFuncionario: Carregando funcionários...')
      setLoading(true)
      setErro(null)

      let query = supabase
        .from('tbfuncionario')
        .select('funcionario_id, matricula, nome, nome_social, cpf, email, cargo, lotacao, ativo')
        .eq('ativo', true)
        .is('dt_rescisao', null)
        .order('nome', { ascending: true })
        .limit(100)

      // Aplicar filtro de busca se houver termo
      if (termo.trim()) {
        query = query.or(
          `nome.ilike.%${termo}%,matricula.ilike.%${termo}%,cpf.ilike.%${termo}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      console.log('✅ ModalBuscaFuncionario: Funcionários carregados:', data?.length || 0)
      setFuncionarios(data || [])
    } catch (error) {
      console.error('❌ ModalBuscaFuncionario: Erro ao carregar funcionários:', error)
      setErro(handleSupabaseError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar funcionários ao abrir o modal
  useEffect(() => {
    if (aberto) {
      carregarFuncionarios('')
    }
  }, [aberto, carregarFuncionarios])

  // Recarregar quando o termo de busca mudar (com debounce)
  useEffect(() => {
    if (aberto) {
      carregarFuncionarios(termoBuscaDebounced)
    }
  }, [termoBuscaDebounced, aberto, carregarFuncionarios])

  /**
   * Retorna o nome de exibição do funcionário
   * Prioriza nome_social se disponível
   */
  const getNomeExibicao = (funcionario: FuncionarioDB): string => {
    return funcionario.nome_social || funcionario.nome || 'Sem nome'
  }

  /**
   * Formata CPF para exibição (XXX.XXX.XXX-XX)
   */
  const formatarCPF = (cpf: string): string => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) return cpf
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  /**
   * Seleciona um funcionário e fecha o modal
   */
  const handleSelecionarFuncionario = (funcionario: FuncionarioDB) => {
    const funcionarioSelecionado: FuncionarioSelecionado = {
      funcionario_id: funcionario.funcionario_id,
      matricula: funcionario.matricula || '',
      nome: getNomeExibicao(funcionario),
      email: funcionario.email,
      cargo: funcionario.cargo,
      lotacao: funcionario.lotacao,
    }
    onSelecionarFuncionario(funcionarioSelecionado)
    handleFechar()
  }

  /**
   * Fecha o modal e limpa os filtros
   */
  const handleFechar = () => {
    setTermoBusca('')
    setErro(null)
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={handleFechar}>
      <DialogContent className="max-w-[95vw] w-[1100px] max-h-[85vh] p-0 flex flex-col gap-0 min-h-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Buscar Funcionário
          </DialogTitle>
          <DialogDescription className="text-base">
            Pesquise por nome, matrícula ou CPF para selecionar um funcionário
          </DialogDescription>
        </DialogHeader>

        {/* Campo de Busca */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Digite nome, matrícula ou CPF..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className={`pl-10 py-2 w-full border border-gray-200 rounded-md text-sm${termoBusca ? ' pr-10' : ''}`}
                  autoFocus
                />
                {termoBusca && (
                  <button
                    onClick={() => setTermoBusca('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:shrink-0 md:self-end">
              <Button
                variant="outline"
                onClick={() => carregarFuncionarios(termoBusca)}
                disabled={loading}
                className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                title="Atualizar lista"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando funcionários...
              </span>
            ) : erro ? (
              <span className="text-red-500">{erro}</span>
            ) : (
              `${funcionarios.length} funcionário(s) encontrado(s)`
            )}
          </p>
        </div>

        {/* Tabela de Funcionários */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : erro ? (
            <div className="text-center py-12">
              <p className="text-red-500">{erro}</p>
              <Button
                variant="outline"
                onClick={() => carregarFuncionarios(termoBusca)}
                className="mt-4"
              >
                Tentar novamente
              </Button>
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente ajustar o termo de busca
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[12%]">Matrícula</TableHead>
                  <TableHead className="w-[25%]">Nome</TableHead>
                  <TableHead className="w-[15%]">CPF</TableHead>
                  <TableHead className="w-[18%]">Cargo</TableHead>
                  <TableHead className="w-[18%]">Setor/Lotação</TableHead>
                  <TableHead className="w-[12%] text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((funcionario) => (
                  <TableRow
                    key={funcionario.funcionario_id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelecionarFuncionario(funcionario)}
                  >
                    <TableCell className="font-mono font-medium">
                      {funcionario.matricula || '--'}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate" title={getNomeExibicao(funcionario)}>
                      <div className="flex flex-col">
                        <span>{getNomeExibicao(funcionario)}</span>
                        {funcionario.nome_social && funcionario.nome && (
                          <span className="text-xs text-muted-foreground">
                            (Registro: {funcionario.nome})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatarCPF(funcionario.cpf)}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate" title={funcionario.cargo || ''}>
                      {funcionario.cargo || '--'}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate" title={funcionario.lotacao || ''}>
                      {funcionario.lotacao || '--'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelecionarFuncionario(funcionario)
                        }}
                      >
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Rodapé com botão de cancelar */}
        <DialogFooter className="border-t bg-background px-6 py-4 w-full">
          <Button variant="outline" onClick={handleFechar}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

