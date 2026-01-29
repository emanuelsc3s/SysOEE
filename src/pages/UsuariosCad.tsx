/**
 * Página de Cadastro/Edição de Usuário
 * Formulário completo para criar ou editar usuários
 */

import { useState, useEffect, useCallback } from 'react'
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
import {
  UsuarioCreateData,
  USUARIO_CREATE_INITIAL_VALUES,
  PERFIL_OPTIONS,
  isValidEmail,
  isStrongPassword,
  passwordsMatch
} from '@/types/usuario'
import { toast } from '@/hooks/use-toast'
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
  XCircle
} from 'lucide-react'

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
    checkEmailExists
  } = useUsuarios()

  const isEdicao = id && id !== 'novo'

  // Estado do formulário
  const [formData, setFormData] = useState<UsuarioCreateData>(USUARIO_CREATE_INITIAL_VALUES)

  // Estados de UI
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados de validação assíncrona
  const [loginValidation, setLoginValidation] = useState<{ checking: boolean; exists: boolean }>({
    checking: false,
    exists: false
  })
  const [emailValidation, setEmailValidation] = useState<{ checking: boolean; exists: boolean }>({
    checking: false,
    exists: false
  })

  // Validação de senha em tempo real
  const passwordValidation = isStrongPassword(formData.senha ?? '')
  const passwordsMatchResult = passwordsMatch(formData.senha ?? '', formData.confirmarSenha ?? '')

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
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      navigate('/usuarios')
    }
  }, [fetchUsuario, id, navigate])

  // Carregar dados ao montar (modo edição)
  useEffect(() => {
    if (isEdicao) {
      loadData()
    }
  }, [isEdicao, loadData])

  // Validação assíncrona de login
  useEffect(() => {
    if (!formData.login || formData.login.length < 3) {
      setLoginValidation({ checking: false, exists: false })
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoginValidation({ checking: true, exists: false })
      const exists = await checkLoginExists(formData.login, formData.id)
      setLoginValidation({ checking: false, exists })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.login, formData.id, checkLoginExists])

  // Validação assíncrona de email (apenas em criação)
  useEffect(() => {
    if (!formData.email || !isValidEmail(formData.email) || isEdicao) {
      setEmailValidation({ checking: false, exists: false })
      return
    }

    const timeoutId = setTimeout(async () => {
      setEmailValidation({ checking: true, exists: false })
      const exists = await checkEmailExists(formData.email, formData.id)
      setEmailValidation({ checking: false, exists })
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.email, formData.id, isEdicao, checkEmailExists])

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

        if (!isValidEmail(formData.email)) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'O email informado não é válido',
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

        if (emailValidation.exists) {
          toast({
            variant: 'destructive',
            title: 'Validação',
            description: 'Este email já está em uso',
          })
          return
        }
      }

      // Validação de login duplicado
      if (loginValidation.exists) {
        toast({
          variant: 'destructive',
          title: 'Validação',
          description: 'Este login já está em uso',
        })
        return
      }

      // Salvar
      if (isEdicao) {
        await updateUsuario(formData)
      } else {
        await createUsuario(formData)
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
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 pb-0 max-w-none">
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Matrícula do Funcionário */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="matricula">Matrícula do Funcionário</Label>
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
                    {formData.login && formData.login.length >= 3 && !loginValidation.checking && !loginValidation.exists && (
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
                    <div className="space-y-2 md:col-span-5">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      {formData.email && !isValidEmail(formData.email) && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Email inválido
                        </p>
                      )}
                      {emailValidation.checking && (
                        <p className="text-sm text-gray-500">Verificando disponibilidade...</p>
                      )}
                      {emailValidation.exists && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Este email já está em uso
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
                    <Label htmlFor="perfil">Perfil</Label>
                    <Select
                      value={formData.perfilId?.toString() || ''}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        perfilId: value ? parseInt(value) : undefined
                      })}
                    >
                      <SelectTrigger id="perfil">
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFIL_OPTIONS.map((perfil) => (
                          <SelectItem key={perfil.value} value={perfil.value.toString()}>
                            <div className="flex flex-col">
                              <span>{perfil.label}</span>
                              <span className="text-xs text-gray-500">{perfil.descricao}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Descrição dos perfis */}
                <div className="p-4 bg-gray-50 border rounded-md mt-4">
                  <h4 className="text-sm font-medium mb-2">Níveis de Acesso:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {PERFIL_OPTIONS.map((perfil) => (
                      <div key={perfil.value} className="flex items-start gap-2">
                        <span className="font-medium text-gray-700">{perfil.label}:</span>
                        <span className="text-gray-600">{perfil.descricao}</span>
                      </div>
                    ))}
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
