/**
 * API de Colaboradores e Treinamentos
 * Funções para interagir com dados de colaboradores e seus treinamentos em POs
 */

import { Colaborador, Treinamento, calcularStatusTreinamento } from '@/types/colaborador'

// Flag para usar dados mock (desenvolvimento)
const USE_MOCK_DATA = true

// Chave do localStorage para colaboradores
const COLABORADORES_STORAGE_KEY = 'sysoee_colaboradores'
const TREINAMENTOS_STORAGE_KEY = 'sysoee_treinamentos'

/**
 * Dados mock de colaboradores
 */
const MOCK_COLABORADORES: Colaborador[] = [
  {
    id: '000648',
    nome: 'Cícero Emanuel da Silva',
    cargo: 'Gerente de Tecnologia',
    setor: 'TI',
    email: 'emanuel@farmace.com.br',
    dataAdmissao: '2007-02-01',
    fotoUrl: '/Emanuel.jpeg'
  },
  {
    id: '000649',
    nome: 'Maria Oliveira Costa',
    cargo: 'Técnica de Qualidade',
    setor: 'SPPV',
    email: 'maria.oliveira@farmace.com.br',
    dataAdmissao: '2019-07-22'
  },
  {
    id: '000650',
    nome: 'Carlos Eduardo Pereira',
    cargo: 'Supervisor de Produção',
    setor: 'Líquidos',
    email: 'carlos.pereira@farmace.com.br',
    dataAdmissao: '2015-01-10'
  }
]

/**
 * Dados mock de treinamentos
 */
const MOCK_TREINAMENTOS: Treinamento[] = [
  // Colaborador 000648 - João Silva Santos
  {
    id: 'trein-001',
    codigoPO: 'PO-SPEP-001',
    tituloPO: 'Procedimento de Higienização de Equipamentos',
    versao: 'v2.3',
    status: 'Concluído',
    dataConclusao: '2024-01-15',
    dataValidade: '2025-01-15',
    cargaHoraria: 4,
    certificadoUrl: 'https://example.com/certificados/trein-001.pdf',
    colaboradorId: '000648'
  },
  {
    id: 'trein-002',
    codigoPO: 'PO-SPEP-002',
    tituloPO: 'Operação de Linha de Envase Automática',
    versao: 'v3.1',
    status: 'Concluído',
    dataConclusao: '2024-02-20',
    dataValidade: '2025-02-20',
    cargaHoraria: 8,
    certificadoUrl: 'https://example.com/certificados/trein-002.pdf',
    colaboradorId: '000648'
  },
  {
    id: 'trein-003',
    codigoPO: 'PO-SPEP-003',
    tituloPO: 'Controle de Qualidade em Processo',
    versao: 'v1.5',
    status: 'Pendente',
    dataValidade: '2025-06-30',
    cargaHoraria: 6,
    colaboradorId: '000648'
  },
  {
    id: 'trein-004',
    codigoPO: 'PO-SPEP-004',
    tituloPO: 'Boas Práticas de Fabricação (BPF)',
    versao: 'v4.0',
    status: 'Vencido',
    dataValidade: '2024-10-01',
    cargaHoraria: 12,
    colaboradorId: '000648'
  },
  {
    id: 'trein-005',
    codigoPO: 'PO-SPEP-005',
    tituloPO: 'Segurança no Trabalho e EPI',
    versao: 'v2.0',
    status: 'Pendente',
    dataValidade: '2025-03-15',
    cargaHoraria: 4,
    colaboradorId: '000648'
  },
  {
    id: 'trein-006',
    codigoPO: 'PO-SPEP-006',
    tituloPO: 'Manuseio de Produtos Químicos',
    versao: 'v1.8',
    status: 'Concluído',
    dataConclusao: '2024-09-10',
    dataValidade: '2025-09-10',
    cargaHoraria: 6,
    certificadoUrl: 'https://example.com/certificados/trein-006.pdf',
    colaboradorId: '000648'
  },
  {
    id: 'trein-007',
    codigoPO: 'PO-SPEP-007',
    tituloPO: 'Procedimento de Esterilização',
    versao: 'v2.5',
    status: 'Vencido',
    dataValidade: '2024-08-20',
    cargaHoraria: 8,
    colaboradorId: '000648'
  },
  {
    id: 'trein-008',
    codigoPO: 'PO-SPEP-008',
    tituloPO: 'Registro de Desvios e Não Conformidades',
    versao: 'v1.2',
    status: 'Pendente',
    dataValidade: '2025-04-10',
    cargaHoraria: 3,
    colaboradorId: '000648'
  },
  {
    id: 'trein-009',
    codigoPO: 'PO-SPEP-009',
    tituloPO: 'Calibração de Instrumentos de Medição',
    versao: 'v3.0',
    status: 'Concluído',
    dataConclusao: '2024-11-05',
    dataValidade: '2025-11-05',
    cargaHoraria: 5,
    colaboradorId: '000648'
  },
  {
    id: 'trein-010',
    codigoPO: 'PO-SPEP-010',
    tituloPO: 'Gestão de Resíduos Farmacêuticos',
    versao: 'v2.1',
    status: 'Pendente',
    dataValidade: '2025-05-20',
    cargaHoraria: 4,
    colaboradorId: '000648'
  },

  // Colaborador 000649 - Maria Oliveira Costa
  {
    id: 'trein-011',
    codigoPO: 'PO-SPPV-001',
    tituloPO: 'Inspeção Visual de Ampolas',
    versao: 'v1.9',
    status: 'Concluído',
    dataConclusao: '2024-03-10',
    dataValidade: '2025-03-10',
    cargaHoraria: 6,
    certificadoUrl: 'https://example.com/certificados/trein-011.pdf',
    colaboradorId: '000649'
  },
  {
    id: 'trein-012',
    codigoPO: 'PO-SPPV-002',
    tituloPO: 'Controle de Qualidade Microbiológico',
    versao: 'v2.4',
    status: 'Pendente',
    dataValidade: '2025-07-15',
    cargaHoraria: 10,
    colaboradorId: '000649'
  },

  // Colaborador 000650 - Carlos Eduardo Pereira
  {
    id: 'trein-013',
    codigoPO: 'PO-LIQ-001',
    tituloPO: 'Supervisão de Linha de Líquidos Orais',
    versao: 'v3.2',
    status: 'Concluído',
    dataConclusao: '2024-01-20',
    dataValidade: '2025-01-20',
    cargaHoraria: 12,
    certificadoUrl: 'https://example.com/certificados/trein-013.pdf',
    colaboradorId: '000650'
  },
  {
    id: 'trein-014',
    codigoPO: 'PO-LIQ-002',
    tituloPO: 'Gestão de Equipes e Liderança',
    versao: 'v1.0',
    status: 'Pendente',
    dataValidade: '2025-08-30',
    cargaHoraria: 16,
    colaboradorId: '000650'
  }
]

/**
 * Inicializa dados mock no localStorage se não existirem
 */
function inicializarDadosMock(): void {
  // TEMPORÁRIO: Força atualização dos dados (remover após primeira execução)
  localStorage.removeItem(COLABORADORES_STORAGE_KEY)
  localStorage.removeItem(TREINAMENTOS_STORAGE_KEY)

  if (!localStorage.getItem(COLABORADORES_STORAGE_KEY)) {
    localStorage.setItem(COLABORADORES_STORAGE_KEY, JSON.stringify(MOCK_COLABORADORES))
    console.log('✅ Colaboradores mock inicializados no localStorage')
  }

  if (!localStorage.getItem(TREINAMENTOS_STORAGE_KEY)) {
    // Recalcula status baseado nas datas antes de salvar
    const treinamentosAtualizados = MOCK_TREINAMENTOS.map(t => ({
      ...t,
      status: calcularStatusTreinamento(t.dataConclusao, t.dataValidade)
    }))
    localStorage.setItem(TREINAMENTOS_STORAGE_KEY, JSON.stringify(treinamentosAtualizados))
    console.log('✅ Treinamentos mock inicializados no localStorage')
  }
}

/**
 * Extensão da interface Window para incluir função de desenvolvimento
 */
declare global {
  interface Window {
    reinicializarDadosMock?: () => void
  }
}

/**
 * Função auxiliar para reinicializar dados mock (útil durante desenvolvimento)
 * Execute no console: window.reinicializarDadosMock()
 */
if (typeof window !== 'undefined') {
  window.reinicializarDadosMock = () => {
    localStorage.removeItem(COLABORADORES_STORAGE_KEY)
    localStorage.removeItem(TREINAMENTOS_STORAGE_KEY)
    console.log('🔄 Cache limpo! Recarregue a página para ver os novos dados.')
  }
}

/**
 * Busca perfil de um colaborador por ID
 * @param colaboradorId - ID do colaborador (matrícula)
 * @returns Dados do colaborador ou null se não encontrado
 */
export async function buscarColaborador(colaboradorId: string): Promise<Colaborador | null> {
  // Modo mock para desenvolvimento
  if (USE_MOCK_DATA) {
    console.log('🔧 Buscando colaborador mock:', colaboradorId)
    
    // Inicializa dados se necessário
    inicializarDadosMock()

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const dados = localStorage.getItem(COLABORADORES_STORAGE_KEY)
          if (!dados) {
            resolve(null)
            return
          }

          const colaboradores = JSON.parse(dados) as Colaborador[]
          const colaborador = colaboradores.find(c => c.id === colaboradorId)
          resolve(colaborador || null)
        } catch (error) {
          console.error('Erro ao buscar colaborador:', error)
          resolve(null)
        }
      }, 500) // Simula delay de rede
    })
  }

  // TODO: Implementar chamada real ao Supabase
  throw new Error('Integração com Supabase não implementada')
}

/**
 * Busca treinamentos de um colaborador
 * @param colaboradorId - ID do colaborador
 * @returns Lista de treinamentos
 */
export async function buscarTreinamentos(colaboradorId: string): Promise<Treinamento[]> {
  // Modo mock para desenvolvimento
  if (USE_MOCK_DATA) {
    console.log('🔧 Buscando treinamentos mock para colaborador:', colaboradorId)
    
    // Inicializa dados se necessário
    inicializarDadosMock()

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const dados = localStorage.getItem(TREINAMENTOS_STORAGE_KEY)
          if (!dados) {
            resolve([])
            return
          }

          const treinamentos = JSON.parse(dados) as Treinamento[]
          const treinamentosColaborador = treinamentos
            .filter(t => t.colaboradorId === colaboradorId)
            .map(t => ({
              ...t,
              // Recalcula status baseado nas datas atuais
              status: calcularStatusTreinamento(t.dataConclusao, t.dataValidade)
            }))
          
          resolve(treinamentosColaborador)
        } catch (error) {
          console.error('Erro ao buscar treinamentos:', error)
          resolve([])
        }
      }, 700) // Simula delay de rede
    })
  }

  // TODO: Implementar chamada real ao Supabase
  throw new Error('Integração com Supabase não implementada')
}

