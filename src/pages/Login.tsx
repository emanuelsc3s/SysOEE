// React Core
import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Supabase
import { supabase, handleSupabaseError } from '@/lib/supabase'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

// Utils
import { cn } from '@/lib/utils'

// Icons
import { User, Lock, Loader2, AlertCircle, Shield } from 'lucide-react'

/**
 * Interface para dados do formulário de login
 */
interface LoginFormData {
  /** E-mail ou nome de usuário para login */
  credential: string
  password: string
}

/**
 * Verifica se o valor é um e-mail válido
 * @param value - Valor para verificar
 * @returns true se for um e-mail, false se for nome de usuário
 */
function isEmail(value: string): boolean {
  return value.includes('@')
}

/**
 * Componente MobileBackground
 * Background minimalista e corporativo para dispositivos mobile
 * Visível apenas em telas menores que 640px (sm breakpoint)
 */
function MobileBackground() {
  return (
    <div className="sm:hidden absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Gradiente vertical sutil - do azul corporativo para branco */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary via-brand-primary/95 to-brand-primary/90 h-[35%]" />

      {/* Linha divisória elegante */}
      <div className="absolute top-[35%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}

/**
 * ============================================================================
 * SISTEMA DE DIVISÃO DIAGONAL - DESIGN LIMPO E ELEGANTE
 * ============================================================================
 *
 * Arquitetura simplificada com foco no efeito principal:
 * - Diagonal invertida: esquerda inferior → direita superior
 * - Linha azul discreta como elemento de divisão
 * - Glassmorphism sutil (~4% da tela)
 * - Visual limpo e profissional
 *
 * Técnicas utilizadas:
 * - CSS clip-path polygon para corte diagonal invertido
 * - backdrop-filter: blur() para efeito glassmorphism sutil
 * - Gradiente azul descendente como efeito principal
 * ============================================================================
 */

/**
 * DiagonalBlueBar - Linha diagonal de separação (fina e elegante)
 *
 * Mantém a divisão visual no estilo da referência: uma linha discreta,
 * limpa e levemente iluminada, sem bloco pesado ou vidro dominante.
 *
 * - Alinhada à diagonal do clip-path
 * - Usa a largura da seção branding + offset para alinhar a borda
 * - Cor alinhada ao azul corporativo
 */
function DiagonalBlueBar() {
  /**
   * Clip-path da linha diagonal usando a largura real da seção de branding
   * e a espessura total configurada no CSS.
   */
  const diagonalLineClipPath = `polygon(
    calc(var(--login-branding-width) - (var(--login-diagonal-line-width) / 2)) 0,
    calc(var(--login-branding-width) + (var(--login-diagonal-line-width) / 2)) 0,
    calc(var(--login-branding-width) - var(--login-diagonal-offset) + (var(--login-diagonal-line-width) / 2)) 100%,
    calc(var(--login-branding-width) - var(--login-diagonal-offset) - (var(--login-diagonal-line-width) / 2)) 100%
  )`

  return (
    <div
      className="hidden lg:block absolute inset-0 pointer-events-none z-30"
      aria-hidden="true"
    >
      {/* Linha principal nítida (alta definição) */}
      <div
        className="absolute login-diagonal-line"
        style={{
          inset: 0,
          // Clip-path cria uma faixa fina exatamente sobre a diagonal
          clipPath: diagonalLineClipPath,
          WebkitClipPath: diagonalLineClipPath,
        }}
      />

      {/* Brilho animado (movimento de luz) */}
      <div
        className="absolute login-diagonal-line-shine"
        style={{
          inset: 0,
          clipPath: diagonalLineClipPath,
          WebkitClipPath: diagonalLineClipPath,
        }}
      />
    </div>
  )
}



/**
 * BrandingSection - Seção de Branding com Diagonal Limpa
 *
 * Seção esquerda com sistema de divisão diagonal simplificado.
 * Foco no efeito da barra azul descendente como elemento principal.
 *
 * Direção da diagonal: INVERTIDA (esquerda inferior → direita superior)
 *
 * Hierarquia visual simplificada:
 * 1. Vídeo de fundo da linha de produção
 * 2. Overlay gradiente para legibilidade
 * 3. Glassmorphism diagonal (reduzido ~12%)
 * 4. Sombra sutil de profundidade
 * 5. Barra azul descendente (EFEITO PRINCIPAL)
 * 6. Conteúdo de texto
 */
function BrandingSection() {
  /**
   * Clip-path único para manter a diagonal do vídeo
   * exatamente alinhada com a linha de divisão.
   */
  const diagonalClipPath = 'polygon(0 0, 100% 0, calc(100% - var(--login-diagonal-offset)) 100%, 0 100%)'

  return (
    <section
      className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden z-10 login-page-section"
      aria-label="Vídeo institucional da linha de produção"
      style={{
        /**
         * Clip-path para corte diagonal INVERTIDO
         *
         * Nova geometria: diagonal de baixo-esquerda para cima-direita
         * - (0 0): Canto superior esquerdo fixo
         * - (100% 0): Canto superior direito completo
         * - (calc(100% - offset) 100%): Inferior direito com recuo da diagonal
         * - (0 100%): Canto inferior esquerdo fixo
         *
         * O resultado é uma diagonal que vai do canto inferior (com recuo)
         * ao topo direito, criando a direção invertida solicitada.
         */
        clipPath: diagonalClipPath,
        WebkitClipPath: diagonalClipPath,
      }}
    >
      {/* ====== CAMADA 1: Vídeo de fundo institucional ====== */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          // Garante o corte diagonal do vídeo no lado direito
          clipPath: diagonalClipPath,
          WebkitClipPath: diagonalClipPath,
        }}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src="/VideoLinhaE.mp4" type="video/mp4" />
      </video>

      {/* ====== CAMADA 2: Overlay gradiente para legibilidade ====== */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `linear-gradient(
            to right,
            rgba(6, 98, 195, 0.85) 0%,
            rgba(6, 98, 195, 0.65) 30%,
            rgba(6, 98, 195, 0.35) 60%,
            rgba(6, 98, 195, 0.1) 85%,
            transparent 100%
          )`,
        }}
      />

      {/* NOTA: A barra azul (DiagonalBlueBar) foi movida para o container principal
          para ficar posicionada na interseção exata entre as duas seções */}

      {/* ====== CONTEÚDO: Texto e branding sobre o vídeo ====== */}
      <div className="relative z-10 flex flex-col justify-end p-12 text-white">
        <div className="max-w-md lg:max-w-none space-y-4">
          {/* Logo e nome do sistema */}
          <div className="flex items-center gap-3 lg:w-[28rem]">
            <Shield className="h-10 w-10 drop-shadow-lg" aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight drop-shadow-lg">SICFAR OEE</span>
          </div>

          {/* Título principal com sombra para legibilidade */}
          <h1
            className="text-3xl lg:text-[1.75rem] font-bold leading-tight lg:w-[28rem]"
            style={{
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}
          >
            Monitoramento da Eficiência<br className="hidden lg:block" /> Operacional de Equipamentos.
          </h1>

          {/* Subtítulo */}
          <p
            className="text-lg text-white/90 leading-relaxed xl:whitespace-nowrap"
            style={{
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            Disponibilidade, Performance e Qualidade. Tudo em um só lugar.
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * Página de Login do Sistema OEE SicFar
 * Layout split-screen responsivo: 50% branding (lg), 60% (xl) + formulário
 * Integração com Supabase para autenticação
 * Tratamento de erros via Dialog/Modal
 */
export default function Login() {
  // Estados do formulário
  const [formData, setFormData] = useState<LoginFormData>({
    credential: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const navigate = useNavigate()

  /**
   * Verificar se o usuário já está autenticado ao carregar a página
   * Se sim, redirecionar para home
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true })
      }
    })
  }, [navigate])

  /**
   * Validação client-side do formulário
   * Retorna objeto com status de validação e mensagem de erro
   */
  const validateForm = (): { isValid: boolean; errorMessage?: string } => {
    // Credencial obrigatória
    if (!formData.credential.trim()) {
      return {
        isValid: false,
        errorMessage: 'Por favor, informe seu usuário.'
      }
    }

    // Se for e-mail, validar formato
    if (isEmail(formData.credential)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.credential)) {
        return {
          isValid: false,
          errorMessage: 'Por favor, informe um e-mail válido.'
        }
      }
    }

    // Senha obrigatória
    if (!formData.password.trim()) {
      return {
        isValid: false,
        errorMessage: 'Por favor, informe sua senha.'
      }
    }

    // Senha mínima (6 caracteres)
    if (formData.password.length < 6) {
      return {
        isValid: false,
        errorMessage: 'A senha deve ter pelo menos 6 caracteres.'
      }
    }

    return { isValid: true }
  }

  /**
   * Busca o e-mail associado a um nome de usuário na tabela tbusuario
   * Usa função RPC com SECURITY DEFINER para acessar dados de forma segura
   * @param username - Nome de usuário para buscar
   * @returns E-mail do usuário ou null se não encontrado
   */
  const getEmailFromUsername = async (username: string): Promise<string | null> => {
    try {
      // Usar função RPC que faz a busca de forma segura (SECURITY DEFINER)
      // A função busca em tbusuario e auth.users, retornando apenas o email
      const { data, error } = await supabase
        .rpc('get_email_by_username', { username: username.trim() })

      if (error) {
        console.error('Erro ao buscar email do usuário:', error)
        return null
      }

      return data as string | null
    } catch (error) {
      console.error('Erro ao buscar email do usuário:', error)
      return null
    }
  }

  /**
   * Função de submissão do formulário de login
   * Valida os campos, autentica no Supabase e redireciona
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validação client-side
    const validation = validateForm()
    if (!validation.isValid) {
      setErrorDialog({
        isOpen: true,
        title: 'Campo obrigatório',
        message: validation.errorMessage || 'Erro de validação'
      })
      return
    }

    setIsLoading(true)

    try {
      let emailToAuth = formData.credential.trim()

      // Se não for e-mail, buscar o e-mail associado ao nome de usuário
      if (!isEmail(formData.credential)) {
        const userEmail = await getEmailFromUsername(formData.credential)

        if (!userEmail) {
          setErrorDialog({
            isOpen: true,
            title: 'Usuário não encontrado',
            message: 'Não foi possível encontrar um usuário ativo com esse nome. Verifique se o nome de usuário está correto.'
          })
          setIsLoading(false)
          return
        }

        emailToAuth = userEmail
      }

      // Autenticação Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password: formData.password
      })

      if (error) {
        const errorMessage = handleSupabaseError(error)

        setErrorDialog({
          isOpen: true,
          title: 'Erro ao fazer login',
          message: errorMessage
        })

        return
      }

      // Login bem-sucedido
      if (data.user) {
        // Pequeno delay para feedback visual
        setTimeout(() => {
          navigate('/')
        }, 300)
      }

    } catch (err) {
      console.error('Erro inesperado no login:', err)

      setErrorDialog({
        isOpen: true,
        title: 'Erro inesperado',
        message: 'Ocorreu um erro ao processar seu login. Tente novamente.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page flex flex-col lg:flex-row relative">
      {/* Seção Branding (Esquerda) */}
      <BrandingSection />

      {/* ============================================================
          LINHA DIAGONAL - DIVISÃO SUTIL ENTRE AS SEÇÕES
          ============================================================

          Inspirada na referência enviada: uma linha fina e elegante
          que define a separação sem pesar no layout.
          ============================================================ */}
      <DiagonalBlueBar />

      {/* ============================================================
          SEÇÃO FORMULÁRIO (DIREITA) - Design Limpo e Elegante
          ============================================================

          Seção com margin-left negativo para preencher o gap criado
          pelo clip-path da seção de branding. A barra azul sobrepõe
          a interseção, criando continuidade visual perfeita.

          A classe 'login-form-section' define o margin-left responsivo:
          - lg: margin-left = -3rem (compensa clip-path de 4rem)
          - xl: mesma compensação
          ============================================================ */}
      <section
        className={cn(
          "login-page-section flex-1 lg:w-1/2 xl:w-2/5 flex flex-col relative overflow-hidden",
          // Mobile: fundo com área azul corporativa no topo
          "max-sm:bg-brand-bg-primary",
          // Tablet/Desktop: fundo padrão
          "sm:bg-brand-bg-primary sm:p-4 md:p-6 lg:p-8 sm:items-center sm:justify-between",
          // Padding para compensar o margin negativo e dar espaço ao conteúdo
          "lg:pl-14 xl:pl-16",
          // Classe customizada para margin-left negativo responsivo
          "login-form-section"
        )}
        aria-label="Formulário de login"
      >
        {/* Background corporativo para mobile */}
        <MobileBackground />

        {/* ===== LAYOUT MOBILE (< 640px) ===== */}
        <div className="sm:hidden relative z-10 flex flex-col h-full">

          {/* Header azul com logo e título */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6">
            <img
              src="/logo-farmace.png"
              alt="Farmace"
              className="h-20 w-auto mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
            />
            <h1 className="text-2xl font-semibold text-white/90 tracking-wide text-shimmer drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-500">
              SICFAR OEE
            </h1>
            <p className="text-sm text-white/70 mt-1 text-shimmer drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:drop-shadow-[0_0_18px_rgba(255,255,255,0.4)] transition-all duration-500">
              Monitoramento de Eficiência Operacional
            </p>
          </div>

          {/* Card de login - área branca arredondada */}
          <div className="flex-1 bg-white rounded-t-3xl px-6 pt-8 pb-4 flex flex-col">

            {/* Título do formulário */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-brand-text-primary">
                Acesse sua conta
              </h2>
              <p className="text-sm text-brand-text-secondary mt-1">
                Digite suas credenciais para continuar
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleLogin} className="space-y-4 flex-1">
              {/* Campo Usuário */}
              <div className="space-y-1.5">
                <Label htmlFor="credential" className="text-brand-text-primary font-medium text-sm">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
                  <Input
                    id="credential"
                    name="credential"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={formData.credential}
                    onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
                    disabled={isLoading}
                    required
                    autoComplete="username"
                    className="pl-10 h-12 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-brand-text-primary font-medium text-sm">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-text-secondary" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                    className="pl-10 h-12 rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Botão Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-medium bg-brand-primary hover:bg-brand-primary/90 rounded-lg mt-2 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Copyright */}
            <div className="mt-auto pt-4">
              <p className="text-xs text-center text-brand-text-secondary/60">
                © {new Date().getFullYear()} FARMACE. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* ===== LAYOUT TABLET/DESKTOP (≥ 640px) ===== */}
        <div className="hidden sm:flex sm:flex-col sm:items-center sm:justify-between sm:h-full sm:w-full">

          {/* Logo Farmace */}
          <div className="mb-4 md:mb-6 flex justify-center shrink-0">
            <img
              src="/logo-farmace.png"
              alt="Farmace"
              className="h-12 md:h-16 lg:h-20 w-auto"
            />
          </div>

          {/* Container central flexível para o card */}
          <div className="flex-1 flex items-center justify-center w-full min-h-0">
            <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in-up transition-lift hover:shadow-xl">
              <CardHeader className="space-y-2 pb-4 md:pb-6 pt-6">
                <CardTitle className="text-2xl md:text-3xl font-bold text-brand-text-primary text-center">
                  Bem-vindo
                </CardTitle>
                <CardDescription className="text-center text-base text-brand-text-secondary">
                  Faça login para acessar o sistema
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-6">
                <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                  {/* Campo Usuário */}
                  <div className="space-y-2">
                    <Label htmlFor="credential-desktop" className="text-brand-text-primary font-medium text-base">
                      Usuário
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="credential-desktop"
                        name="credential"
                        type="text"
                        placeholder="Digite seu usuário"
                        value={formData.credential}
                        onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
                        disabled={isLoading}
                        required
                        autoComplete="username"
                        className="pl-10 h-11 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Campo Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="password-desktop" className="text-brand-text-primary font-medium text-base">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-desktop"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                        required
                        className="pl-10 h-11 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Copyright */}
          <div className="mt-4 md:mt-6 text-center shrink-0">
            <p className="text-sm text-brand-text-secondary">
              © {new Date().getFullYear()} FARMACE. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </section>

      {/* Dialog de Erro */}
      <Dialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog({ ...errorDialog, isOpen: open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-xl">{errorDialog.title}</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="text-base pt-4">
            {errorDialog.message}
          </DialogDescription>
          <DialogFooter className="pt-4">
            <Button
              onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}
              className="w-full"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
