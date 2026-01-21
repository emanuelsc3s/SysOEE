/**
 * Página de Novidades do Sistema OEE
 * 
 * Apresenta os principais recursos e funcionalidades do módulo de Apontamento OEE
 * Design inspirado na página "Novidades do Chrome" do Google
 * 
 * Recursos apresentados:
 * - Velocímetro de OEE em tempo real
 * - Registro de produção por intervalos
 * - Gestão de qualidade (perdas)
 * - Registro de paradas
 * - Controle de lotes de produção
 * - Dashboard de métricas
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Gauge,
  Factory,
  CheckCircle2,
  Clock,
  Package,
  ArrowLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Importação das imagens dos recursos
import imgVelocimetroOEE from './images/01.png'
import imgRegistroProducao from './images/02.png'
import imgQualidade from './images/03.png'
import imgParadas from './images/04.png'
import imgLotes from './images/05.png'

// Dados dos recursos do sistema
const recursos = [
  {
    id: 'velocimetro-oee',
    categoria: 'MONITORAMENTO',
    categoriaClasse: 'badge-monitoring',
    titulo: 'Velocímetro de OEE em Tempo Real',
    descricao: 'Visualize o OEE (Disponibilidade × Performance × Qualidade) em um velocímetro interativo com cores dinâmicas que variam de vermelho (valores baixos) até azul (valores próximos a 100%).',
    instrucoes: [
      'O velocímetro exibe o OEE consolidado do turno atual',
      'Clique no velocímetro para ver a explicação detalhada do cálculo',
      'Barras de progresso mostram cada componente: Disponibilidade, Performance e Qualidade'
    ],
    icone: Gauge,
    imagemReal: imgVelocimetroOEE
  },
  {
    id: 'registro-producao',
    categoria: 'PRODUÇÃO',
    categoriaClasse: 'badge-production',
    titulo: 'Registro de Produção por Intervalos',
    descricao: 'Registre a produção em intervalos configuráveis (1 a 24 horas). As linhas de apontamento são geradas automaticamente com base no turno selecionado.',
    instrucoes: [
      'Selecione o turno para gerar as linhas de apontamento automaticamente',
      'Preencha a quantidade produzida para cada intervalo de tempo',
      'Clique em "Salvar" para registrar cada apontamento individualmente'
    ],
    icone: Factory,
    imagemReal: imgRegistroProducao
  },
  {
    id: 'qualidade',
    categoria: 'QUALIDADE',
    categoriaClasse: 'badge-quality',
    titulo: 'Gestão de Qualidade: Perdas',
    descricao: 'Registre perdas de produção que impactam diretamente no cálculo do índice de Qualidade do OEE.',
    instrucoes: [
      'Acesse a aba "Qualidade" no formulário de apontamento',
      'Informe a quantidade de perdas ocorridas no turno',
      'As perdas serão descontadas das unidades produzidas no cálculo de Qualidade'
    ],
    icone: CheckCircle2,
    imagemReal: imgQualidade
  },
  {
    id: 'paradas',
    categoria: 'PARADAS',
    categoriaClasse: 'badge-downtime',
    titulo: 'Registro de Paradas e Interrupções',
    descricao: 'Registre todas as paradas da linha de produção com classificação automática (Estratégica, Planejada ou Não Planejada) que afetam o cálculo de Disponibilidade.',
    instrucoes: [
      'Acesse a aba "Tempo de Parada" no formulário de apontamento',
      'Busque o tipo de parada no catálogo usando o campo de busca',
      'Informe hora inicial, hora final e observações da parada'
    ],
    icone: Clock,
    imagemReal: imgParadas
  },
  {
    id: 'lotes',
    categoria: 'RASTREABILIDADE',
    categoriaClasse: 'badge-traceability',
    titulo: 'Controle de Lotes de Produção',
    descricao: 'Gerencie lotes de produção com rastreabilidade completa, incluindo quantidade produzida (inicial/final), perdas e horários.',
    instrucoes: [
      'Clique no botão "Lotes" durante o turno para abrir o modal de controle',
      'Adicione novos lotes com número, data, horários e quantidades',
      'Visualize totalizadores de produção e perdas por lote'
    ],
    icone: Package,
    imagemReal: imgLotes
  }
]

// Componente Badge para categorias
interface BadgeProps {
  categoria: string
  classe: string
}

function Badge({ categoria, classe }: BadgeProps) {
  const classesPorTipo: Record<string, string> = {
    'badge-monitoring': 'bg-purple-700',
    'badge-production': 'bg-blue-700',
    'badge-quality': 'bg-green-700',
    'badge-downtime': 'bg-red-700',
    'badge-traceability': 'bg-teal-700'
  }

  return (
    <span 
      className={`inline-block ${classesPorTipo[classe] || 'bg-gray-700'} text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded mb-4`}
    >
      {categoria}
    </span>
  )
}

// Componente Card de Recurso
interface ResourceCardProps {
  recurso: typeof recursos[0]
  onClick: () => void
}

function ResourceCard({ recurso, onClick }: ResourceCardProps) {
  const Icone = recurso.icone

  return (
    <article
      className="bg-white hover:bg-gray-50 rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group border border-gray-200"
      onClick={onClick}
    >
      <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4 flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]">
        <Icone className="w-16 h-16 text-[#1565C0] opacity-70" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
        {recurso.titulo}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
        {recurso.descricao}
      </p>
      <div className="flex justify-end">
        <div className="w-12 h-12 bg-[#1976D2] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
          <Plus className="w-6 h-6 text-white" />
        </div>
      </div>
    </article>
  )
}

// Componente de Seção de Feature (Texto + Imagem)
interface FeatureSectionProps {
  recurso: typeof recursos[0]
  invertido?: boolean
}

function FeatureSection({ recurso, invertido = false }: FeatureSectionProps) {
  const Icone = recurso.icone

  return (
    <section className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center py-16 lg:py-20 ${invertido ? 'lg:[direction:rtl]' : ''}`}>
      <div className={invertido ? 'lg:[direction:ltr]' : ''}>
        <Badge categoria={recurso.categoria} classe={recurso.categoriaClasse} />
        <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 mb-6 leading-tight">
          {recurso.titulo}
        </h2>
        <p className="text-base text-gray-600 leading-relaxed mb-6">
          {recurso.descricao}
        </p>
        <ol className="text-gray-600 list-decimal pl-6 space-y-3">
          {recurso.instrucoes.map((instrucao, idx) => (
            <li key={idx} className="leading-relaxed">
              {instrucao}
            </li>
          ))}
        </ol>
      </div>

      <div className={`bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-3xl p-3 lg:p-4 shadow-xl flex items-center justify-center ${invertido ? 'lg:[direction:ltr]' : ''}`}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-[90%]">
          {/* Barra de título */}
          <div className="bg-[#E8EAED] px-3 py-2 flex items-center">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
          </div>
          {/* Área do screenshot */}
          <div className="aspect-video bg-gradient-to-br from-[#F5F5F5] to-[#E0E0E0] flex items-center justify-center overflow-hidden">
            {recurso.imagemReal ? (
              <img
                src={recurso.imagemReal}
                alt={recurso.titulo}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <Icone className="w-24 h-24 text-[#1976D2] opacity-50" />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Componente Principal
export default function WhatsNewOEE() {
  const [recursoSelecionado, setRecursoSelecionado] = useState<typeof recursos[0] | null>(null)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1976D2] to-[#1565C0] px-6 py-14 lg:py-24">
        {/* Blobs decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 -top-48 -left-24 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.05)_100%)] blur-3xl animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute w-[500px] h-[500px] -top-36 -right-36 rounded-[60%_40%_30%_70%/50%_60%_40%_50%] bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.03)_100%)] blur-3xl animate-pulse"
            style={{ animationDuration: '12s', animationDelay: '-4s' }}
          />
          <div
            className="absolute w-80 h-80 bottom-0 left-1/2 -translate-x-1/2 rounded-[50%_50%_60%_40%/40%_60%_50%_50%] bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.02)_100%)] blur-3xl animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '-6s' }}
          />
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Botão voltar */}
          <div className="absolute top-0 left-0">
            <Link to="/apontamento-oee">
              <button
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
                aria-label="Voltar ao sistema"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* Logo centralizada */}
          <img
            src="/logo-farmace.png"
            alt="Logo Farmace"
            className="h-14 md:h-16 w-auto mx-auto mb-8"
          />

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 tracking-tight">
            Novidades do Sistema OEE
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10">
            Conheça os recursos do módulo de Apontamento OEE para monitoramento de eficiência operacional da Farmace.
          </p>

        </div>
      </section>

      {/* Grid de Cards de Recursos */}
      <section className="px-6 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-medium text-gray-900 text-center mb-4">
            Recursos Principais
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Explore os principais recursos disponíveis no módulo de Apontamento OEE
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recursos.map((recurso) => (
              <ResourceCard
                key={recurso.id}
                recurso={recurso}
                onClick={() => setRecursoSelecionado(recurso)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seções de Features Detalhadas */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {recursos.map((recurso, idx) => (
            <FeatureSection
              key={recurso.id}
              recurso={recurso}
              invertido={idx % 2 === 1}
            />
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-16 lg:py-24 bg-gradient-to-br from-[#1976D2] to-[#1565C0]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Acesse o módulo de Apontamento OEE e comece a monitorar a eficiência da sua linha de produção.
          </p>
          <Link to="/apontamento-oee">
            <Button
              size="lg"
              className="bg-white text-[#1976D2] hover:bg-gray-100 font-medium px-8 py-6 rounded-full text-base shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Acessar Apontamento OEE
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Modal de detalhes do recurso - quando clica no card */}
      {recursoSelecionado && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setRecursoSelecionado(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge categoria={recursoSelecionado.categoria} classe={recursoSelecionado.categoriaClasse} />
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              {recursoSelecionado.titulo}
            </h3>
            <p className="text-gray-600 mb-6">
              {recursoSelecionado.descricao}
            </p>
            <h4 className="text-sm font-bold text-[#1976D2] uppercase tracking-wider mb-3">
              Como usar
            </h4>
            <ol className="text-gray-600 list-decimal pl-6 space-y-2 mb-8">
              {recursoSelecionado.instrucoes.map((instrucao, idx) => (
                <li key={idx}>{instrucao}</li>
              ))}
            </ol>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setRecursoSelecionado(null)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </Button>
              <Link to="/apontamento-oee">
                <Button className="bg-[#1976D2] text-white hover:bg-[#1565C0]">
                  Ir para o Sistema
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

