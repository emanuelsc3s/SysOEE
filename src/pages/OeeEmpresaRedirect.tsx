import { useEffect } from 'react'

/**
 * Redireciona para a página estática OEE Total Empresa com carregamento completo
 * (window.location) para que o servidor sirva o HTML e a página carregue corretamente.
 * Navigate do React Router faria apenas navegação client-side e a URL .html cairia no 404.
 */
export default function OeeEmpresaRedirect() {
  useEffect(() => {
    window.location.href = '/oee-empresa.html'
  }, [])

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      Carregando OEE Empresa…
    </div>
  )
}
