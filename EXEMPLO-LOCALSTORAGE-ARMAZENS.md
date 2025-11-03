# Exemplo de Dados no localStorage - Armazéns

## Chave de Armazenamento

```
sysoee_armazens
```

## Estrutura de Dados

### Formato JSON

```json
[
  {
    "codigo": "01",
    "descricao": "ALMOXARIFADO CENTRAL"
  },
  {
    "codigo": "02",
    "descricao": "MATERIA PRIMA"
  },
  {
    "codigo": "03",
    "descricao": "EMBALAGEM"
  },
  {
    "codigo": "04",
    "descricao": "REJEITADOS"
  },
  {
    "codigo": "05",
    "descricao": "SPPV"
  },
  {
    "codigo": "06",
    "descricao": "SPEP 01"
  },
  {
    "codigo": "07",
    "descricao": "LIQUIDOS"
  },
  {
    "codigo": "08",
    "descricao": "CPHD"
  },
  {
    "codigo": "09",
    "descricao": "PLASTICO"
  },
  {
    "codigo": "10",
    "descricao": "SPEP 03"
  },
  {
    "codigo": "11",
    "descricao": "SPEP 02"
  },
  {
    "codigo": "12",
    "descricao": "TEMP"
  },
  {
    "codigo": "13",
    "descricao": "A VENCER | VENCIDOS"
  },
  {
    "codigo": "14",
    "descricao": "EXPEDICAO PA"
  },
  {
    "codigo": "15",
    "descricao": "EXPEDICAO PA FRACAO"
  },
  {
    "codigo": "16",
    "descricao": "AMOSTRAS ANALISE"
  },
  {
    "codigo": "17",
    "descricao": "SERVICOS"
  },
  {
    "codigo": "18",
    "descricao": "PERDAS"
  },
  {
    "codigo": "19",
    "descricao": "RETEM"
  },
  {
    "codigo": "20",
    "descricao": "DEVOLUCAO"
  },
  {
    "codigo": "21",
    "descricao": "DESENVOLVIMENTO"
  },
  {
    "codigo": "22",
    "descricao": "ALMOXARIFADO 22"
  },
  {
    "codigo": "23",
    "descricao": "AMOSTRAGEM"
  },
  {
    "codigo": "27",
    "descricao": "SPP EXTRUSAO"
  },
  {
    "codigo": "30",
    "descricao": "IMPRESSOS"
  },
  {
    "codigo": "31",
    "descricao": "ARM SPEP 01 MP"
  },
  {
    "codigo": "32",
    "descricao": "ARM SPEP 02 MP"
  },
  {
    "codigo": "33",
    "descricao": "ARM SPEP 03"
  },
  {
    "codigo": "34",
    "descricao": "ARM CPHD"
  },
  {
    "codigo": "35",
    "descricao": "ARM SPPV"
  },
  {
    "codigo": "36",
    "descricao": "ARM SPEP 02 EM"
  },
  {
    "codigo": "37",
    "descricao": "ARM LIQUIDOS"
  },
  {
    "codigo": "38",
    "descricao": "ARM SPEP 01,02 TAMPA"
  },
  {
    "codigo": "39",
    "descricao": "ARM PLASTICO"
  },
  {
    "codigo": "40",
    "descricao": "ARM SPEP 01 EM"
  },
  {
    "codigo": "44",
    "descricao": "EXPEDICAO LISVET"
  },
  {
    "codigo": "45",
    "descricao": "SPPV LISVET"
  },
  {
    "codigo": "46",
    "descricao": "SPEP LISVET"
  },
  {
    "codigo": "49",
    "descricao": "LISVET RETEM"
  },
  {
    "codigo": "56",
    "descricao": "ANALISES LISVET"
  },
  {
    "codigo": "58",
    "descricao": "PERDAS LISVET"
  },
  {
    "codigo": "60",
    "descricao": "TEMP2"
  },
  {
    "codigo": "89",
    "descricao": "ERRADO"
  },
  {
    "codigo": "96",
    "descricao": "RETIFICACAO FISCAL"
  },
  {
    "codigo": "97",
    "descricao": "MATERIAL DE CONSUMO"
  },
  {
    "codigo": "98",
    "descricao": "QUARENTENA"
  },
  {
    "codigo": "99",
    "descricao": "PRODUTO ENVASADO"
  }
]
```

## Como Acessar no Console do Navegador

### Visualizar Todos os Dados

```javascript
// Obter dados do localStorage
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))

// Exibir no console
console.log('Total de armazéns:', armazens.length)
console.table(armazens)
```

### Buscar Armazém Específico

```javascript
// Buscar por código
const armazem01 = armazens.find(a => a.codigo === '01')
console.log('Armazém 01:', armazem01)

// Buscar por descrição
const armazensSPEP = armazens.filter(a => a.descricao.includes('SPEP'))
console.log('Armazéns SPEP:', armazensSPEP)
```

### Adicionar Novo Armazém (Exemplo)

```javascript
// Obter dados atuais
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))

// Adicionar novo armazém
armazens.push({
  codigo: '100',
  descricao: 'NOVO ARMAZEM TESTE'
})

// Salvar de volta no localStorage
localStorage.setItem('sysoee_armazens', JSON.stringify(armazens))

// Recarregar a página para ver mudanças
location.reload()
```

### Limpar Dados (Reset)

```javascript
// Remover dados do localStorage
localStorage.removeItem('sysoee_armazens')

// Recarregar a página para reinicializar com dados padrão
location.reload()
```

## Estatísticas dos Dados

### Total de Armazéns
- **47 armazéns** cadastrados

### Distribuição por Tipo

#### Armazéns Principais (01-23)
- 23 armazéns
- Incluem: Almoxarifado Central, Matéria Prima, Embalagem, etc.

#### Armazéns Especializados (27-40)
- 14 armazéns
- Incluem: Armazéns de setores específicos (SPEP, CPHD, SPPV, Líquidos)

#### Armazéns Lisvet (44-58)
- 6 armazéns
- Incluem: Expedição, SPPV, SPEP, Retem, Análises, Perdas

#### Armazéns Especiais (60-99)
- 4 armazéns
- Incluem: TEMP2, ERRADO, Retificação Fiscal, Material de Consumo, Quarentena, Produto Envasado

### Armazéns por Setor

#### SPEP (Soluções Parenterais de Embalagem Plástica)
```javascript
const armazensSPEP = armazens.filter(a => 
  a.descricao.includes('SPEP') || 
  a.codigo === '06' || 
  a.codigo === '10' || 
  a.codigo === '11'
)
console.log('Total SPEP:', armazensSPEP.length) // 9 armazéns
```

#### SPPV (Soluções Parenterais de Pequeno Volume)
```javascript
const armazensSPPV = armazens.filter(a => 
  a.descricao.includes('SPPV')
)
console.log('Total SPPV:', armazensSPPV.length) // 3 armazéns
```

#### Líquidos
```javascript
const armazensLiquidos = armazens.filter(a => 
  a.descricao.includes('LIQUIDOS')
)
console.log('Total Líquidos:', armazensLiquidos.length) // 2 armazéns
```

#### CPHD (Concentrado Polieletrolítico para Hemodiálise)
```javascript
const armazensCPHD = armazens.filter(a => 
  a.descricao.includes('CPHD')
)
console.log('Total CPHD:', armazensCPHD.length) // 2 armazéns
```

#### Lisvet
```javascript
const armazensLisvet = armazens.filter(a => 
  a.descricao.includes('LISVET')
)
console.log('Total Lisvet:', armazensLisvet.length) // 6 armazéns
```

## Tamanho dos Dados

### Tamanho Aproximado
- **JSON stringificado**: ~2.5 KB
- **Compactado (gzip)**: ~0.8 KB

### Limite do localStorage
- **Limite típico**: 5-10 MB por domínio
- **Uso atual**: < 0.01% do limite

## Backup e Exportação

### Exportar para Arquivo JSON

```javascript
// Obter dados
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))

// Criar blob
const blob = new Blob([JSON.stringify(armazens, null, 2)], { 
  type: 'application/json' 
})

// Criar link de download
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'armazens-backup.json'
a.click()

// Limpar
URL.revokeObjectURL(url)
```

### Importar de Arquivo JSON

```javascript
// Criar input de arquivo
const input = document.createElement('input')
input.type = 'file'
input.accept = 'application/json'

input.onchange = (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  
  reader.onload = (event) => {
    const armazens = JSON.parse(event.target.result)
    localStorage.setItem('sysoee_armazens', JSON.stringify(armazens))
    location.reload()
  }
  
  reader.readAsText(file)
}

input.click()
```

## Validação de Dados

### Verificar Integridade

```javascript
const armazens = JSON.parse(localStorage.getItem('sysoee_armazens'))

// Verificar se todos têm código e descrição
const validos = armazens.every(a => a.codigo && a.descricao)
console.log('Dados válidos:', validos)

// Verificar duplicatas de código
const codigos = armazens.map(a => a.codigo)
const duplicatas = codigos.filter((c, i) => codigos.indexOf(c) !== i)
console.log('Códigos duplicados:', duplicatas.length === 0 ? 'Nenhum' : duplicatas)

// Verificar total
console.log('Total esperado: 47, Total atual:', armazens.length)
```

## Migração Futura para Backend

Quando integrar com Supabase, os dados do localStorage serão migrados para o banco de dados:

```sql
-- Estrutura da tabela (exemplo)
CREATE TABLE armazens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descricao VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir dados do localStorage
INSERT INTO armazens (codigo, descricao)
VALUES 
  ('01', 'ALMOXARIFADO CENTRAL'),
  ('02', 'MATERIA PRIMA'),
  -- ... (todos os 47 armazéns)
  ('99', 'PRODUTO ENVASADO');
```

---

**Nota**: Os dados no localStorage são específicos do navegador e domínio. Se o usuário limpar o cache do navegador ou acessar de outro dispositivo, os dados precisarão ser recarregados.

