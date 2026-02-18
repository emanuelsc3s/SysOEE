import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  Clock3,
  Hash,
  IdCard,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface ModalPerfilUsuarioProps {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
}

interface PerfilUsuarioDb {
  usuario_id: number | null
  user_id: string | null
  usuario: string | null
  perfil: string | null
  perfil_id: number | null
  login: string | null
  matricula: string | null
  ramal: string | null
  whatsapp: string | null
  created_at: string | null
  updated_at: string | null
}

interface DadosAuth {
  created_at: string | null
  last_sign_in_at: string | null
  phone: string | null
}

interface CampoInfoProps {
  rotulo: string
  valor: string
  icone: React.ReactNode
}

const formatadorDataHoraPtBr = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function CampoInfo({ rotulo, valor, icone }: CampoInfoProps) {
  return (
    <div className="group flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
          {icone}
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {rotulo}
        </p>
      </div>
      <p className="break-all pl-0.5 text-sm font-medium leading-relaxed text-foreground">
        {valor}
      </p>
    </div>
  )
}

function SecaoHeader({ titulo, icone }: { titulo: string; icone: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icone}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {titulo}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)

  if (partes.length === 0) return 'US'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

function formatarDataHoraPtBr(dataIso: string | null | undefined): string {
  if (!dataIso) return 'Não informado'

  const data = new Date(dataIso)
  if (Number.isNaN(data.getTime())) return 'Não informado'

  return formatadorDataHoraPtBr.format(data)
}

function formatarNumeroPtBr(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || Number.isNaN(valor)) return 'Não informado'
  return valor.toLocaleString('pt-BR')
}

export function ModalPerfilUsuario({ aberto, onOpenChange }: ModalPerfilUsuarioProps) {
  const { user } = useAuth()
  const [carregando, setCarregando] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [dadosPerfil, setDadosPerfil] = useState<PerfilUsuarioDb | null>(null)
  const [dadosAuth, setDadosAuth] = useState<DadosAuth>({
    created_at: null,
    last_sign_in_at: null,
    phone: null,
  })

  const nomeExibicao = useMemo(() => {
    return (
      dadosPerfil?.usuario ||
      user?.usuario ||
      user?.email?.split('@')[0] ||
      'Usuário'
    )
  }, [dadosPerfil?.usuario, user?.email, user?.usuario])

  const emailExibicao = user?.email || 'Não informado'
  const perfilExibicao = dadosPerfil?.perfil || user?.perfil || 'Não informado'
  const iniciais = obterIniciais(nomeExibicao)

  useEffect(() => {
    if (!aberto || !user?.id) return

    let ativo = true

    const carregarDadosPerfil = async () => {
      setCarregando(true)
      setErroCarregamento(null)

      try {
        const [perfilResponse, authResponse] = await Promise.all([
          supabase
            .from('tbusuario')
            .select(
              'usuario_id, user_id, usuario, perfil, perfil_id, login, matricula, ramal, whatsapp, created_at, updated_at'
            )
            .eq('user_id', user.id)
            .eq('deletado', 'N')
            .order('updated_at', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1),
          supabase.auth.getUser(),
        ])

        if (!ativo) return

        if (perfilResponse.error) {
          console.error('Erro ao carregar dados do perfil do usuário:', perfilResponse.error)
          setErroCarregamento('Não foi possível carregar todos os dados do perfil.')
        }

        if (authResponse.error) {
          console.error('Erro ao carregar dados de autenticação do usuário:', authResponse.error)
          setErroCarregamento('Não foi possível carregar todos os dados do perfil.')
        }

        const perfil = perfilResponse.data?.[0] ?? null
        setDadosPerfil(perfil)

        setDadosAuth({
          created_at: authResponse.data.user?.created_at ?? null,
          last_sign_in_at: authResponse.data.user?.last_sign_in_at ?? null,
          phone: authResponse.data.user?.phone ?? null,
        })
      } catch (error) {
        if (!ativo) return

        console.error('Erro inesperado ao carregar perfil do usuário:', error)
        setErroCarregamento('Falha ao carregar perfil. Tente novamente em alguns instantes.')
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    void carregarDadosPerfil()

    return () => {
      ativo = false
    }
  }, [aberto, user?.id])

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[780px] border-border/50 bg-background shadow-[0_25px_60px_-15px_hsl(var(--foreground)/0.30)]">

        {/* Hero: cabeçalho com identidade do usuário */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-8 pb-7 pt-8">
          {/* Elementos decorativos de fundo */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/5 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-primary/5 blur-2xl"
          />

          <div className="relative flex items-start gap-5 sm:items-center">
            {/* Avatar com indicador de sessão ativa */}
            <div className="relative shrink-0">
              <Avatar className="h-[72px] w-[72px] border-[3px] border-background shadow-lg ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {iniciais}
                </AvatarFallback>
              </Avatar>
              <span
                aria-label="Sessão ativa"
                className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-green-500 shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>

            {/* Nome, e-mail e badges */}
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-xl font-bold text-foreground">
                {nomeExibicao}
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-sm text-muted-foreground">
                {emailExibicao}
              </DialogDescription>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="info" className="gap-1.5">
                  <BadgeCheck className="h-3 w-3" />
                  {perfilExibicao}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                >
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
                  Usuário logado
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal com scroll */}
        <div className="max-h-[56vh] overflow-y-auto overscroll-contain px-8 py-6">
          {carregando ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-[76px] rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">

              {/* Dados Principais */}
              <section className="space-y-3">
                <SecaoHeader
                  titulo="Dados Principais"
                  icone={<UserRound className="h-3 w-3" />}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <CampoInfo
                    rotulo="Nome"
                    valor={nomeExibicao}
                    icone={<UserRound className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="E-mail"
                    valor={emailExibicao}
                    icone={<Mail className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="Perfil"
                    valor={perfilExibicao}
                    icone={<BadgeCheck className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="UUID de autenticação"
                    valor={dadosPerfil?.user_id || user?.id || 'Não informado'}
                    icone={<IdCard className="h-3.5 w-3.5" />}
                  />
                </div>
              </section>

              {/* Identificação */}
              <section className="space-y-3">
                <SecaoHeader
                  titulo="Identificação"
                  icone={<Hash className="h-3 w-3" />}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <CampoInfo
                    rotulo="Login"
                    valor={dadosPerfil?.login || emailExibicao.split('@')[0] || 'Não informado'}
                    icone={<IdCard className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="Matrícula"
                    valor={dadosPerfil?.matricula || 'Não informado'}
                    icone={<Hash className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="ID do Usuário"
                    valor={formatarNumeroPtBr(dadosPerfil?.usuario_id)}
                    icone={<Hash className="h-3.5 w-3.5" />}
                  />
                </div>
              </section>

              {/* Contato */}
              <section className="space-y-3">
                <SecaoHeader
                  titulo="Contato"
                  icone={<Phone className="h-3 w-3" />}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <CampoInfo
                    rotulo="Ramal"
                    valor={dadosPerfil?.ramal || 'Não informado'}
                    icone={<Phone className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="WhatsApp / Telefone"
                    valor={dadosPerfil?.whatsapp || dadosAuth.phone || 'Não informado'}
                    icone={<Phone className="h-3.5 w-3.5" />}
                  />
                </div>
              </section>

              {/* Rastreabilidade */}
              <section className="space-y-3">
                <SecaoHeader
                  titulo="Rastreabilidade"
                  icone={<Clock3 className="h-3 w-3" />}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <CampoInfo
                    rotulo="Criado em"
                    valor={formatarDataHoraPtBr(dadosPerfil?.created_at || dadosAuth.created_at)}
                    icone={<Clock3 className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="Atualizado em"
                    valor={formatarDataHoraPtBr(dadosPerfil?.updated_at)}
                    icone={<Clock3 className="h-3.5 w-3.5" />}
                  />
                  <CampoInfo
                    rotulo="Último acesso"
                    valor={formatarDataHoraPtBr(dadosAuth.last_sign_in_at)}
                    icone={<Clock3 className="h-3.5 w-3.5" />}
                  />
                </div>
              </section>

              {/* Mensagem de erro */}
              {erroCarregamento && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800 dark:bg-amber-950/50">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">{erroCarregamento}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <DialogFooter className="border-t border-border/50 bg-muted/30 px-8 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
