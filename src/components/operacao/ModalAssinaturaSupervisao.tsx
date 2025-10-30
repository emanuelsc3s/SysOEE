/**
 * Modal de Assinatura de Aprovação da Supervisão
 * 
 * Componente para captura de assinatura eletrônica do supervisor
 * com validação de permissões e armazenamento seguindo princípios ALCOA+
 * 
 * Requisitos:
 * - Campos de informação (somente leitura): Nome, Crachá, Data/Hora
 * - Canvas interativo para assinatura (touch e mouse)
 * - Botões: Limpar, Confirmar, Cancelar
 * - Validação de assinatura não vazia
 * - Validação de permissão de supervisor
 * - Responsivo para tablet e mobile
 */

import { useState, useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { OrdemProducao, AssinaturaSupervisao } from '@/types/operacao'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileSignature, Eraser, CheckCircle2, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ModalAssinaturaSupervisaoProps {
  /** Se o modal está aberto */
  aberto: boolean
  
  /** Callback para fechar o modal */
  onFechar: () => void
  
  /** Ordem de Produção a ser assinada */
  op: OrdemProducao
  
  /** Callback executado ao confirmar a assinatura */
  onConfirmar: (assinatura: AssinaturaSupervisao) => void
}

/**
 * Modal de Assinatura de Aprovação da Supervisão
 */
export function ModalAssinaturaSupervisao({
  aberto,
  onFechar,
  op,
  onConfirmar,
}: ModalAssinaturaSupervisaoProps) {
  // Referência ao canvas de assinatura
  const sigCanvas = useRef<SignatureCanvas>(null)
  
  // Estado para controlar se a assinatura está vazia
  const [assinaturaVazia, setAssinaturaVazia] = useState(true)

  // Estado para mensagem de erro
  const [erro, setErro] = useState<string | null>(null)

  // Estado para controlar o modo tela cheia
  const [modoTelaCheia, setModoTelaCheia] = useState(false)

  // Estado para armazenar backup da assinatura ao alternar entre modos
  const [assinaturaBackup, setAssinaturaBackup] = useState<string | null>(null)

  // Mock de dados do supervisor (será substituído por autenticação real)
  // TODO: Integrar com sistema de autenticação (useAuth hook)
  const supervisorMock = {
    id: 1,
    nome: 'João Silva Santos',
    cracha: '12345',
    tipo: 'SUPERVISOR', // OPERADOR, SUPERVISOR, ENCARREGADO, GESTOR, ADMIN
  }
  
  // Data e hora atual formatada
  const [dataHoraAtual, setDataHoraAtual] = useState('')
  
  // Atualiza data/hora a cada segundo
  useEffect(() => {
    const atualizarDataHora = () => {
      const agora = new Date()
      setDataHoraAtual(format(agora, "dd/MM/yyyy HH:mm:ss", { locale: ptBR }))
    }
    
    atualizarDataHora()
    const intervalo = setInterval(atualizarDataHora, 1000)
    
    return () => clearInterval(intervalo)
  }, [])
  
  // Valida se o usuário tem permissão de supervisor
  const validarPermissao = (): boolean => {
    // TODO: Integrar com sistema de autenticação real
    const tiposPermitidos = ['SUPERVISOR', 'ENCARREGADO', 'GESTOR', 'ADMIN']
    
    if (!tiposPermitidos.includes(supervisorMock.tipo)) {
      setErro('Apenas supervisores podem assinar aprovações.')
      return false
    }
    
    return true
  }
  
  // Limpa a assinatura
  const handleLimpar = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setAssinaturaVazia(true)
      setErro(null)
    }
  }

  // Ativa o modo tela cheia
  const handleAtivarTelaCheia = () => {
    // Salva o conteúdo atual do canvas antes de ativar tela cheia
    if (sigCanvas.current) {
      console.log('[DEBUG] handleAtivarTelaCheia - Canvas ref existe')
      console.log('[DEBUG] isEmpty:', sigCanvas.current.isEmpty())

      // Sempre salvar, mesmo se isEmpty() retornar true (pode estar incorreto)
      const dataURL = sigCanvas.current.toDataURL()
      console.log('[DEBUG] dataURL length:', dataURL.length)
      console.log('[DEBUG] dataURL preview:', dataURL.substring(0, 100))
      setAssinaturaBackup(dataURL)
    } else {
      console.log('[DEBUG] handleAtivarTelaCheia - Canvas ref NÃO existe')
    }
    setModoTelaCheia(true)
  }

  // Desativa o modo tela cheia
  const handleDesativarTelaCheia = () => {
    console.log('[DEBUG] handleDesativarTelaCheia - Iniciando')
    // Salva o conteúdo atual do canvas antes de desativar tela cheia
    if (sigCanvas.current) {
      console.log('[DEBUG] handleDesativarTelaCheia - Canvas ref existe')
      console.log('[DEBUG] isEmpty:', sigCanvas.current.isEmpty())

      // Sempre salvar, mesmo se isEmpty() retornar true (pode estar incorreto)
      const dataURL = sigCanvas.current.toDataURL()
      console.log('[DEBUG] dataURL length:', dataURL.length)
      console.log('[DEBUG] dataURL preview:', dataURL.substring(0, 100))
      setAssinaturaBackup(dataURL)
    } else {
      console.log('[DEBUG] handleDesativarTelaCheia - Canvas ref NÃO existe')
    }
    setModoTelaCheia(false)
  }

  // Limpa a assinatura no modo tela cheia
  const handleLimparTelaCheia = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setAssinaturaVazia(true)
      setAssinaturaBackup(null)
      setErro(null)
    }
  }
  
  // Detecta quando o usuário começa a desenhar
  const handleBegin = () => {
    setAssinaturaVazia(false)
    setErro(null)
  }
  
  // Confirma a assinatura
  const handleConfirmar = () => {
    // Valida permissão
    if (!validarPermissao()) {
      return
    }
    
    // Valida se a assinatura não está vazia
    if (assinaturaVazia || !sigCanvas.current || sigCanvas.current.isEmpty()) {
      setErro('Por favor, assine no campo acima antes de confirmar.')
      return
    }
    
    // Captura a assinatura em base64
    const assinaturaBase64 = sigCanvas.current.toDataURL('image/png')

    // Cria o objeto de assinatura seguindo ALCOA+
    const assinatura: AssinaturaSupervisao = {
      id: `ASS-${op.op}-${Date.now()}`, // ID único temporário
      op: op.op,
      nomeSupervisor: supervisorMock.nome,
      numeroCracha: supervisorMock.cracha,
      dataHoraAssinatura: new Date().toISOString(),
      assinaturaBase64,
      supervisorId: supervisorMock.id,
      created_at: new Date().toISOString(),
      created_by: supervisorMock.id,
    }
    
    // Chama o callback de confirmação
    onConfirmar(assinatura)
    
    // Limpa e fecha o modal
    handleLimpar()
    onFechar()
  }
  
  // Cancela e fecha o modal
  const handleCancelar = () => {
    handleLimpar()
    setErro(null)
    onFechar()
  }
  
  // Reseta o estado quando o modal abre/fecha
  useEffect(() => {
    if (!aberto) {
      handleLimpar()
      setErro(null)
      setModoTelaCheia(false)
      setAssinaturaBackup(null)
    }
  }, [aberto])

  // Restaura o conteúdo do canvas após alternar entre modos
  useEffect(() => {
    console.log('[DEBUG] useEffect restauração - modoTelaCheia:', modoTelaCheia)
    console.log('[DEBUG] useEffect restauração - assinaturaBackup:', assinaturaBackup ? `${assinaturaBackup.length} chars` : 'null')
    console.log('[DEBUG] useEffect restauração - sigCanvas.current:', sigCanvas.current ? 'existe' : 'null')

    if (assinaturaBackup) {
      console.log('[DEBUG] Iniciando restauração com polling')

      let tentativas = 0
      const maxTentativas = 20 // Máximo de 1 segundo (20 x 50ms)
      let timerId: NodeJS.Timeout | null = null
      let cancelado = false

      // Função de polling para verificar quando o canvas está disponível
      const checkCanvas = () => {
        if (cancelado) {
          console.log('[DEBUG] Polling cancelado')
          return
        }

        tentativas++
        console.log(`[DEBUG] Tentativa ${tentativas}/${maxTentativas} - sigCanvas.current:`, sigCanvas.current ? 'existe' : 'null')

        if (sigCanvas.current) {
          console.log('[DEBUG] Canvas encontrado! Executando fromDataURL')
          sigCanvas.current.fromDataURL(assinaturaBackup)
          setAssinaturaVazia(false)
          console.log('[DEBUG] Restauração concluída com sucesso')
        } else if (tentativas < maxTentativas) {
          console.log('[DEBUG] Canvas ainda não disponível, tentando novamente em 50ms')
          timerId = setTimeout(checkCanvas, 50)
        } else {
          console.log('[DEBUG] ERRO: Canvas não ficou disponível após', maxTentativas * 50, 'ms')
        }
      }

      // Inicia o polling após um pequeno delay inicial
      timerId = setTimeout(checkCanvas, 50)

      // Cleanup: cancela o polling se o componente for desmontado
      return () => {
        cancelado = true
        if (timerId) {
          clearTimeout(timerId)
        }
      }
    }
  }, [modoTelaCheia, assinaturaBackup])
  
  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && handleCancelar()}>
      {/* Modo Tela Cheia - Renderizado FORA do DialogContent */}
      {modoTelaCheia ? (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Botões de controle no modo tela cheia */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {/* Botão Limpar */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLimparTelaCheia}
              className="bg-white hover:bg-gray-100 gap-2 shadow-lg"
            >
              <Eraser className="h-4 w-4" />
              Limpar
            </Button>

            {/* Botão Sair da Tela Cheia */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDesativarTelaCheia}
              className="bg-white hover:bg-gray-100 gap-2 shadow-lg"
            >
              <Minimize2 className="h-4 w-4" />
              Sair da Tela Cheia
            </Button>
          </div>

          {/* Canvas de assinatura em tela cheia */}
          <div className="w-[80vw] h-[80vh] border-4 border-primary rounded-lg bg-white overflow-hidden shadow-2xl">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-full cursor-crosshair touch-none',
              }}
              backgroundColor="white"
              penColor="black"
              onBegin={handleBegin}
              velocityFilterWeight={0.7}
              minWidth={0.5}
              maxWidth={2.5}
              dotSize={1}
            />
          </div>
        </div>
      ) : (
        /* Modo Normal - Renderizado DENTRO do DialogContent */
        <DialogContent className="sm:max-w-[600px] tab-prod:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl tab-prod:text-lg">
              <FileSignature className="h-5 w-5 text-primary" />
              Assinatura de Aprovação da Supervisão
            </DialogTitle>
            <DialogDescription className="text-sm tab-prod:text-xs">
              Assine digitalmente para aprovar a Ordem de Produção {op.op}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Informações do Supervisor (Somente Leitura) */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Informações do Supervisor
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                  <Input
                    value={supervisorMock.nome}
                    readOnly
                    className="bg-muted cursor-not-allowed mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Número do Crachá</Label>
                    <Input
                      value={supervisorMock.cracha}
                      readOnly
                      className="bg-background mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Data e Hora</Label>
                    <Input
                      value={dataHoraAtual}
                      readOnly
                      className="bg-background mt-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Informações da OP */}
            <div className="bg-primary/5 p-3 rounded-lg space-y-1 text-sm">
              <p className="font-semibold text-foreground">OP {op.op}</p>
              <p className="text-foreground">{op.produto}</p>
              <p className="text-muted-foreground">Lote: {op.lote}</p>
              <p className="text-muted-foreground">Equipamento: {op.equipamento}</p>
            </div>

            {/* Área de Assinatura */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Assinatura Eletrônica</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAtivarTelaCheia}
                    className="h-8 gap-1"
                  >
                    <Maximize2 className="h-3 w-3" />
                    Tela Cheia
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLimpar}
                    className="h-8 gap-1"
                  >
                    <Eraser className="h-3 w-3" />
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="border-2 border-dashed border-primary/30 rounded-lg bg-white overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: 'w-full h-48 tab-prod:h-40 cursor-crosshair touch-none',
                  }}
                  backgroundColor="white"
                  penColor="black"
                  onBegin={handleBegin}
                  velocityFilterWeight={0.7}
                  minWidth={0.5}
                  maxWidth={2.5}
                  dotSize={1}
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Assine no campo acima usando o mouse ou toque na tela
              </p>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{erro}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelar}
              className="tab-prod:text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              className="bg-primary hover:bg-primary/90 tab-prod:text-xs"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}

