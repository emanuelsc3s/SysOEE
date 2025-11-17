/**
 * Página de Apontamento de OEE
 * Permite apontamento de produção, qualidade (perdas e retrabalho) e paradas
 * Calcula OEE em tempo real e exibe em velocímetro
 *
 * Layout baseado em code_oee_apontar.html
 */

import { useState, useEffect } from 'react'
import { Save, Timer, CheckCircle, ChevronDownIcon, Trash, LayoutDashboard, ArrowLeft, ClipboardCheck, FileText } from 'lucide-react'
import { ptBR } from 'date-fns/locale'
import { LINHAS_PRODUCAO, buscarLinhaPorId } from '@/data/mockLinhas'
import { buscarSKUPorCodigo, buscarSKUsPorSetor } from '@/data/mockSKUs'
import { Turno } from '@/types/operacao'
import {
  salvarApontamentoProducao,
  salvarApontamentoPerdas,
  salvarApontamentoRetrabalho,
  calcularOEE
} from '@/services/localStorage/apontamento-oee.storage'
import { CalculoOEE } from '@/types/apontamento-oee'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppHeader } from "@/components/layout/AppHeader"

// Tipo para os formulários disponíveis
type FormularioAtivo = 'production-form' | 'quality-form' | 'downtime-form'

export default function ApontamentoOEE() {
  const { toast } = useToast()

  // ==================== Estado de Navegação ====================
  const [formularioAtivo, setFormularioAtivo] = useState<FormularioAtivo>('production-form')

  // ==================== Estado do Cabeçalho ====================
  const [data, setData] = useState<Date | undefined>(new Date())
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [turno, setTurno] = useState<Turno>('1º Turno')
  const [linhaId, setLinhaId] = useState<string>('')
  const [skuCodigo, setSkuCodigo] = useState<string>('')
  const [ordemProducao, setOrdemProducao] = useState<string>('')
  const [lote, setLote] = useState<string>('')
  const [dossie, setDossie] = useState<string>('')

  // ==================== Estado de Produção ====================
  const [horaInicio, setHoraInicio] = useState<string>('')
  const [horaFim, setHoraFim] = useState<string>('')
  const [quantidadeProduzida, setQuantidadeProduzida] = useState<string>('')

  // ==================== Estado de Qualidade - Perdas ====================
  const [quantidadePerdas, setQuantidadePerdas] = useState<string>('')
  const [motivoPerdas, setMotivoPerdas] = useState<string>('')

  // ==================== Estado de Qualidade - Retrabalho ====================
  const [quantidadeRetrabalho, setQuantidadeRetrabalho] = useState<string>('')
  const [motivoRetrabalho, setMotivoRetrabalho] = useState<string>('')

  // ==================== Estado de Tempo de Parada ====================
  const [tipoParada, setTipoParada] = useState<string>('Planejado')
  const [duracaoParada, setDuracaoParada] = useState<string>('')
  const [motivoNivel1, setMotivoNivel1] = useState<string>('')
  const [motivoNivel2, setMotivoNivel2] = useState<string>('')
  const [motivoNivel3, setMotivoNivel3] = useState<string>('')
  const [motivoNivel4, setMotivoNivel4] = useState<string>('')
  const [motivoNivel5, setMotivoNivel5] = useState<string>('')

  // ==================== Estado de OEE ====================
  const [apontamentoProducaoId, setApontamentoProducaoId] = useState<string | null>(null)
  const [oeeCalculado, setOeeCalculado] = useState<CalculoOEE>({
    disponibilidade: 3.4,
    performance: 61.63,
    qualidade: 99.4,
    oee: 2.08,
    tempoOperacionalLiquido: 0,
    tempoValioso: 0
  })

  // ==================== Dados Derivados ====================
  const linhaSelecionada = linhaId ? buscarLinhaPorId(linhaId) : null
  const skuSelecionado = skuCodigo ? buscarSKUPorCodigo(skuCodigo) : null
  const skusDisponiveis = linhaSelecionada
    ? buscarSKUsPorSetor(linhaSelecionada.setor)
    : []

  // ==================== Dados Mock de Histórico ====================
  const historicoProducao = [
    { dataHora: '2023-10-27 08:00', inicio: '08:00', fim: '12:00', qtdProd: '15.000' },
    { dataHora: '2023-10-27 13:00', inicio: '13:00', fim: '17:00', qtdProd: '14.500' },
    { dataHora: '2023-10-26 08:00', inicio: '08:00', fim: '12:00', qtdProd: '14.800' },
    { dataHora: '2023-10-26 13:00', inicio: '13:00', fim: '17:00', qtdProd: '15.200' },
    { dataHora: '2023-10-25 08:00', inicio: '08:00', fim: '12:00', qtdProd: '14.900' },
    { dataHora: '2023-10-25 13:00', inicio: '13:00', fim: '17:00', qtdProd: '15.100' },
    { dataHora: '2023-10-24 08:00', inicio: '08:00', fim: '12:00', qtdProd: '14.700' },
    { dataHora: '2023-10-24 13:00', inicio: '13:00', fim: '17:00', qtdProd: '15.300' },
    { dataHora: '2023-10-23 08:00', inicio: '08:00', fim: '12:00', qtdProd: '14.600' },
  ]

  // ==================== Recalcula OEE quando dados mudam ====================
  useEffect(() => {
    if (apontamentoProducaoId) {
      const novoOEE = calcularOEE(apontamentoProducaoId)
      setOeeCalculado(novoOEE)
    }
  }, [apontamentoProducaoId])

  // ==================== Handlers ====================
  const handleSalvarProducao = () => {
    toast({
      title: 'Sucesso',
      description: 'Dados de produção salvos com sucesso'
    })
  }

  const handleAdicionarQualidade = () => {
    toast({
      title: 'Sucesso',
      description: 'Registro de qualidade adicionado'
    })
  }

  const handleRegistrarParada = () => {
    toast({
      title: 'Sucesso',
      description: 'Tempo de parada registrado'
    })
  }

  // ==================== Handlers do Header CRUD ====================
  const handleVoltar = () => {
    window.history.back()
  }

  const handleDashboard = () => {
    // TODO: Navegar para o dashboard principal quando a rota estiver definida
    toast({
      title: 'Navegação',
      description: 'Redirecionando para o dashboard...'
    })
  }

  const handleSalvar = () => {
    // TODO: Implementar lógica de salvamento geral do apontamento
    toast({
      title: 'Sucesso',
      description: 'Dados do apontamento salvos com sucesso'
    })
  }

  const handleExcluir = () => {
    // TODO: Adicionar diálogo de confirmação antes de excluir
    toast({
      title: 'Atenção',
      description: 'Funcionalidade de exclusão será implementada',
      variant: 'destructive'
    })
  }

  return (
    <>
      {/* Cabeçalho da Aplicação */}
      <AppHeader
        title="SysOEE - Sistema de Monitoramento OEE"
        userName="Emanuel Silva"
        userRole="Administrador"
      />

      {/* Header CRUD */}
      <div className="bg-background-light dark:bg-background-dark">
        <div className="flex justify-center">
          <div className="w-full max-w-[1600px] px-3.5 pr-1.5 pt-3.5 pb-0">
            <div className="flex items-center justify-between">
              {/* Seção Esquerda - Título e Subtítulo */}
              <div>
                <h1 className="text-2xl font-bold text-brand-primary">
                  Diário de Bordo
                </h1>
                <p className="text-brand-text-secondary">
                  Registro de produção, qualidade e paradas
                </p>
              </div>

              {/* Seção Direita - Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 min-w-[120px] justify-center"
                  onClick={handleVoltar}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>

                <Button
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                  onClick={handleDashboard}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>

                {/* Dropdown de Complemento */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Complemento
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => console.log('Procedimento Operacional')}>
                      Procedimento Operacional
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Anexos')}>
                      Anexos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Evento')}>
                      Evento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Desvio')}>
                      Desvio
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Manutenção')}>
                      Manutenção
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('Tecnologia da Informação')}>
                      Tecnologia da Informação
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="destructive"
                  className="min-w-[120px] justify-center"
                  onClick={handleExcluir}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir
                </Button>

                <Button
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                  onClick={handleSalvar}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo da Página - Container Centralizado */}
      <div className="min-h-screen flex justify-center gap-0 text-text-primary-light dark:text-text-primary-dark transition-colors duration-300" style={{ backgroundColor: '#f6f6f8' }}>
        {/* Container com largura máxima centralizado */}
        <div className="w-full max-w-[1600px] flex gap-0">
          {/* Conteúdo Principal */}
          <div className="flex-grow flex flex-col">
            {/* Main Content */}
            <main className="flex-grow p-4 pr-2 bg-background-light dark:bg-background-dark">
          {/* Dashboard OEE - Cabeçalho com Filtros */}
          <div className="flex-grow bg-white dark:bg-white p-4 pr-2 shadow-sm border-b border-border-light dark:border-border-dark mb-6">
            <div className="flex flex-col gap-y-4">
              {/* Primeira linha: Data, Turno, Linha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="date" className="text-sm font-medium text-muted-foreground">
                    Data
                  </Label>
                  <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal"
                      >
                        {data ? data.toLocaleDateString('pt-BR') : "Selecione a data"}
                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={data}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setData(date)
                          setOpenDatePicker(false)
                        }}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Turno</span>
                  <Select value={turno} onValueChange={(value) => setTurno(value as Turno)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1º Turno">1º Turno</SelectItem>
                      <SelectItem value="2º Turno">2º Turno</SelectItem>
                      <SelectItem value="3º Turno">3º Turno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Linha de Produção</span>
                  <Select value={linhaId} onValueChange={setLinhaId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>SPEP</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'SPEP').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>SPPV</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'SPPV').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Líquidos</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'Líquidos').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>CPHD</SelectLabel>
                        {LINHAS_PRODUCAO.filter(l => l.setor === 'CPHD').map(linha => (
                          <SelectItem key={linha.id} value={linha.id}>{linha.nome}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Segunda linha: SKU, OP, Lote, Dossie */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2">
                <div className="md:col-span-2">
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">SKU</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={skuCodigo}
                    onChange={(e) => setSkuCodigo(e.target.value)}
                    placeholder="Digite o código SKU"
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Ordem de Produção</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={ordemProducao}
                    onChange={(e) => setOrdemProducao(e.target.value)}
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Lote</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                  />
                </div>

                <div>
                  <span className="block text-sm font-medium text-muted-foreground mb-1.5">Dossie</span>
                  <input
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    value={dossie}
                    onChange={(e) => setDossie(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Seleção de Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div
              className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                formularioAtivo === 'production-form'
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border-light dark:border-border-dark'
              }`}
              onClick={() => setFormularioAtivo('production-form')}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-2">Produção</h3>
              <p className="text-sm text-muted-foreground">
                Registro da quantidade produzida e tempos de ciclo.
              </p>
            </div>

            <div
              className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                formularioAtivo === 'quality-form'
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border-light dark:border-border-dark'
              }`}
              onClick={() => setFormularioAtivo('quality-form')}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-2">Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Registro de perdas e retrabalhos.
              </p>
            </div>

            <div
              className={`bg-white dark:bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                formularioAtivo === 'downtime-form'
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border-light dark:border-border-dark'
              }`}
              onClick={() => setFormularioAtivo('downtime-form')}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-2">Tempo de Parada</h3>
              <p className="text-sm text-muted-foreground">
                Registro de interrupções e suas causas.
              </p>
            </div>
          </div>

          {/* Formulário de Produção */}
          {formularioAtivo === 'production-form' && (
            <div className="space-y-6">
              <section className="bg-white dark:bg-white p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <h2 className="font-display text-xl font-bold text-primary mb-4">Registro de Produção</h2>
                <div className="space-y-4">
                  {/* Container flex para inputs de tempo e quantidade na mesma linha */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="start-time" className="px-1">Hora Início</Label>
                      <Input type="time" id="start-time" step="60" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="bg-background-light dark:bg-background-dark appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full sm:w-32 md:w-36" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label htmlFor="end-time" className="px-1">Hora Fim</Label>
                      <Input type="time" id="end-time" step="60" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="bg-background-light dark:bg-background-dark appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full sm:w-32 md:w-36" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <Label htmlFor="quantity-produced" className="px-1">Quantidade Produzida</Label>
                      <input
                        className="flex h-9 w-full sm:w-40 md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="quantity-produced"
                        type="number"
                        placeholder="ex: 10000"
                        value={quantidadeProduzida}
                        onChange={(e) => setQuantidadeProduzida(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button
                      className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px] justify-center"
                      onClick={handleSalvarProducao}
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Apontar
                    </Button>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-white p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <h2 className="font-display text-xl font-bold text-primary mb-4">Histórico de Registros de Produção</h2>
                <div className="overflow-x-auto">
                  <div className="max-h-60 overflow-y-auto">
                    <table className="table-auto text-sm text-left text-text-primary-light dark:text-text-primary-dark">
                      <thead className="text-xs text-muted-foreground uppercase bg-background-light dark:bg-background-dark sticky top-0">
                        <tr>
                          <th className="px-1 py-2 font-medium" scope="col">Data/Hora</th>
                          <th className="px-1 py-2 font-medium" scope="col">Início</th>
                          <th className="px-1 py-2 font-medium" scope="col">Fim</th>
                          <th className="px-1 py-2 font-medium text-right" scope="col">Qtd. Prod.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoProducao.map((registro, index) => (
                          <tr
                            key={index}
                            className={`bg-surface-light dark:bg-surface-dark ${
                              index < historicoProducao.length - 1 ? 'border-b border-border-light dark:border-border-dark' : ''
                            }`}
                          >
                            <td className="px-1 py-2 whitespace-nowrap">{registro.dataHora}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.inicio}</td>
                            <td className="px-1 py-2 whitespace-nowrap">{registro.fim}</td>
                            <td className="px-1 py-2 text-right whitespace-nowrap">{registro.qtdProd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Formulário de Qualidade */}
          {formularioAtivo === 'quality-form' && (
            <section className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
              <h2 className="font-display text-xl font-bold text-primary mb-4">Registro de Qualidade</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 border-b border-border-light dark:border-border-dark pb-2">
                    Perdas
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="loss-quantity">
                        Quantidade
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="loss-quantity"
                        type="number"
                        value={quantidadePerdas}
                        onChange={(e) => setQuantidadePerdas(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="loss-reason">
                        Motivo
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="loss-reason"
                        type="text"
                        value={motivoPerdas}
                        onChange={(e) => setMotivoPerdas(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 border-b border-border-light dark:border-border-dark pb-2">
                    Retrabalho
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="rework-quantity">
                        Quantidade
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="rework-quantity"
                        type="number"
                        value={quantidadeRetrabalho}
                        onChange={(e) => setQuantidadeRetrabalho(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="rework-reason">
                        Motivo
                      </label>
                      <input
                        className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="rework-reason"
                        type="text"
                        value={motivoRetrabalho}
                        onChange={(e) => setMotivoRetrabalho(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-2 bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  type="button"
                  onClick={handleAdicionarQualidade}
                >
                  <CheckCircle className="h-5 w-5" />
                  Adicionar Registro de Qualidade
                </button>
              </div>
            </section>
          )}

          {/* Formulário de Tempo de Parada */}
          {formularioAtivo === 'downtime-form' && (
            <section className="bg-surface-light dark:bg-surface-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
              <h2 className="font-display text-xl font-bold text-primary mb-4">Registro de Tempo de Parada</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="downtime-type">
                      Tipo
                    </label>
                    <Select value={tipoParada} onValueChange={setTipoParada}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planejado">Planejado</SelectItem>
                        <SelectItem value="Não Planejado">Não Planejado</SelectItem>
                        <SelectItem value="Pequena Parada">Pequena Parada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="downtime-duration">
                      Duração (min)
                    </label>
                    <input
                      className="w-full rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                      id="downtime-duration"
                      type="number"
                      value={duracaoParada}
                      onChange={(e) => setDuracaoParada(e.target.value)}
                    />
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground">
                  Motivo (hierarquia de 5 níveis)
                </p>

                <div className="space-y-2">
                  <Select value={motivoNivel1} onValueChange={setMotivoNivel1}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nível 1: Área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Máquina">Máquina</SelectItem>
                      <SelectItem value="Processo">Processo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={motivoNivel2} onValueChange={setMotivoNivel2} disabled={!motivoNivel1}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nível 2: Componente" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opções serão adicionadas dinamicamente */}
                    </SelectContent>
                  </Select>

                  <Select value={motivoNivel3} onValueChange={setMotivoNivel3} disabled={!motivoNivel2}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nível 3: Sub-componente" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opções serão adicionadas dinamicamente */}
                    </SelectContent>
                  </Select>

                  <Select value={motivoNivel4} onValueChange={setMotivoNivel4} disabled={!motivoNivel3}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nível 4: Tipo de Problema" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opções serão adicionadas dinamicamente */}
                    </SelectContent>
                  </Select>

                  <Select value={motivoNivel5} onValueChange={setMotivoNivel5} disabled={!motivoNivel4}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nível 5: Causa Específica" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Opções serão adicionadas dinamicamente */}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  className="w-full mt-2 bg-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  type="button"
                  onClick={handleRegistrarParada}
                >
                  <Timer className="h-5 w-5" />
                  Registrar Tempo de Parada
                </button>
              </div>
            </section>
          )}
          </main>
        </div>

        {/* Sidebar Direita - OEE Real */}
        <div className="w-80 lg:w-96 xl:w-[28rem] flex-shrink-0 pl-2 pr-4 py-4 bg-background-light dark:bg-background-dark">
          <aside className="w-full bg-white dark:bg-white p-6 border border-border-light dark:border-border-dark flex flex-col items-center rounded-lg shadow-sm">
            <div className="sticky top-6 w-full">
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 text-center">
                OEE Real
              </h2>

              <div className="flex flex-col items-center gap-8 mb-8">
                {/* Velocímetro SVG */}
                <div className="relative flex-shrink-0">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Círculo de fundo */}
                    <circle
                      className="stroke-gray-200 dark:stroke-gray-700"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeWidth="12"
                    />
                    {/* Círculo de progresso */}
                    <circle
                      className="stroke-primary"
                      cx="60"
                      cy="60"
                      fill="none"
                      r="54"
                      strokeDasharray="339.292"
                      strokeDashoffset={339.292 - (339.292 * oeeCalculado.oee) / 100}
                      strokeLinecap="round"
                      strokeWidth="12"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-text-primary-light dark:text-text-primary-dark">
                      {oeeCalculado.oee.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Barras de Componentes */}
                <div className="w-full space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{oeeCalculado.disponibilidade.toFixed(2)}%</span>
                      <span className="text-muted-foreground">Disponibilidade</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${oeeCalculado.disponibilidade}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{oeeCalculado.performance.toFixed(2)}%</span>
                      <span className="text-muted-foreground">Produtividade</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${oeeCalculado.performance}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold text-base">{oeeCalculado.qualidade.toFixed(2)}%</span>
                      <span className="text-muted-foreground">Qualidade</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${oeeCalculado.qualidade}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="w-full border-t border-border-light dark:border-border-dark pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Horas Restantes de Apontamento de Produção
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">6:30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total de Horas Paradas
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">1:15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total de Perdas de Qualidade
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">150 un</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
        </div>
      </div>
    </>
  )
}
