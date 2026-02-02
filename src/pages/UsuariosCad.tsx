/**
 * Página de Cadastro/Edição de Usuário
 * Formulário completo para criar ou editar usuários
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AppHeader } from '@/components/layout/AppHeader'
import { useUsuarios } from '@/hooks/useUsuarios'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  UsuarioCreateData,
  USUARIO_CREATE_INITIAL_VALUES,
  isStrongPassword,
  passwordsMatch
} from '@/types/usuario'
import { toast } from '@/hooks/use-toast'
import { gerarTimestampLocal } from '@/utils/datahora.utils'
import {
  ArrowLeft,
  Save,
  Trash2,
  User,
  Mail,
  Lock,
  Shield,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ChevronDown
} from 'lucide-react'

interface AppOption {
  app_id: number
  app_nome: string
}

interface PerfilOption {
  perfil_id: number
  perfil: string
  observacao: string | null
}

interface PerfilRaw extends PerfilOption {
  app_id: number | null
}

interface UsuarioAppRegistro {
  app_id: number
  perfil_id: number | null
}

const normalizarTexto = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export default function UsuariosCad() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    loading,
    fetchUsuario,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    checkLoginExists,
    checkUsuarioIdExists
  } = useUsuarios()
  const { user: authUser } = useAuth()

  const isEdicao = Boolean(id && id !== 'novo')

  // Estado do formulário
  const [formData, setFormData] = useState<UsuarioCreateData>(USUARIO_CREATE_INITIAL_VALUES)

  // Estado das aplicações disponíveis
  const [apps, setApps] = useState<AppOption[]>([])
  const [carregandoApps, setCarregandoApps] = useState(false)
  const [erroApps, setErroApps] = useState<string | null>(null)

  // Estado dos perfis disponíveis
  const [perfis, setPerfis] = useState<PerfilOption[]>([])
  const [carregandoPerfis, setCarregandoPerfis] = useState(false)
  const [erroPerfis, setErroPerfis] = useState<string | null>(null)

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const campoBuscaAplicacaoRef = useRef<HTMLInputElement | null>(null)
  const [menuAplicacaoAberto, setMenuAplicacaoAberto] = useState(false)
  const [buscaAplicacao, setBuscaAplicacao] = useState('')
  const [appIdsSelecionadas, setAppIdsSelecionadas] = useState<string[]>([])

  // Validação assíncrona de login
  const [loginValidation, setLoginValidation] = useState<{ checking: boolean; exists: boolean; error?: string }>({
    checking: false,
    exists: false
  })

  // Validação assíncrona de usuário ID (Código SICFAR)
  const [usuarioIdValidation, setUsuarioIdValidation] = useState<{ checking: boolean; exists: boolean; error?: string }>({
    checking: false,
    exists: false
  })

  // Validação de senha em tempo real
  const passwordValidation = isStrongPassword(formData.senha ?? '')
  const passwordsMatchResult = passwordsMatch(formData.senha ?? '', formData.confirmarSenha ?? '')
  const perfilSelecionado = perfis.find((perfil) => perfil.perfil_id === formData.perfilId)
  const appSelecionada = apps.find((app) => app.app_id === formData.appId)
  const appsFiltradas = useMemo(() => {
    const termo = normalizarTexto(buscaAplicacao.trim())
    if (!termo) {
      return apps
    }

    return apps.filter((app) => {
      const textoApp = normalizarTexto(`${app.app_nome ?? ''} ${app.app_id}`)
      return textoApp.includes(termo)
    })
  }, [apps, buscaAplicacao])

  const resumoAppsSelecionadas = useMemo(() => {
    if (carregandoApps) {
      return 'Carregando aplicações...'
    }

    if (apps.length === 0) {
      return 'Nenhuma aplicação disponível'
    }

    if (appIdsSelecionadas.length === 0) {
      return 'Selecione aplicações'
    }

    if (appIdsSelecionadas.length === 1) {
      const appIdSelecionada = appIdsSelecionadas[0]
      const appEncontrada = apps.find((app) => String(app.app_id) === appIdSelecionada)
      return appEncontrada?.app_nome || `Aplicação ${appIdSelecionada}`
    }

    return `${appIdsSelecionadas.length} aplicações selecionadas`
  }, [appIdsSelecionadas, apps, carregandoApps])

  const alternarAppSelecionada = useCallback((appId: string) => {
    setAppIdsSelecionadas((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId)
      }

      return [...prev, appId]
    })
  }, [formData.perfilId])

  const obterUserIdAutenticado = useCallback(async (): Promise<string | null> => {
    if (authUser?.id) {
      return authUser.id
    }

    const { data } = await supabase.auth.getSession()
    return data?.session?.user?.id ?? null
  }, [authUser?.id])

  const obterAppIdsSelecionadas = useCallback((): number[] => {
    const idsBase = appIdsSelecionadas.length > 0
      ? appIdsSelecionadas
      : (!isEdicao && formData.appId ? [String(formData.appId)] : [])

    const idsNumericos = idsBase
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isFinite(id) && id > 0)

    return Array.from(new Set(idsNumericos))
  }, [appIdsSelecionadas, formData.appId, isEdicao])

  const carregarAppsUsuario = useCallback(async (usuarioId: number) => {
    if (!Number.isFinite(usuarioId)) {
      return
    }

    try {
      const { data, error } = await supabase
        .from('tbusuario_app')
        .select('app_id')
        .eq('usuario_id', usuarioId)
        .eq('deletado', 'N')
        .order('app_id', { ascending: true })

      if (error) {
        throw error
      }

      const idsSelecionados = (data || [])
        .map((registro) => String(registro.app_id))
        .filter((id) => id)

      setAppIdsSelecionadas(idsSelecionados)
    } catch (error) {
      console.error('Erro ao carregar aplicações do usuário:', error)
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar aplicações do usuário',
        description: 'Não foi possível carregar as aplicações vinculadas.',
      })
    }
  }, [formData.perfilId])

  const persistirAplicacoesUsuario = useCallback(async (usuarioId: number): Promise<boolean> => {
    try {
      const appIdsSelecionadasNormalizadas = obterAppIdsSelecionadas()

      if (!isEdicao && appIdsSelecionadasNormalizadas.length === 0) {
        return true
      }

      if (!formData.perfilId) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O perfil é obrigatório para vincular aplicações.',
        })
        return false
      }

      const userIdAutenticado = await obterUserIdAutenticado()
      if (!userIdAutenticado) {
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Não foi possível identificar o usuário autenticado.',
        })
        return false
      }

      const nomePerfilSelecionado = (formData.perfil ?? '').trim()
      if (!nomePerfilSelecionado) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Selecione um perfil válido para vincular aplicações.',
        })
        return false
      }

      const isErroPermissao = (erro: { code?: string; message?: string } | null | undefined): boolean => {
        if (!erro) return false
        const mensagem = (erro.message ?? '').toLowerCase()
        return erro.code === '42501'
          || mensagem.includes('apenas administradores')
          || mensagem.includes('row-level security')
          || mensagem.includes('permission')
      }

      const isFuncaoNaoEncontrada = (erro: { code?: string; message?: string } | null | undefined): boolean => {
        if (!erro) return false
        const mensagem = (erro.message ?? '').toLowerCase()
        return erro.code === 'PGRST202'
          || mensagem.includes('schema cache')
          || mensagem.includes('could not find the function')
          || mensagem.includes('not found')
      }

      const isFuncaoIncompativel = (erro: { code?: string; message?: string } | null | undefined): boolean => {
        if (!erro) return false
        const mensagem = (erro.message ?? '').toLowerCase()
        return erro.code === '42703' && mensagem.includes('updated_by')
      }

      const atualizarUsuarioApp = async (
        payloadBase: Record<string, unknown>,
        filtros: Record<string, number | number[] | string>
      ) => {
        const executar = async (payload: Record<string, unknown>) => {
          let query = supabase
            .from('tbusuario_app')
            .update(payload)

          Object.entries(filtros).forEach(([coluna, valor]) => {
            if (Array.isArray(valor)) {
              query = query.in(coluna, valor)
            } else {
              query = query.eq(coluna, valor)
            }
          })

          const { error } = await query
          return error
        }

        let erroAtualizacao = await executar({
          ...payloadBase,
          update_by: userIdAutenticado
        })

        if (!erroAtualizacao) {
          return null
        }

        const mensagem = (erroAtualizacao.message ?? '').toLowerCase()
        if (erroAtualizacao.code === '42703' && mensagem.includes('update_by')) {
          erroAtualizacao = await executar({
            ...payloadBase,
            updated_by: userIdAutenticado
          })
        }

        return erroAtualizacao
      }

      const obterPerfilPorAplicacao = async () => {
        if (appIdsSelecionadasNormalizadas.length === 0) {
          return new Map<number, number>()
        }

        const { data: perfisEncontrados, error: perfisError } = await supabase
          .from('tbperfil')
          .select('perfil_id, perfil, app_id')
          .in('app_id', appIdsSelecionadasNormalizadas)
          .eq('deletado', 'N')
          .or(`perfil_id.eq.${formData.perfilId},perfil.eq.${nomePerfilSelecionado}`)

        if (perfisError) {
          if (isErroPermissao(perfisError)) {
            toast({
              variant: 'destructive',
              title: 'Permissão insuficiente',
              description: 'Apenas administradores podem vincular aplicações.',
            })
            return null
          }
          throw perfisError
        }

        const perfisPorApp = new Map<number, number>()
        const perfisPorAppNome = new Map<number, number>()

        ;(perfisEncontrados || []).forEach((perfil) => {
          if (!perfil?.app_id || !perfil?.perfil_id) return
          if (perfil.perfil_id === formData.perfilId) {
            perfisPorApp.set(perfil.app_id, perfil.perfil_id)
          }
          if ((perfil.perfil ?? '').trim().toLowerCase() === nomePerfilSelecionado.toLowerCase()) {
            perfisPorAppNome.set(perfil.app_id, perfil.perfil_id)
          }
        })

        appIdsSelecionadasNormalizadas.forEach((appId) => {
          if (!perfisPorApp.has(appId) && perfisPorAppNome.has(appId)) {
            perfisPorApp.set(appId, perfisPorAppNome.get(appId) as number)
          }
        })

        return perfisPorApp
      }

      const perfisPorAplicacao = await obterPerfilPorAplicacao()
      if (!perfisPorAplicacao) {
        return false
      }

      const appsSemPerfil = appIdsSelecionadasNormalizadas
        .filter((appId) => !perfisPorAplicacao.has(appId))

      if (appsSemPerfil.length > 0) {
        const nomesApps = appsSemPerfil
          .map((appId) => apps.find((app) => app.app_id === appId)?.app_nome ?? `App ${appId}`)
        toast({
          variant: 'destructive',
          title: 'Perfil incompatível',
          description: `O perfil "${nomePerfilSelecionado}" não existe para: ${nomesApps.join(', ')}.`,
        })
        return false
      }

      let appsAtuais: UsuarioAppRegistro[] = []
      let appsAtuaisIds: number[] = []
      if (isEdicao) {
        const { data: appsAtuaisData, error } = await supabase
          .from('tbusuario_app')
          .select('app_id, perfil_id')
          .eq('usuario_id', usuarioId)
          .eq('deletado', 'N')

        if (error) {
          if (isErroPermissao(error as { code?: string; message?: string })) {
            toast({
              variant: 'destructive',
              title: 'Permissão insuficiente',
              description: 'Apenas administradores podem vincular aplicações.',
            })
            return false
          }
          throw error
        }

        appsAtuais = (appsAtuaisData || []) as UsuarioAppRegistro[]
        appsAtuaisIds = appsAtuais
          .map((registro) => registro.app_id)
          .filter((id) => Number.isFinite(id))
      }

      const appsSelecionadasSet = new Set(appIdsSelecionadasNormalizadas)
      const appsParaAdicionar = appIdsSelecionadasNormalizadas
        .filter((appId) => !appsAtuaisIds.includes(appId))
      const appsParaAtualizar = appsAtuais
        .filter((registro) => appsSelecionadasSet.has(registro.app_id))
        .filter((registro) => registro.perfil_id !== (perfisPorAplicacao.get(registro.app_id) ?? formData.perfilId))
        .map((registro) => registro.app_id)
      const appsParaRevogar = appsAtuaisIds
        .filter((appId) => !appsSelecionadasSet.has(appId))

      const timestampAtual = gerarTimestampLocal()

      if (appsParaAtualizar.length > 0) {
        const resultadosAtualizacao = await Promise.all(appsParaAtualizar.map(async (appId) => {
          const perfilIdParaApp = perfisPorAplicacao.get(appId)
          if (!perfilIdParaApp) {
            return { appId, error: new Error('Perfil não encontrado para aplicação') }
          }

          const error = await atualizarUsuarioApp({
            perfil_id: perfilIdParaApp,
            updated_at: timestampAtual
          }, {
            usuario_id: usuarioId,
            app_id: appId,
            deletado: 'N'
          })
          return { appId, error }
        }))

        const erroAtualizacao = resultadosAtualizacao.find((resultado) => resultado.error)
        if (erroAtualizacao?.error) {
          const erro = erroAtualizacao.error as { code?: string; message?: string }
          if (isErroPermissao(erro)) {
            toast({
              variant: 'destructive',
              title: 'Permissão insuficiente',
              description: 'Apenas administradores podem vincular aplicações.',
            })
            return false
          }
          throw erroAtualizacao.error
        }
      }

      if (appsParaAdicionar.length > 0) {
        let deveUsarRpc = true
        const resultados = await Promise.all(appsParaAdicionar.map(async (appId) => {
          const perfilIdParaApp = perfisPorAplicacao.get(appId)
          if (!perfilIdParaApp) {
            return { code: 'P0001', message: 'Perfil não encontrado para aplicação' }
          }
          const { error } = await supabase.rpc('grant_app_access', {
            p_usuario_id: usuarioId,
            p_app_id: appId,
            p_perfil_id: perfilIdParaApp
          })
          return error
        }))

        const erroAdicionar = resultados.find((erro) => erro)
        if (erroAdicionar) {
          if (isFuncaoNaoEncontrada(erroAdicionar)) {
            deveUsarRpc = false
          } else if (isFuncaoIncompativel(erroAdicionar)) {
            deveUsarRpc = false
          } else if (isErroPermissao(erroAdicionar)) {
            toast({
              variant: 'destructive',
              title: 'Permissão insuficiente',
              description: 'Apenas administradores podem vincular aplicações.',
            })
            return false
          } else {
            throw erroAdicionar
          }
        }

        if (!deveUsarRpc) {
          const registrosNovos = appsParaAdicionar.map((appId) => ({
            usuario_id: usuarioId,
            app_id: appId,
            perfil_id: perfisPorAplicacao.get(appId),
            created_at: timestampAtual,
            created_by: userIdAutenticado,
            deletado: 'N'
          })).filter((registro) => Number.isFinite(registro.perfil_id))

          const { error: insertError } = await supabase
            .from('tbusuario_app')
            .insert(registrosNovos)

          if (insertError) {
            if (isErroPermissao(insertError)) {
              toast({
                variant: 'destructive',
                title: 'Permissão insuficiente',
                description: 'Apenas administradores podem vincular aplicações.',
              })
              return false
            }
            throw insertError
          }
        }
      }

      if (appsParaRevogar.length > 0) {
        let deveUsarRpc = true
        const resultados = await Promise.all(appsParaRevogar.map(async (appId) => {
          const { error } = await supabase.rpc('revoke_app_access', {
            p_usuario_id: usuarioId,
            p_app_id: appId
          })
          return error
        }))

        const erroRevogar = resultados.find((erro) => erro)
        if (erroRevogar) {
          if (isFuncaoNaoEncontrada(erroRevogar)) {
            deveUsarRpc = false
          } else if (isFuncaoIncompativel(erroRevogar)) {
            deveUsarRpc = false
          } else if (isErroPermissao(erroRevogar)) {
            toast({
              variant: 'destructive',
              title: 'Permissão insuficiente',
              description: 'Apenas administradores podem vincular aplicações.',
            })
            return false
          } else {
            throw erroRevogar
          }
        }

        if (!deveUsarRpc) {
          const revokeError = await atualizarUsuarioApp({
            deletado: 'S',
            deleted_at: timestampAtual,
            updated_at: timestampAtual
          }, {
            usuario_id: usuarioId,
            app_id: appsParaRevogar,
            deletado: 'N'
          })

          if (revokeError) {
            if (isErroPermissao(revokeError)) {
              toast({
                variant: 'destructive',
                title: 'Permissão insuficiente',
                description: 'Apenas administradores podem vincular aplicações.',
              })
              return false
            }
            throw revokeError
          }
        }
      }

      return true
    } catch (error) {
      console.error('Erro ao persistir aplicações do usuário:', error)
      const mensagemErro = (error as { message?: string })?.message ?? ''
      const codigoErro = (error as { code?: string })?.code ?? ''
      const mensagemNormalizada = mensagemErro.toLowerCase()
      const erroPermissao = codigoErro === '42501'
        || mensagemNormalizada.includes('apenas administradores')
        || mensagemNormalizada.includes('row-level security')
        || mensagemNormalizada.includes('permission')
      if (erroPermissao) {
        toast({
          variant: 'destructive',
          title: 'Permissão insuficiente',
          description: 'Apenas administradores podem vincular aplicações.',
        })
        return false
      }
      if (codigoErro === 'PGRST202' || mensagemNormalizada.includes('schema cache')) {
        toast({
          variant: 'destructive',
          title: 'Função não encontrada',
          description: 'As funções grant_app_access/revoke_app_access não estão publicadas no Supabase.',
        })
        return false
      }
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar aplicações',
        description: 'Não foi possível vincular as aplicações selecionadas.',
      })
      return false
    }
  }, [apps, formData.perfil, formData.perfilId, isEdicao, obterAppIdsSelecionadas, obterUserIdAutenticado])

  const loadData = useCallback(async () => {
    try {
      // O email é buscado via RPC get_email_by_username no Supabase dentro de fetchUsuario (fallback)
      const data = await fetchUsuario(id!)
      setFormData({
        ...data,
        login: data.login ?? '',
        email: data.email ?? '',
        usuario: data.usuario ?? '',
        perfil: data.perfil ?? '',
        matricula: data.matricula ?? '',
        senha: '',
        confirmarSenha: ''
      })

      const usuarioIdCarregado = parseInt(data.id ?? '', 10)
      if (Number.isFinite(usuarioIdCarregado)) {
        await carregarAppsUsuario(usuarioIdCarregado)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      navigate('/usuarios')
    }
  }, [fetchUsuario, id, navigate, carregarAppsUsuario])

  const carregarApps = useCallback(async () => {
    try {
      setCarregandoApps(true)
      setErroApps(null)

      const { data, error } = await supabase
        .from('tbapp')
        .select('app_id, app_nome')
        .eq('deletado', 'N')
        .order('app_nome', { ascending: true })

      if (error) {
        throw error
      }

      setApps((data || []) as AppOption[])
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error)
      setErroApps('Não foi possível carregar as aplicações.')
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar aplicações',
        description: 'Verifique a conexão e tente novamente.',
      })
    } finally {
      setCarregandoApps(false)
    }
  }, [])

  const carregarPerfis = useCallback(async (appIdsFiltro?: number[]) => {
    try {
      setCarregandoPerfis(true)
      setErroPerfis(null)

      const appIdsSelecionados = (appIdsFiltro || [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0)

      if (appIdsSelecionados.length === 0) {
        setPerfis([])
        setErroPerfis('Selecione uma aplicação para carregar os perfis.')
        return
      }

      const { data, error } = await supabase
        .from('tbperfil')
        .select('perfil_id, perfil, observacao, app_id')
        .in('app_id', appIdsSelecionados)
        .eq('deletado', 'N')
        .order('perfil', { ascending: true })

      if (error) {
        throw error
      }

      const perfisRaw = (data || []) as PerfilRaw[]

      if (appIdsSelecionados.length <= 1) {
        setPerfis(perfisRaw.map(({ app_id: _appId, ...perfil }) => perfil))
        return
      }

      const appIdsSet = new Set(appIdsSelecionados)
      const perfilIdAtual = formData.perfilId
      const gruposPorNome = new Map<string, { appIds: Set<number>; candidatos: PerfilRaw[] }>()

      perfisRaw.forEach((perfil) => {
        if (!perfil.perfil) {
          return
        }
        if (!perfil.app_id || !appIdsSet.has(perfil.app_id)) {
          return
        }
        const chave = perfil.perfil.trim().toLowerCase()
        if (!chave) return

        if (!gruposPorNome.has(chave)) {
          gruposPorNome.set(chave, { appIds: new Set<number>(), candidatos: [] })
        }

        const grupo = gruposPorNome.get(chave)!
        grupo.appIds.add(perfil.app_id)
        grupo.candidatos.push(perfil)
      })

      const perfisCompatíveis: PerfilOption[] = []
      gruposPorNome.forEach((grupo) => {
        if (grupo.appIds.size !== appIdsSet.size) {
          return
        }

        const candidatoAtual = perfilIdAtual
          ? grupo.candidatos.find((perfil) => perfil.perfil_id === perfilIdAtual)
          : undefined
        const candidatoSelecionado = candidatoAtual ?? grupo.candidatos[0]

        if (candidatoSelecionado) {
          const { app_id: _appId, ...perfilLimpo } = candidatoSelecionado
          perfisCompatíveis.push(perfilLimpo)
        }
      })

      perfisCompatíveis.sort((a, b) => a.perfil.localeCompare(b.perfil))
      setPerfis(perfisCompatíveis)
    } catch (error) {
      console.error('Erro ao carregar perfis:', error)
      setErroPerfis('Não foi possível carregar os perfis.')
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfis',
        description: 'Verifique a conexão e tente novamente.',
      })
    } finally {
      setCarregandoPerfis(false)
    }
  }, [formData.perfilId])

  // Carregar dados ao montar (modo edição)
  useEffect(() => {
    if (isEdicao) {
      loadData()
    }
  }, [isEdicao, loadData])

  useEffect(() => {
    carregarApps()
  }, [carregarApps])

  useEffect(() => {
    const appIdsFiltro = appIdsSelecionadas.length > 0
      ? appIdsSelecionadas.map((id) => parseInt(id, 10)).filter((id) => Number.isFinite(id))
      : (formData.appId ? [formData.appId] : [])

    carregarPerfis(appIdsFiltro)
  }, [appIdsSelecionadas, carregarPerfis, formData.appId])

  useEffect(() => {
    if (!formData.perfil && formData.perfilId && perfis.length > 0) {
      const perfilEncontrado = perfis.find((perfil) => perfil.perfil_id === formData.perfilId)
      if (perfilEncontrado) {
        setFormData((prev) => ({
          ...prev,
          perfil: perfilEncontrado.perfil
        }))
      }
    }
  }, [formData.perfil, formData.perfilId, perfis])

  useEffect(() => {
    if (!formData.perfilId || perfis.length === 0) {
      return
    }

    const perfilValido = perfis.some((perfil) => perfil.perfil_id === formData.perfilId)
    if (!perfilValido) {
      setFormData((prev) => ({
        ...prev,
        perfilId: undefined,
        perfil: ''
      }))
    }
  }, [formData.perfilId, perfis])

  useEffect(() => {
    if (!isEdicao) {
      return
    }
    if (appIdsSelecionadas.length > 0 || !formData.appId) {
      return
    }
    setAppIdsSelecionadas([String(formData.appId)])
  }, [appIdsSelecionadas.length, formData.appId, isEdicao])

  useEffect(() => {
    if (menuAplicacaoAberto) {
      campoBuscaAplicacaoRef.current?.focus()
    }
  }, [menuAplicacaoAberto])

  useEffect(() => {
    if (!menuAplicacaoAberto && buscaAplicacao) {
      setBuscaAplicacao('')
    }
  }, [buscaAplicacao, menuAplicacaoAberto])

  // Validação assíncrona de login
  useEffect(() => {
    const loginParaValidar = formData.login.trim()
    if (!loginParaValidar || loginParaValidar.length < 3) {
      setLoginValidation({ checking: false, exists: false, error: undefined })
      return
    }

    let ativo = true
    const timeoutId = setTimeout(async () => {
      setLoginValidation({ checking: true, exists: false, error: undefined })
      const resultado = await checkLoginExists(loginParaValidar, isEdicao ? formData.id : undefined)
      if (!ativo) return
      setLoginValidation({ checking: false, exists: resultado.exists, error: resultado.error })
    }, 500)

    return () => {
      ativo = false
      clearTimeout(timeoutId)
    }
  }, [formData.login, formData.id, checkLoginExists, isEdicao])

  // Validação assíncrona de usuário ID (Código SICFAR)
  useEffect(() => {
    if (isEdicao) {
      setUsuarioIdValidation({ checking: false, exists: false, error: undefined })
      return
    }

    const usuarioIdParaValidar = (formData.id ?? '').trim()
    if (!usuarioIdParaValidar) {
      setUsuarioIdValidation({ checking: false, exists: false, error: undefined })
      return
    }

    let ativo = true
    const timeoutId = setTimeout(async () => {
      setUsuarioIdValidation({ checking: true, exists: false, error: undefined })
      const resultado = await checkUsuarioIdExists(parseInt(usuarioIdParaValidar, 10))
      if (!ativo) return
      setUsuarioIdValidation({ checking: false, exists: resultado.exists, error: resultado.error })
    }, 500)

    return () => {
      ativo = false
      clearTimeout(timeoutId)
    }
  }, [formData.id, checkUsuarioIdExists, isEdicao])

  const handleSave = async () => {
    try {
      // Validações de campos obrigatórios
      if (!formData.login.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O login é obrigatório',
        })
        return
      }

      if (!formData.usuario.trim()) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O nome do usuário é obrigatório',
        })
        return
      }

      if (!formData.perfilId) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'O perfil é obrigatório',
        })
        return
      }

      // Validações específicas para criação
      if (!isEdicao) {
        if (!formData.email.trim()) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'O email é obrigatório para criar um novo usuário',
          })
          return
        }

        if (!formData.senha) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'A senha é obrigatória para criar um novo usuário',
          })
          return
        }

        if (!passwordValidation.valid) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: `Senha inválida: ${passwordValidation.errors.join(', ')}`,
          })
          return
        }

        if (!passwordsMatchResult) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'As senhas não conferem',
          })
          return
        }

      }

      // Validação de login duplicado
      if (loginValidation.checking) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Aguarde a verificação do login',
        })
        return
      }

      if (loginValidation.error) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Não foi possível validar o login. Verifique a conexão e tente novamente.',
        })
        return
      }

      if (loginValidation.exists) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Este login já está em uso',
        })
        return
      }

      const usuarioIdInformado = (formData.id ?? '').trim()
      if (usuarioIdInformado) {
        if (usuarioIdValidation.checking) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'Aguarde a verificação do Usuário ID',
          })
          return
        }

        if (usuarioIdValidation.error) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'Não foi possível validar o Usuário ID. Verifique a conexão e tente novamente.',
          })
          return
        }

        if (usuarioIdValidation.exists) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'Este Usuário ID já está em uso',
          })
          return
        }
      }

      const dadosNormalizadosBase = {
        ...formData,
        login: formData.login.trim(),
        usuario: formData.usuario.trim()
      }

      const dadosNormalizados = isEdicao
        ? dadosNormalizadosBase
        : {
          ...dadosNormalizadosBase,
          email: (formData.email ?? '').trim().toLowerCase()
        }

      // Salvar
      let usuarioIdSalvo: number | null = null

      if (isEdicao) {
        await updateUsuario(dadosNormalizados)
        const usuarioIdAtual = parseInt((formData.id ?? id ?? '').toString(), 10)
        usuarioIdSalvo = Number.isFinite(usuarioIdAtual) ? usuarioIdAtual : null
      } else {
        const resultadoCriacao = await createUsuario({
          ...dadosNormalizados,
          createdAt: (dadosNormalizados.createdAt || '').trim() || gerarTimestampLocal()
        })
        usuarioIdSalvo = resultadoCriacao.usuario_id
          ?? (formData.id ? parseInt(formData.id, 10) : null)
      }

      if (!usuarioIdSalvo || !Number.isFinite(usuarioIdSalvo)) {
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: 'Não foi possível identificar o usuário para vincular aplicações.',
        })
        return
      }

      const appsPersistidas = await persistirAplicacoesUsuario(usuarioIdSalvo)
      if (!appsPersistidas) {
        return
      }

      navigate('/usuarios', { state: { shouldRefresh: true } })
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
    }
  }

  const handleDelete = async () => {
    try {
      if (isEdicao) {
        await deleteUsuario(id!)
        navigate('/usuarios', { state: { shouldRefresh: true } })
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    }
  }

  const handleVoltar = () => {
    navigate('/usuarios')
  }

  return (
    <>
      {/* Header da aplicação */}
      <AppHeader
        title="SICFAR OEE - Gerenciamento de Usuários"
        userName="Usuário"
        userRole="Administrador"
      />

      {/* Container principal */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-7xl">
        <div className="flex flex-col gap-4">
          {/* Cabeçalho responsivo: empilha no mobile e distribui no desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#1f2937]">
                {isEdicao ? 'Editar Usuário' : 'Novo Usuário'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEdicao ? `Editando usuário #${id}` : 'Cadastrar novo usuário do sistema'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-white !text-brand-primary !border-brand-primary hover:!bg-gray-50 hover:!border-brand-primary hover:!text-brand-primary min-h-10 px-4"
                onClick={handleVoltar}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              {isEdicao && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 min-h-10 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              )}
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 !bg-brand-primary !text-white !border-brand-primary hover:!bg-brand-primary/90 hover:!border-brand-primary/90 hover:!text-white min-h-10 px-4"
                onClick={handleSave}
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          {/* Formulário */}
          <div className="flex flex-col gap-4">
            {/* Dados do Usuário */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Dados do Usuário
                    </h2>
                    <p className="text-sm text-gray-500">
                      Informações de identificação do usuário
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {/* Usuário ID (Código SICFAR) */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="usuarioId">Código SICFAR</Label>
                    <Input
                      id="usuarioId"
                      value={formData.id ?? ''}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, id: valor })
                      }}
                      placeholder="Ex: 1001"
                      inputMode="numeric"
                      maxLength={10}
                      disabled={isEdicao}
                      readOnly={isEdicao}
                    />
                    {!isEdicao && usuarioIdValidation.checking && (
                      <p className="text-sm text-gray-500">Verificando disponibilidade...</p>
                    )}
                    {!isEdicao && usuarioIdValidation.exists && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Este Usuário ID já está em uso
                      </p>
                    )}
                    {!isEdicao && usuarioIdValidation.error && (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Não foi possível validar o Usuário ID
                      </p>
                    )}
                    {!isEdicao && formData.id && !usuarioIdValidation.checking && !usuarioIdValidation.exists && !usuarioIdValidation.error && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Usuário ID disponível
                      </p>
                    )}
                  </div>

                  {/* Matrícula do Funcionário */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      value={formData.matricula ?? ''}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      placeholder="Ex: 12345"
                      maxLength={20}
                    />
                  </div>

                  {/* Login */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="login">
                      Login <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="login"
                        value={formData.login ?? ''}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        placeholder="Ex: joao.silva"
                        className="pl-10"
                        maxLength={50}
                      />
                    </div>
                    {loginValidation.checking && (
                      <p className="text-sm text-gray-500">Verificando disponibilidade...</p>
                    )}
                    {loginValidation.exists && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Este login já está em uso
                      </p>
                    )}
                    {loginValidation.error && (
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Não foi possível validar o login
                      </p>
                    )}
                    {formData.login && formData.login.length >= 3 && !loginValidation.checking && !loginValidation.exists && !loginValidation.error && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Login disponível
                      </p>
                    )}
                  </div>

                  {/* Nome do Usuário */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="usuario">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="usuario"
                      value={formData.usuario ?? ''}
                      onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                      placeholder="Ex: João da Silva"
                      maxLength={100}
                    />
                  </div>

                  {/* Email (apenas visualização em edição) */}
                  {isEdicao && (
                    <>
                      <div className="space-y-2 md:col-span-4">
                        <Label htmlFor="email-readonly">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="email-readonly"
                            type="email"
                            value={formData.email ?? ''}
                            readOnly
                            disabled
                            className="pl-10 bg-gray-100"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          O email não pode ser alterado após a criação do usuário.
                        </p>
                      </div>

                      {/* Aplicação */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="aplicacao-edicao">Aplicação</Label>
                        <DropdownMenu open={menuAplicacaoAberto} onOpenChange={setMenuAplicacaoAberto}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              id="aplicacao-edicao"
                              variant="outline"
                              className="w-full justify-between font-normal bg-white hover:bg-white"
                              disabled={carregandoApps}
                            >
                              <span className="truncate">{resumoAppsSelecionadas}</span>
                              <ChevronDown className="h-4 w-4 opacity-60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[var(--radix-dropdown-menu-trigger-width)]"
                          >
                            <div className="p-2">
                              <Input
                                ref={campoBuscaAplicacaoRef}
                                placeholder="Buscar aplicação"
                                value={buscaAplicacao}
                                onChange={(event) => setBuscaAplicacao(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key !== 'Escape') {
                                    event.stopPropagation()
                                  }
                                }}
                              />
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              checked={apps.length > 0 && appIdsSelecionadas.length === apps.length}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAppIdsSelecionadas(apps.map((app) => String(app.app_id)))
                                } else {
                                  setAppIdsSelecionadas([])
                                }
                              }}
                              onSelect={(event) => event.preventDefault()}
                            >
                              Todas as aplicações
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <div className="max-h-64 overflow-y-auto">
                              {appsFiltradas.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                  Nenhuma aplicação encontrada.
                                </div>
                              ) : (
                                appsFiltradas.map((app) => {
                                  const appId = String(app.app_id)
                                  return (
                                    <DropdownMenuCheckboxItem
                                      key={app.app_id}
                                      checked={appIdsSelecionadas.includes(appId)}
                                      onCheckedChange={() => alternarAppSelecionada(appId)}
                                      onSelect={(event) => event.preventDefault()}
                                    >
                                      {app.app_nome}
                                    </DropdownMenuCheckboxItem>
                                  )
                                })
                              )}
                            </div>
                            <DropdownMenuSeparator />
                            <div className="p-2">
                              <Button
                                type="button"
                                variant="secondary"
                                className="w-full"
                                onClick={() => setMenuAplicacaoAberto(false)}
                              >
                                Fechar
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {erroApps && (
                          <p className="text-xs text-red-500">
                            {erroApps}
                          </p>
                        )}
                        {!carregandoApps && !erroApps && apps.length === 0 && (
                          <p className="text-xs text-amber-600">
                            Nenhuma aplicação disponível para este usuário.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Credenciais de Acesso - apenas em modo criação */}
            {!isEdicao && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Credenciais de Acesso
                      </h2>
                      <p className="text-sm text-gray-500">
                        Defina o email e senha para acesso ao sistema
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-4 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email ?? ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="usuario@empresa.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Aplicação */}
                    <div className="space-y-2">
                      <Label htmlFor="aplicacao">Aplicação</Label>
                      <Select
                        value={formData.appId?.toString() || ''}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          appId: value ? parseInt(value, 10) : undefined
                        })}
                        disabled={carregandoApps}
                      >
                        <SelectTrigger id="aplicacao">
                          <SelectValue placeholder={carregandoApps ? 'Carregando aplicações...' : 'Selecione a aplicação'}>
                            {appSelecionada?.app_nome}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {apps.map((app) => (
                            <SelectItem key={app.app_id} value={app.app_id.toString()}>
                              {app.app_nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {erroApps && (
                        <p className="text-xs text-red-500">
                          {erroApps}
                        </p>
                      )}
                      {!carregandoApps && !erroApps && apps.length === 0 && (
                        <p className="text-xs text-amber-600">
                          Nenhuma aplicação disponível para este usuário.
                        </p>
                      )}
                    </div>

                    {/* Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="senha">
                        Senha <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="senha"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.senha ?? ''}
                          onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                          placeholder="Senha forte"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.senha && (
                        <div className="space-y-1">
                          {passwordValidation.errors.map((error, index) => (
                            <p key={index} className="text-sm text-red-500 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              {error}
                            </p>
                          ))}
                          {passwordValidation.valid && (
                            <p className="text-sm text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Senha forte
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">
                        Confirmar Senha <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirmarSenha"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmarSenha ?? ''}
                          onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                          placeholder="Repita a senha"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmarSenha && (
                        <p className={`text-sm flex items-center gap-1 ${passwordsMatchResult ? 'text-green-600' : 'text-red-500'}`}>
                          {passwordsMatchResult ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Senhas conferem
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              As senhas não conferem
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informação sobre requisitos de senha */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md mt-4">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Requisitos de senha:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>Mínimo de 6 caracteres</li>
                        <li>Pelo menos uma letra maiúscula</li>
                        <li>Pelo menos uma letra minúscula</li>
                        <li>Pelo menos um número</li>
                        <li>Pelo menos um caractere especial</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Perfil e Vinculação */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-6">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Perfil e Permissões
                    </h2>
                    <p className="text-sm text-gray-500">
                      Defina o nível de acesso do usuário
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Perfil */}
                  <div className="space-y-2">
                    <Label htmlFor="perfil">
                      Perfil <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.perfilId?.toString() || ''}
                      onValueChange={(value) => {
                        const perfilSelecionadoAtual = perfis.find((perfil) => perfil.perfil_id.toString() === value)
                        setFormData({
                          ...formData,
                          perfilId: value ? parseInt(value, 10) : undefined,
                          perfil: perfilSelecionadoAtual?.perfil ?? ''
                        })
                      }}
                      required
                      disabled={carregandoPerfis}
                    >
                      <SelectTrigger id="perfil">
                        <SelectValue placeholder={carregandoPerfis ? 'Carregando perfis...' : 'Selecione um perfil'}>
                          {perfilSelecionado?.perfil ?? formData.perfil}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {perfis.map((perfil) => (
                          <SelectItem
                            key={perfil.perfil_id}
                            value={perfil.perfil_id.toString()}
                            title={perfil.observacao ?? undefined}
                          >
                            <div className="flex flex-col">
                              <span>{perfil.perfil}</span>
                              {perfil.observacao && (
                                <span className="text-xs text-gray-500">{perfil.observacao}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {erroPerfis && (
                      <p className="text-xs text-red-500">
                        {erroPerfis}
                      </p>
                    )}
                    {!carregandoPerfis && !erroPerfis && perfis.length === 0 && (
                      <p className="text-xs text-amber-600">
                        Nenhum perfil disponível para esta aplicação.
                      </p>
                    )}
                  </div>
                </div>

                {/* Descrição dos perfis */}
                <div className="p-4 bg-gray-50 border rounded-md mt-4">
                  <h4 className="text-sm font-medium mb-2">Níveis de Acesso:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {perfis.map((perfil) => (
                      <div key={perfil.perfil_id} className="flex items-start gap-2">
                        <span className="font-medium text-gray-700">{perfil.perfil}:</span>
                        <span className="text-gray-600">{perfil.observacao || 'Sem observação cadastrada.'}</span>
                      </div>
                    ))}
                    {!carregandoPerfis && !erroPerfis && perfis.length === 0 && (
                      <span className="text-gray-600">Nenhum perfil encontrado para exibição.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog de confirmação de exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o usuário <strong>{formData.usuario}</strong>?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  )
}
