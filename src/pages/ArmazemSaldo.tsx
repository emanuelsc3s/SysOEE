import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Search, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

/**
 * Interface para representar um armazém
 */
interface Armazem {
  codigo: string
  descricao: string
  bloqueado: boolean
}

/**
 * Lista completa de armazéns do sistema
 * Armazéns bloqueados: 46, 49, 56, 58, 60, 89, 96
 */
const ARMAZENS_DATA: Armazem[] = [
  { codigo: '01', descricao: 'ALMOXARIFADO CENTRAL', bloqueado: false },
  { codigo: '02', descricao: 'MATERIA PRIMA', bloqueado: false },
  { codigo: '03', descricao: 'EMBALAGEM', bloqueado: false },
  { codigo: '04', descricao: 'REJEITADOS', bloqueado: false },
  { codigo: '05', descricao: 'SPPV', bloqueado: false },
  { codigo: '06', descricao: 'SPEP 01', bloqueado: false },
  { codigo: '07', descricao: 'LIQUIDOS', bloqueado: false },
  { codigo: '08', descricao: 'CPHD', bloqueado: false },
  { codigo: '09', descricao: 'PLASTICO', bloqueado: false },
  { codigo: '10', descricao: 'SPEP 03', bloqueado: false },
  { codigo: '11', descricao: 'SPEP 02', bloqueado: false },
  { codigo: '12', descricao: 'TEMP', bloqueado: false },
  { codigo: '13', descricao: 'A VENCER | VENCIDOS', bloqueado: false },
  { codigo: '14', descricao: 'EXPEDICAO PA', bloqueado: false },
  { codigo: '15', descricao: 'EXPEDICAO PA FRACAO', bloqueado: false },
  { codigo: '16', descricao: 'AMOSTRAS ANALISE', bloqueado: false },
  { codigo: '17', descricao: 'SERVICOS', bloqueado: false },
  { codigo: '18', descricao: 'PERDAS', bloqueado: false },
  { codigo: '19', descricao: 'RETEM', bloqueado: false },
  { codigo: '20', descricao: 'DEVOLUCAO', bloqueado: false },
  { codigo: '21', descricao: 'DESENVOLVIMENTO', bloqueado: false },
  { codigo: '22', descricao: 'ALMOXARIFADO 22', bloqueado: false },
  { codigo: '23', descricao: 'AMOSTRAGEM', bloqueado: false },
  { codigo: '27', descricao: 'SPP EXTRUSAO', bloqueado: false },
  { codigo: '30', descricao: 'IMPRESSOS', bloqueado: false },
  { codigo: '31', descricao: 'ARM SPEP 01 MP', bloqueado: false },
  { codigo: '32', descricao: 'ARM SPEP 02 MP', bloqueado: false },
  { codigo: '33', descricao: 'ARM SPEP 03', bloqueado: false },
  { codigo: '34', descricao: 'ARM CPHD', bloqueado: false },
  { codigo: '35', descricao: 'ARM SPPV', bloqueado: false },
  { codigo: '36', descricao: 'ARM SPEP 02 EM', bloqueado: false },
  { codigo: '37', descricao: 'ARM LIQUIDOS', bloqueado: false },
  { codigo: '38', descricao: 'ARM SPEP 01,02 TAMPA', bloqueado: false },
  { codigo: '39', descricao: 'ARM PLASTICO', bloqueado: false },
  { codigo: '40', descricao: 'ARM SPEP 01 EM', bloqueado: false },
  { codigo: '44', descricao: 'EXPEDICAO LISVET', bloqueado: false },
  { codigo: '45', descricao: 'SPPV LISVET', bloqueado: false },
  { codigo: '46', descricao: 'SPEP LISVET', bloqueado: true },
  { codigo: '49', descricao: 'LISVET RETEM', bloqueado: true },
  { codigo: '56', descricao: 'ANALISES LISVET', bloqueado: true },
  { codigo: '58', descricao: 'PERDAS LISVET', bloqueado: true },
  { codigo: '60', descricao: 'TEMP2', bloqueado: true },
  { codigo: '89', descricao: 'ERRADO', bloqueado: true },
  { codigo: '96', descricao: 'RETIFICACAO FISCAL', bloqueado: true },
  { codigo: '97', descricao: 'MATERIAL DE CONSUMO', bloqueado: false },
  { codigo: '98', descricao: 'QUARENTENA', bloqueado: false },
  { codigo: '99', descricao: 'PRODUTO ENVASADO', bloqueado: false },
]

/**
 * Chave para armazenamento no localStorage
 */
const STORAGE_KEY = 'sysoee_armazens'

/**
 * Página de Armazéns - Exibe lista de armazéns em grid responsivo
 * 
 * Funcionalidades:
 * - Grid responsivo de cards (mobile-first)
 * - Armazenamento em localStorage
 * - Busca/filtro de armazéns
 * - Navegação de volta para Home
 */
export default function ArmazemSaldo() {
  const navigate = useNavigate()
  const [armazens, setArmazens] = useState<Armazem[]>([])
  const [filtro, setFiltro] = useState('')
  const [armazensFiltrados, setArmazensFiltrados] = useState<Armazem[]>([])

  /**
   * Carrega armazéns do localStorage ou inicializa com dados padrão
   */
  useEffect(() => {
    const carregarArmazens = () => {
      try {
        const armazensStorage = localStorage.getItem(STORAGE_KEY)
        
        if (armazensStorage) {
          // Carrega do localStorage se existir
          const armazensParsed = JSON.parse(armazensStorage) as Armazem[]
          setArmazens(armazensParsed)
          setArmazensFiltrados(armazensParsed)
        } else {
          // Inicializa com dados padrão e salva no localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ARMAZENS_DATA))
          setArmazens(ARMAZENS_DATA)
          setArmazensFiltrados(ARMAZENS_DATA)
        }
      } catch (error) {
        console.error('Erro ao carregar armazéns do localStorage:', error)
        // Em caso de erro, usa dados padrão
        setArmazens(ARMAZENS_DATA)
        setArmazensFiltrados(ARMAZENS_DATA)
      }
    }

    carregarArmazens()
  }, [])

  /**
   * Filtra armazéns baseado no texto de busca
   */
  useEffect(() => {
    if (!filtro.trim()) {
      setArmazensFiltrados(armazens)
      return
    }

    const filtroLower = filtro.toLowerCase()
    const filtrados = armazens.filter(
      (armazem) =>
        armazem.codigo.toLowerCase().includes(filtroLower) ||
        armazem.descricao.toLowerCase().includes(filtroLower)
    )
    setArmazensFiltrados(filtrados)
  }, [filtro, armazens])

  /**
   * Navega de volta para a Home
   */
  const handleVoltar = () => {
    navigate('/')
  }

  /**
   * Handler para clique em um card de armazém
   * (Funcionalidade futura: navegar para detalhes do armazém)
   */
  const handleArmazemClick = (armazem: Armazem) => {
    if (armazem.bloqueado) {
      console.log('Armazém bloqueado:', armazem)
      // TODO: Exibir toast ou modal informando que o armazém está bloqueado
      alert(`O armazém ${armazem.codigo} - ${armazem.descricao} está bloqueado e não pode ser acessado.`)
      return
    }

    console.log('Armazém selecionado:', armazem)
    // TODO: Implementar navegação para página de detalhes/saldo do armazém
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary via-primary/95 to-accent shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            {/* Botão Voltar e Título */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoltar}
                className="text-white hover:bg-white/20"
                aria-label="Voltar para Home"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Armazéns
                </h1>
                <p className="text-white/80 text-xs md:text-sm">
                  Gestão de Armazéns de Estoque
                </p>
              </div>
            </div>

            {/* Ícone decorativo */}
            <div className="hidden md:block text-white/30">
              <Package className="h-10 w-10" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {/* Barra de Busca */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por código ou descrição..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
              aria-label="Buscar armazéns"
            />
          </div>
          
          {/* Contador de resultados */}
          <p className="text-sm text-muted-foreground mt-2">
            {armazensFiltrados.length === armazens.length
              ? `${armazens.length} armazéns cadastrados`
              : `${armazensFiltrados.length} de ${armazens.length} armazéns`}
          </p>
        </div>

        {/* Grid de Cards de Armazéns */}
        {armazensFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {armazensFiltrados.map((armazem) => (
              <Card
                key={armazem.codigo}
                className={`
                  transition-all duration-300 relative
                  ${armazem.bloqueado
                    ? 'cursor-not-allowed border-red-500 bg-red-50/50 hover:shadow-sm'
                    : 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:border-primary/20'
                  }
                `}
                onClick={() => handleArmazemClick(armazem)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleArmazemClick(armazem)
                  }
                }}
                aria-label={`Armazém ${armazem.codigo} - ${armazem.descricao}${armazem.bloqueado ? ' - Bloqueado' : ''}`}
                aria-disabled={armazem.bloqueado}
              >
                {/* Badge de Bloqueado */}
                {armazem.bloqueado && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 text-xs font-semibold"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    BLOQUEADO
                  </Badge>
                )}

                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                        ${armazem.bloqueado
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary/10 text-primary'
                        }
                      `}
                    >
                      {armazem.bloqueado && <Lock className="h-4 w-4" />}
                      {!armazem.bloqueado && armazem.codigo}
                    </div>
                    <span
                      className={`
                        text-sm font-semibold
                        ${armazem.bloqueado ? 'text-red-700' : 'text-muted-foreground'}
                      `}
                    >
                      Armazém {armazem.codigo}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`
                      text-sm font-medium leading-tight
                      ${armazem.bloqueado ? 'text-red-900/70' : 'text-foreground'}
                    `}
                  >
                    {armazem.descricao}
                  </p>
                </CardContent>

                {/* Barra inferior - vermelha para bloqueados, azul para ativos */}
                <div
                  className={`
                    absolute bottom-0 left-0 w-full h-1.5
                    ${armazem.bloqueado ? 'bg-red-500' : 'bg-primary'}
                  `}
                />
              </Card>
            ))}
          </div>
        ) : (
          // Mensagem quando não há resultados
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum armazém encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os termos de busca
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

