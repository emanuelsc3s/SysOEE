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
import { Mail, Lock, Loader2, AlertCircle, Shield } from 'lucide-react'

/**
 * Interface para dados do formulário de login
 */
interface LoginFormData {
  email: string
  password: string
}

/**
 * Componente BrandingSection
 * Seção esquerda com vídeo de apresentação e branding
 * Inspirado no design do camera-web, adaptado para OEE SicFar
 */
function BrandingSection() {
  return (
    <section
      className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden"
      aria-label="Vídeo institucional da linha de produção"
    >
      {/* Vídeo de fundo */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src="/VideoLinhaE.mov" type="video/quicktime" />
        <source src="/VideoLinhaE.mov" type="video/mp4" />
      </video>

      {/* Overlay gradiente para melhor legibilidade e estética */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent"
        aria-hidden="true"
      />

      {/* Conteúdo sobre o vídeo */}
      <div className="relative z-10 flex flex-col justify-end p-12 text-white">
        <div className="max-w-md lg:max-w-none space-y-4">
          <div className="flex items-center gap-3 lg:w-[28rem]">
            <Shield className="h-10 w-10" aria-hidden="true" />
            <span className="text-2xl font-bold tracking-tight">SICFAR OEE</span>
          </div>
          <h1 className="text-3xl lg:text-[1.75rem] font-bold leading-tight lg:w-[28rem]">
            Monitoramento da Eficiência<br className="hidden lg:block" /> Operacional de Equipamentos.
          </h1>
          <p className="text-lg text-white/90 leading-relaxed xl:whitespace-nowrap">
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
    email: '',
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
    // Email obrigatório
    if (!formData.email.trim()) {
      return {
        isValid: false,
        errorMessage: 'Por favor, informe seu email.'
      }
    }

    // Email válido (regex básico)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return {
        isValid: false,
        errorMessage: 'Por favor, informe um email válido.'
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
      // Autenticação Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Seção Branding (Esquerda) */}
      <BrandingSection />

      {/* Seção Formulário (Direita) */}
      <section
        className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-brand-bg-primary p-4 md:p-8"
        aria-label="Formulário de login"
      >
        <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in-up transition-lift hover:shadow-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-brand-text-primary text-center">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center text-base text-brand-text-secondary">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-text-primary font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu.email@farmace.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    required
                    className={cn(
                      "pl-10 h-11",
                      "focus:ring-2 focus:ring-primary focus:border-primary",
                      "transition-all duration-200"
                    )}
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-text-primary font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                    className={cn(
                      "pl-10 h-11",
                      "focus:ring-2 focus:ring-primary focus:border-primary",
                      "transition-all duration-200"
                    )}
                  />
                </div>
              </div>

              {/* Botão Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-11 text-base font-semibold",
                  "bg-primary hover:bg-primary/90",
                  "transition-all duration-200",
                  "shadow-md hover:shadow-lg"
                )}
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
