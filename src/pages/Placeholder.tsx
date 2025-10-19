import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PlaceholderProps {
  title: string
  description?: string
}

/**
 * Componente placeholder genérico para páginas em desenvolvimento
 */
export default function Placeholder({ title, description }: PlaceholderProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Home
        </Button>

        <h1 className="text-3xl font-bold text-primary mb-4">{title}</h1>
        
        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Página em Desenvolvimento
            </h2>
            <p className="text-muted-foreground mb-6">
              {description || `A página ${title} está sendo desenvolvida e estará disponível em breve.`}
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar para Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

