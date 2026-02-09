import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { CardResumo } from '../types'
import { formatarMinutos, formatarQuantidade, normalizarNumero } from '../utils/formatters'

type ResumoKpisProps = {
  cards: CardResumo[]
  animacaoKey?: number
}

const DURACAO_CONTADOR_MS = 3000

const easeOutCubic = (valor: number) => 1 - Math.pow(1 - valor, 3)

const obterMinutos = (valorTexto: string) => {
  const match = valorTexto.trim().match(/^(\d+)\s*:\s*(\d{1,2})$/)
  if (!match) {
    return null
  }
  const horas = Number.parseInt(match[1], 10)
  const minutos = Number.parseInt(match[2], 10)
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) {
    return null
  }
  return Math.max(0, horas * 60 + minutos)
}

type TipoValorResumo = 'quantidade' | 'minutos'

const obterTipoValor = (cardId: string, valorTexto: string): TipoValorResumo => {
  if (cardId.startsWith('paradas') || valorTexto.includes(':')) {
    return 'minutos'
  }
  return 'quantidade'
}

const formatarValorResumo = (valor: number, tipo: TipoValorResumo) => {
  if (tipo === 'minutos') {
    return formatarMinutos(valor)
  }
  return formatarQuantidade(valor)
}

type KpiValorAnimadoProps = {
  valorTexto: string
  valorNumero?: number
  tipo: TipoValorResumo
  classeValor?: string
  animacaoKey?: number
}

const KpiValorAnimado = ({
  valorTexto,
  valorNumero,
  tipo,
  classeValor,
  animacaoKey,
}: KpiValorAnimadoProps) => {
  const valorFinal = useMemo(() => {
    if (typeof valorNumero === 'number' && Number.isFinite(valorNumero)) {
      return Math.max(0, Math.round(valorNumero))
    }
    if (tipo === 'minutos') {
      const minutos = obterMinutos(valorTexto)
      return minutos ?? 0
    }
    return Math.max(0, Math.round(normalizarNumero(valorTexto)))
  }, [tipo, valorNumero, valorTexto])

  const [textoExibido, setTextoExibido] = useState(() => formatarValorResumo(0, tipo))
  const ultimoValorRef = useRef(-1)

  useEffect(() => {
    if (typeof animacaoKey === 'number' && animacaoKey <= 0) {
      setTextoExibido(formatarValorResumo(valorFinal, tipo))
      return undefined
    }

    const reduzirMovimento =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduzirMovimento) {
      setTextoExibido(formatarValorResumo(valorFinal, tipo))
      return undefined
    }

    let frameId = 0

    const iniciarAnimacao = () => {
      let inicio: number | null = null
      ultimoValorRef.current = -1
      setTextoExibido(formatarValorResumo(0, tipo))

      const animar = (timestamp: number) => {
        if (inicio === null) {
          inicio = timestamp
        }
        const progresso = Math.min((timestamp - inicio) / DURACAO_CONTADOR_MS, 1)
        const valorAtual = Math.round(valorFinal * easeOutCubic(progresso))
        if (valorAtual !== ultimoValorRef.current) {
          ultimoValorRef.current = valorAtual
          setTextoExibido(formatarValorResumo(valorAtual, tipo))
        }
        if (progresso < 1) {
          frameId = requestAnimationFrame(animar)
        }
      }

      frameId = requestAnimationFrame(animar)
    }

    iniciarAnimacao()

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [animacaoKey, tipo, valorFinal])

  return (
    <p
      className={cn(
        'mt-1 text-xl font-semibold leading-tight tabular-nums sm:text-2xl',
        classeValor || 'text-gray-800 dark:text-gray-100'
      )}
    >
      {textoExibido}
    </p>
  )
}

const CARD_ACCENTS: Record<string, string> = {
  qtd_envase: 'bg-primary/80',
  perdas_envase: 'bg-red-500/80',
  envasado: 'bg-primary/80',
  paradas_grandes: 'bg-orange-500/80',
  sku_produzidos: 'bg-primary/80',
  paradas_estrategicas: 'bg-slate-400/80',
  qtd_embalagem: 'bg-primary/80',
  perdas_embalagem: 'bg-red-500/80',
  embalado: 'bg-primary/80',
  pequenas_paradas: 'bg-amber-500/80',
  qtde_turnos: 'bg-primary/80',
  paradas_totais: 'bg-orange-500/80',
}

export function ResumoKpis({ cards, animacaoKey }: ResumoKpisProps) {
  const PRIMEIRA_LINHA_IDS = ['qtd_envase', 'perdas_envase', 'envasado', 'paradas_grandes', 'sku_produzidos', 'paradas_estrategicas']
  const SEGUNDA_LINHA_IDS = ['qtd_embalagem', 'perdas_embalagem', 'embalado', 'pequenas_paradas', 'qtde_turnos', 'paradas_totais']
  const isCardResumo = (card: CardResumo | undefined): card is CardResumo => Boolean(card)

  const cardsPorId = new Map(cards.map((card) => [card.id, card]))
  const primeiraLinha = PRIMEIRA_LINHA_IDS.map((id) => cardsPorId.get(id)).filter(isCardResumo)
  const segundaLinha = SEGUNDA_LINHA_IDS.map((id) => cardsPorId.get(id)).filter(isCardResumo)

  const renderLinhaCards = (cardsLinha: CardResumo[]) => (
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
      {cardsLinha.map((card) => {
        const tipoValor = obterTipoValor(card.id, card.valor)

        return (
          <article
            key={card.id}
            className="group min-w-[210px] flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span
              className={cn(
                'mb-3 block h-1.5 w-11 rounded-full text-[rgba(10,10,10,1)] transition-[width] duration-200 group-hover:w-14 motion-reduce:transition-none',
                CARD_ACCENTS[card.id] || 'bg-gray-300'
              )}
              aria-hidden="true"
            />

            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-500">
              {card.titulo}
            </h3>
            <KpiValorAnimado
              valorTexto={card.valor}
              valorNumero={card.valorNumero}
              tipo={tipoValor}
              classeValor={card.classeValor}
              animacaoKey={animacaoKey}
            />
            <p className="mt-1 text-sm leading-5 text-gray-500">{card.detalhe}</p>
          </article>
        )
      })}
    </div>
  )

  return (
    <section className="space-y-2">
      {renderLinhaCards(primeiraLinha)}
      {renderLinhaCards(segundaLinha)}
    </section>
  )
}
