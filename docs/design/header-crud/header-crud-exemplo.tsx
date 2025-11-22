/**
 * Header CRUD - Exemplo de Implementação
 * 
 * Este componente demonstra como implementar o cabeçalho padrão
 * para formulários CRUD no sistema APFAR.
 * 
 * @example
 * // Modo de criação (novo registro)
 * <CrudHeader
 *   title="Cadastro de Licitação"
 *   subtitle="Registre uma nova licitação"
 *   onBack={() => navigate('/licitacoes')}
 *   onSave={handleSave}
 *   showDelete={false}
 * />
 * 
 * @example
 * // Modo de edição (registro existente)
 * <CrudHeader
 *   title="Licitação Número: [49666]"
 *   subtitle="Edite os dados da licitação"
 *   onBack={() => navigate('/licitacoes')}
 *   onDelete={() => setShowDeleteDialog(true)}
 *   onSave={handleSave}
 *   isSaving={isLoading}
 * />
 */

import React from 'react';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface CrudHeaderProps {
  /** Título principal do cabeçalho (dinâmico baseado no contexto) */
  title: string;
  
  /** Subtítulo descritivo */
  subtitle?: string;
  
  /** Callback executado ao clicar no botão Voltar */
  onBack: () => void;
  
  /** Callback executado ao clicar no botão Excluir */
  onDelete?: () => void;
  
  /** Callback executado ao clicar no botão Salvar */
  onSave: () => void;
  
  /** Indica se está salvando (desabilita botão e mostra texto de carregamento) */
  isSaving?: boolean;
  
  /** Controla visibilidade do botão Excluir */
  showDelete?: boolean;
  
  /** Texto customizado para o botão Salvar */
  saveButtonText?: string;
  
  /** Texto customizado para o botão Salvar durante carregamento */
  savingButtonText?: string;
  
  /** Classes CSS adicionais para o container */
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CrudHeader: React.FC<CrudHeaderProps> = ({
  title,
  subtitle = 'Registre uma nova licitação ou edite existente',
  onBack,
  onDelete,
  onSave,
  isSaving = false,
  showDelete = true,
  saveButtonText = 'Salvar',
  savingButtonText = 'Salvando...',
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* ====================================================================
          SEÇÃO ESQUERDA - INFORMAÇÕES
          ==================================================================== */}
      <div className="flex items-center gap-2">
        <div>
          {/* Título Principal */}
          <h1 className="text-2xl font-bold text-brand-primary">
            {title}
          </h1>
          
          {/* Subtítulo */}
          {subtitle && (
            <p className="text-brand-text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ====================================================================
          SEÇÃO DIREITA - AÇÕES
          ==================================================================== */}
      <div className="flex gap-2">
        {/* Botão Voltar */}
        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-100 min-w-[120px] justify-center"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Botão Excluir (condicional) */}
        {showDelete && onDelete && (
          <Button
            variant="destructive"
            className="min-w-[120px] justify-center"
            onClick={onDelete}
            type="button"
          >
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        )}

        {/* Botão Salvar */}
        <Button
          type="button"
          className="bg-brand-primary hover:bg-brand-primary/90 min-w-[120px] justify-center"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? savingButtonText : saveButtonText}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// VARIANTE MOBILE - BOTÕES FLUTUANTES
// ============================================================================

interface MobileCrudActionsProps {
  onBack: () => void;
  onDelete?: () => void;
  onSave: () => void;
  isSaving?: boolean;
  showDelete?: boolean;
}

export const MobileCrudActions: React.FC<MobileCrudActionsProps> = ({
  onBack,
  onDelete,
  onSave,
  isSaving = false,
  showDelete = true,
}) => {
  return (
    <div className="fixed bottom-4 right-4 left-4 z-10 md:hidden">
      <div className="bg-white rounded-lg shadow-lg p-3 flex justify-between gap-2">
        {/* Botão Voltar */}
        <Button
          variant="outline"
          className="border-gray-300 hover:bg-gray-100 flex-1 justify-center"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Botão Excluir (condicional) */}
        {showDelete && onDelete && (
          <Button
            variant="destructive"
            className="flex-1 justify-center"
            onClick={onDelete}
            type="button"
          >
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        )}

        {/* Botão Salvar */}
        <Button
          type="button"
          className="bg-brand-primary hover:bg-brand-primary/90 flex-1 justify-center"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// EXEMPLO DE USO COMPLETO
// ============================================================================

export const ExemploUsoCompleto: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Lógica de salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleBack = () => {
    // Verificar se há alterações não salvas
    const hasUnsavedChanges = true; // Lógica de verificação
    
    if (hasUnsavedChanges) {
      // Mostrar diálogo de confirmação
      console.log('Mostrar diálogo: Deseja sair sem salvar?');
    } else {
      // Navegar de volta
      console.log('Navegando de volta...');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Desktop */}
      <CrudHeader
        title="Licitação Número: [49666]"
        subtitle="Registre uma nova licitação ou edite existente"
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        isSaving={isLoading}
        showDelete={true}
      />

      {/* Conteúdo do formulário */}
      <div className="space-y-4">
        {/* Seus campos de formulário aqui */}
      </div>

      {/* Botões Mobile Flutuantes */}
      <MobileCrudActions
        onBack={handleBack}
        onDelete={handleDelete}
        onSave={handleSave}
        isSaving={isLoading}
        showDelete={true}
      />
    </div>
  );
};

export default CrudHeader;

